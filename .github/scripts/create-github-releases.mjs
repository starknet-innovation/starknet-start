#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const publicPackagePaths = [
  "packages/react/package.json",
  "packages/query/package.json",
  "packages/providers/package.json",
  "packages/chains/package.json",
  "packages/explorers/package.json",
  "packages/create-starknet/package.json",
];

const dryRun = process.argv.includes("--dry-run");

function run(command, args, { allowFailure = false, mutate = false } = {}) {
  if (mutate && dryRun) {
    console.log(`[dry-run] ${command} ${args.join(" ")}`);
    return { stdout: "", stderr: "", status: 0 };
  }

  const result = spawnSync(command, args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });

  if (!allowFailure && result.status !== 0) {
    const output = [result.stdout, result.stderr].filter(Boolean).join("\n");
    throw new Error(`${command} ${args.join(" ")} failed\n${output}`);
  }

  return result;
}

function readJsonAtRef(ref, path) {
  const result = run("git", ["show", `${ref}:${path}`], { allowFailure: true });

  if (result.status !== 0) {
    return null;
  }

  return JSON.parse(result.stdout);
}

function readPackage(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function tagExistsRemotely(tag) {
  const result = run("git", ["ls-remote", "--exit-code", "--tags", "origin", `refs/tags/${tag}`], {
    allowFailure: true,
  });

  return result.status === 0;
}

function tagExistsLocally(tag) {
  const result = run("git", ["rev-parse", "--verify", `refs/tags/${tag}`], {
    allowFailure: true,
  });

  return result.status === 0;
}

function releaseExists(tag) {
  if (dryRun) {
    return false;
  }

  const result = run("gh", ["release", "view", tag], {
    allowFailure: true,
  });

  return result.status === 0;
}

function changelogEntry(packageJsonPath, version) {
  const changelogPath = packageJsonPath.replace(/package\.json$/, "CHANGELOG.md");
  const changelog = readFileSync(changelogPath, "utf8");
  const lines = changelog.split(/\r?\n/);
  const start = lines.findIndex((line) => line.trim() === `## ${version}`);

  if (start === -1) {
    return `## ${version}\n\nSee the package changelog for details.`;
  }

  const end = lines.findIndex((line, index) => index > start && /^##\s+\S/.test(line));

  return lines
    .slice(start, end === -1 ? undefined : end)
    .join("\n")
    .trim();
}

function releaseNotes(pkg, packageJsonPath) {
  return [
    `npm package: https://www.npmjs.com/package/${pkg.name}`,
    "```sh",
    `npm install ${pkg.name}@${pkg.version}`,
    "```",
    changelogEntry(packageJsonPath, pkg.version),
  ].join("\n\n");
}

function createOrUpdateRelease({ tag, title, notes }) {
  const notesDir = mkdtempSync(join(tmpdir(), "starknet-start-release-"));
  const notesPath = join(notesDir, "notes.md");
  writeFileSync(notesPath, notes, { mode: 0o600 });

  try {
    if (releaseExists(tag)) {
      run("gh", ["release", "edit", tag, "--title", title, "--notes-file", notesPath], {
        mutate: true,
      });
    } else {
      run(
        "gh",
        ["release", "create", tag, "--title", title, "--notes-file", notesPath, "--verify-tag", "--latest=false"],
        { mutate: true },
      );
    }
  } finally {
    rmSync(notesDir, { recursive: true, force: true });
  }
}

function createTagIfNeeded(tag) {
  if (tagExistsRemotely(tag)) {
    return;
  }

  if (!tagExistsLocally(tag)) {
    run("git", ["tag", "-a", tag, "-m", tag], { mutate: true });
  }

  run("git", ["push", "origin", `refs/tags/${tag}`], { mutate: true });
}

const changedPackages = publicPackagePaths
  .map((packageJsonPath) => {
    const current = readPackage(packageJsonPath);
    const previous = readJsonAtRef("HEAD^", packageJsonPath);

    if (previous && current.version === previous.version) {
      return null;
    }

    return { packageJsonPath, pkg: current };
  })
  .filter(Boolean);

if (changedPackages.length === 0) {
  console.log("No public package version changes found; no GitHub releases created.");
  process.exit(0);
}

for (const { packageJsonPath, pkg } of changedPackages) {
  const tag = `${pkg.name}@${pkg.version}`;
  const title = tag;

  console.log(`Creating GitHub release for ${tag}`);
  createTagIfNeeded(tag);
  createOrUpdateRelease({
    tag,
    title,
    notes: releaseNotes(pkg, packageJsonPath),
  });
}
