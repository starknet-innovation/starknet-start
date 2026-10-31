#!/usr/bin/env node

// Writes Beachball change files for a Dependabot pull request and commits them
// on top of the pull request head. The pull request is only read as git
// objects and the commit is built with git plumbing, so nothing from the pull
// request is checked out, installed or executed.
//
// Usage: node .github/scripts/dependabot-change-files.mjs --base <sha> --head <sha> [--dry-run]
// Prints the new commit SHA, or nothing when no change files are needed.

import { spawnSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, posix } from "node:path";
import { parseArgs } from "node:util";

const changeDir = "change";
const dependabotEmail = "49699333+dependabot[bot]@users.noreply.github.com";

// Beachball never treats these as package changes, whatever ignorePatterns says.
const defaultIgnorePatterns = [`${changeDir}/*.json`, "CHANGELOG.{md,json}"];
const dependencyFields = ["dependencies", "peerDependencies", "optionalDependencies", "devDependencies"];

const { values } = parseArgs({
  options: {
    base: { type: "string" },
    head: { type: "string" },
    "dry-run": { type: "boolean", default: false },
  },
});
const { base, head, "dry-run": dryRun } = values;

if (!base || !head) {
  throw new Error("Usage: dependabot-change-files.mjs --base <sha> --head <sha> [--dry-run]");
}

function run(command, args, { allowFailure = false, env, input } = {}) {
  const result = spawnSync(command, args, {
    encoding: "utf8",
    env: { ...process.env, ...env },
    input,
    stdio: ["pipe", "pipe", "pipe"],
  });

  if (!allowFailure && result.status !== 0) {
    const output = [result.stdout, result.stderr].filter(Boolean).join("\n");
    throw new Error(`${command} ${args.join(" ")} failed\n${output}`);
  }

  return result;
}

function git(args, options) {
  return run("git", args, options).stdout.trim();
}

function readTextAtRef(ref, path) {
  const result = run("git", ["show", `${ref}:${path}`], { allowFailure: true });

  return result.status === 0 ? result.stdout : null;
}

function readJsonAtRef(ref, path) {
  const text = readTextAtRef(ref, path);

  return text === null ? null : JSON.parse(text);
}

