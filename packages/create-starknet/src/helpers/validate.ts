import path from "node:path";
import fs from "fs-extra";
import validateNpmPackageName from "validate-npm-package-name";

export function getPackageNameValidation(projectPath: string) {
  const projectNameValidation = validateNpmPackageName(
    path.basename(path.resolve(projectPath)),
  );

  if (!projectNameValidation.validForNewPackages) {
    return [
      ...(projectNameValidation.warnings || []),
      ...(projectNameValidation.errors || []),
    ].join("\n");
  }

  const resolvedProjectPath = path.resolve(projectPath);
  if (fs.existsSync(resolvedProjectPath)) {
    const stat = fs.statSync(resolvedProjectPath);

    if (
      stat.isDirectory() &&
      fs.readdirSync(resolvedProjectPath).length === 0
    ) {
      return true;
    }

    return "Target directory already exists and is not empty";
  }

  return true;
}
