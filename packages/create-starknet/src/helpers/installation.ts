import path from "node:path";
import { fileURLToPath } from "node:url";
import spawn from "cross-spawn";
import fs from "fs-extra";
import type { PackageManager } from "./packageManager.ts";

export type Template = "next" | "tanstack-start";

export type TemplateInstallResult = {
  filePaths: string[];
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function installTemplate(
  selectedTemplate: Template | null,
  resolvedProjectPath: string,
  projectName: string,
): TemplateInstallResult {
  if (selectedTemplate === null) {
    throw new Error("A template should be selected");
  }

  const templatesFolderPath = path.join(__dirname, "../src", "templates");
  const selectedTemplatePath = path.join(templatesFolderPath, selectedTemplate);
  const templateFilePaths = listFiles(selectedTemplatePath).map((filePath) => {
    const relativePath = path.relative(selectedTemplatePath, filePath);
    if (relativePath === "gitignore") {
      return ".gitignore";
    }
    return relativePath;
  });

  fs.copySync(selectedTemplatePath, resolvedProjectPath, { overwrite: false });

  const filesToRename = [["gitignore", ".gitignore"]] as const;

  for (const [previousFileName, newFileName] of filesToRename) {
    const previousFilePath = path.join(resolvedProjectPath, previousFileName);
    const newFilePath = path.join(resolvedProjectPath, newFileName);

    if (fs.existsSync(previousFilePath)) {
      fs.renameSync(previousFilePath, newFilePath);
    }
  }

  const packageJsonPath = path.join(resolvedProjectPath, "package.json");
  const packageJson = fs.readJsonSync(packageJsonPath);
  packageJson.name = projectName;

  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

  return {
    filePaths: templateFilePaths.sort((a, b) => a.localeCompare(b)),
  };
}

export async function installDependencies(
  packageManager: PackageManager,
  resolvedProjectPath: string,
) {
  console.log("Installing dependencies...");
  const args = ["install", packageManager === "pnpm" ? "--quiet" : "--silent"];

  return new Promise((resolve, reject) => {
    const child = spawn(packageManager, args, {
      stdio: "inherit",
      cwd: resolvedProjectPath,
      env: {
        ...process.env,
        ADBLOCK: "1",
        NODE_ENV: "development",
        DISABLE_OPENCOLLECTIVE: "1",
      },
    });
    child.on("close", (code: number | null) => {
      if (code !== 0) {
        reject(new Error("Error while installing dependencies"));
        return;
      }
      resolve(true);
    });
  });
}

function listFiles(rootPath: string): string[] {
  const stack = [rootPath];
  const filePaths: string[] = [];

  while (stack.length > 0) {
    const currentPath = stack.pop();
    if (!currentPath) {
      continue;
    }

    const entries = fs.readdirSync(currentPath, { withFileTypes: true });
    for (const entry of entries) {
      const entryPath = path.join(currentPath, entry.name);
      if (entry.isDirectory()) {
        stack.push(entryPath);
      } else {
        filePaths.push(entryPath);
      }
    }
  }

  return filePaths;
}