// Reads the literal `packages:` entries of pnpm-workspace.yaml. Globs are
// rejected rather than guessed at, so a layout change fails loudly here.
function readWorkspaceDirs(ref) {
  const dirs = [];
  let inPackages = false;

  for (const line of (readTextAtRef(ref, "pnpm-workspace.yaml") ?? "").split(/\r?\n/)) {
    if (/^\S/.test(line)) {
      inPackages = /^packages:\s*$/.test(line);
      continue;
    }

    const entry = inPackages && line.match(/^\s+-\s+["']?([^"'#\s]+)["']?/);

    if (!entry) {
      continue;
    }

    if (/[*!{]/.test(entry[1])) {
      throw new Error(`Unsupported workspace pattern "${entry[1]}" in pnpm-workspace.yaml`);
    }

    dirs.push(entry[1].replace(/\/$/, ""));
  }

  if (dirs.length === 0) {
    throw new Error("No workspace packages found in pnpm-workspace.yaml");
  }

  return dirs;
}

// Same semantics as Beachball's minimatch `matchBase` option: patterns without a
// slash match the file's basename.
function isIgnored(file, patterns) {
  return patterns.some((pattern) => posix.matchesGlob(pattern.includes("/") ? file : posix.basename(file), pattern));
}

function packageForFile(file, packagesByDir) {
  for (let dir = posix.dirname(file); dir !== "."; dir = posix.dirname(dir)) {
    if (packagesByDir.has(dir)) {
      return packagesByDir.get(dir);
    }
  }

  return undefined;
}

function packagesWithChangeFiles(from, to) {
  const added = git(["diff", "--name-only", "--no-renames", "--diff-filter=A", from, to, "--", `${changeDir}/*.json`]);
  const names = new Set();

  for (const file of added.split("\n").filter(Boolean)) {
    const changeInfo = readJsonAtRef(to, file);

    for (const change of changeInfo.changes ?? [changeInfo]) {
      names.add(change.packageName);
    }
  }

  return names;
}

// `none` only when the package's own package.json changed and nothing outside
// devDependencies moved; anything else can reach consumers, so it is a patch.
function changeTypeFor(pkg, files, from, to) {
  const manifestPath = `${pkg.dir}/package.json`;

  if (files.some((file) => file !== manifestPath)) {
    return "patch";
  }

  const before = readJsonAtRef(from, manifestPath) ?? {};
  const after = readJsonAtRef(to, manifestPath) ?? {};
  const fields = new Set([...Object.keys(before), ...Object.keys(after)]);
  fields.delete("devDependencies");

  return [...fields].some((field) => JSON.stringify(before[field]) !== JSON.stringify(after[field])) ? "patch" : "none";
}

function commentFor(pkg, files, from, to) {
  const bumps = files
    .filter((file) => posix.basename(file) === "package.json")
    .flatMap((file) => {
      const before = readJsonAtRef(from, file) ?? {};
      const after = readJsonAtRef(to, file) ?? {};
      const manifestDir = posix.dirname(file);
      const location = manifestDir === pkg.dir ? "" : ` in ${posix.relative(pkg.dir, manifestDir)}`;

      return dependencyFields.flatMap((field) =>
        Object.entries(after[field] ?? {})
          .filter(([name, version]) => before[field]?.[name] !== version)
          .map(([name, version]) => `${name} to ${version}${location}`),
      );
    });

  return bumps.length > 0 ? `Bump ${bumps.join(", ")}.` : "Update dependencies.";
}

function commitChangeFiles(parent, changeFiles, message) {
  const indexDir = mkdtempSync(join(tmpdir(), "dependabot-change-files-"));
  const env = { GIT_INDEX_FILE: join(indexDir, "index") };

  try {
    git(["read-tree", parent], { env });

    for (const { path, contents } of changeFiles) {
      const blob = git(["hash-object", "-w", "--stdin"], { input: contents });
      git(["update-index", "--add", "--cacheinfo", `100644,${blob},${path}`], { env });
    }

    const tree = git(["write-tree"], { env });

    return git(["commit-tree", tree, "-p", parent, "-m", message]);
  } finally {
    rmSync(indexDir, { recursive: true, force: true });
  }
}

const mergeBase = git(["merge-base", base, head]);
const rootPackage = readJsonAtRef(head, "package.json") ?? {};
const ignorePatterns = [...(rootPackage.beachball?.ignorePatterns ?? []), ...defaultIgnorePatterns];
const packagesByDir = new Map(
  readWorkspaceDirs(head)
    .map((dir) => [dir, readJsonAtRef(head, `${dir}/package.json`)])
    .filter(([, pkg]) => pkg)
    .map(([dir, pkg]) => [dir, { ...pkg, dir }]),
);

const filesByPackage = new Map();

for (const file of git(["diff", "--name-only", "--no-renames", mergeBase, head]).split("\n").filter(Boolean)) {
  const pkg = isIgnored(file, ignorePatterns) ? undefined : packageForFile(file, packagesByDir);

  if (!pkg || pkg.private || pkg.beachball?.shouldPublish === false) {
    continue;
  }

  filesByPackage.set(pkg, [...(filesByPackage.get(pkg) ?? []), file]);
}

const covered = packagesWithChangeFiles(mergeBase, head);
const changeFiles = [...filesByPackage]
  .filter(([pkg]) => !covered.has(pkg.name))
  .map(([pkg, files]) => {
    const type = changeTypeFor(pkg, files, mergeBase, head);
    const change = {
      type,
      comment: commentFor(pkg, files, mergeBase, head),
      packageName: pkg.name,
      email: dependabotEmail,
      dependentChangeType: type,
    };

    return {
      change,
      path: `${changeDir}/${pkg.name.replace(/[^\w@]/g, "-")}-${randomUUID()}.json`,
      contents: `${JSON.stringify(change, null, 2)}\n`,
    };
  });

// stdout is reserved for the commit SHA; everything else is logged to stderr.
if (changeFiles.length === 0) {
  console.error("No change files needed.");
  process.exit(0);
}

for (const { change, path, contents } of changeFiles) {
  console.error(`${change.packageName}: ${change.type} (${path})`);

  if (dryRun) {
    console.error(contents);
  }
}

if (!dryRun) {
  const summary = changeFiles.map(({ change }) => `- ${change.packageName}: ${change.type}`).join("\n");
  // [dependabot skip] lets Dependabot keep rebasing its branch over this commit;
  // this workflow then adds the change files again.
  const message = `chore: add Beachball change files\n\n${summary}\n\n[dependabot skip]`;

  console.log(commitChangeFiles(head, changeFiles, message));
}
