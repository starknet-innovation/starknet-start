import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { docsHosting } from "../site.config.mjs";

const basePath = normalizeBasePath(process.env.GITHUB_PAGES_BASE_PATH ?? docsHosting.githubPagesBasePath);
const basePathPattern = escapeRegExp(basePath.slice(1));
const distDir = fileURLToPath(new URL("../dist/public/", import.meta.url));

for await (const file of files(distDir)) {
  if (!shouldPatch(file)) continue;

  const source = await readFile(file, "utf8");
  const patched = patch(source, file);
  if (patched !== source) await writeFile(file, patched);
}

function normalizeBasePath(value) {
  let basePath = value.trim();
  if (!basePath) return "";
  if (!basePath.startsWith("/")) basePath = `/${basePath}`;
  return basePath.endsWith("/") ? basePath.slice(0, -1) : basePath;
}

async function* files(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* files(path);
    else yield path;
  }
}

function shouldPatch(file) {
  return [".html", ".js", ".css", ".txt"].some((extension) => file.endsWith(extension));
}

function patch(source, file) {
  if (!basePath) return source;

  let patched = source
    .replaceAll('basePath:""', `basePath:"${basePath}"`)
    .replaceAll('basePath:"/"', `basePath:"${basePath}"`)
    .replaceAll("basePath:`/`", `basePath:\`${basePath}\``)
    .replaceAll('fetch("/.vocs/', `fetch("${basePath}/.vocs/`)
    .replaceAll('"/assets/', `"${basePath}/assets/`)
    .replaceAll("'/assets/", `'${basePath}/assets/`)
    .replaceAll("`/assets/", `\`${basePath}/assets/`)
    .replaceAll('\\"/assets/', `\\"${basePath}/assets/`)
    .replaceAll("\\'/assets/", `\\'${basePath}/assets/`)
    .replace(
      new RegExp(`\\\\"href\\\\":\\\\"/(?!/|${basePathPattern}(?:/|\\\\"))`, "g"),
      `\\"href\\":\\"${basePath}/`,
    )
    .replace(new RegExp(`\\b(href|src)="/(?!/|${basePathPattern}(?:/|"))`, "g"), `$1="${basePath}/`)
    .replace(new RegExp(`url\\(/(?!/|${basePathPattern}(?:/|\\)))`, "g"), `url(${basePath}/`)
    .replace(new RegExp(`\\]\\(/(?!/|${basePathPattern}(?:/|\\)))`, "g"), `](${basePath}/`);

  if (file.endsWith(".js")) {
    patched = patched
      .replace(
        new RegExp(`\\bhref:\`/(?!/|${basePathPattern}(?:/|\`))`, "g"),
        `href:\`${basePath}/`,
      )
      .replace(new RegExp(`\\bhref:"/(?!/|${basePathPattern}(?:/|"))`, "g"), `href:"${basePath}/`)
      .replace(new RegExp(`\\bhref:'/(?!/|${basePathPattern}(?:/|'))`, "g"), `href:'${basePath}/`);
  }

  return patched;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
