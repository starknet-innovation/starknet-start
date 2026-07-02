import fs from "fs-extra";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { installDependencies, installTemplate } from "./installation";
import { getPackageNameValidation } from "./validate";

const templatesFolderPath = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "templates");

let workDir: string;

beforeEach(() => {
  workDir = fs.mkdtempSync(path.join(os.tmpdir(), "create-starknet-test-"));
});

afterEach(() => {
  fs.removeSync(workDir);
});

describe("installTemplate", () => {
  it("scaffolds the next template with a renamed gitignore and project name", () => {
    const target = path.join(workDir, "my-app");
    const result = installTemplate("next", target, "my-app", templatesFolderPath);

    expect(result.filePaths.length).toBeGreaterThan(0);
    expect(fs.existsSync(path.join(target, ".gitignore"))).toBe(true);
    expect(fs.existsSync(path.join(target, "gitignore"))).toBe(false);
    expect(fs.readJsonSync(path.join(target, "package.json")).name).toBe("my-app");
  });

  it("throws when no template is selected", () => {
    expect(() => installTemplate(null, path.join(workDir, "x"), "x", templatesFolderPath)).toThrowError(
      /template should be selected/,
    );
    // undefined (e.g. a cancelled prompt) must not reach path.join
    expect(() =>
      installTemplate(undefined as unknown as null, path.join(workDir, "x"), "x", templatesFolderPath),
    ).toThrowError(/template should be selected/);
  });

  it("ships lint tooling with the template scripts", () => {
    for (const template of ["next", "tanstack-start"] as const) {
      const packageJson = fs.readJsonSync(path.join(templatesFolderPath, template, "package.json"));
      for (const script of ["lint", "format"]) {
        const binary = packageJson.scripts[script].split(" ")[0];
        expect(
          packageJson.devDependencies[binary],
          `${template} runs "${binary}" in scripts.${script} but does not depend on it`,
        ).toBeDefined();
      }
      for (const [dependency, range] of Object.entries<string>(packageJson.dependencies)) {
        expect(range, `${template} pins ${dependency} to a floating tag`).not.toBe("latest");
      }
    }
  });
});

describe("installDependencies", () => {
  it("rejects instead of crashing when the package manager is missing", async () => {
    await expect(installDependencies("definitely-not-a-package-manager" as never, workDir)).rejects.toThrowError(
      /Could not run|installation failed/,
    );
  });
});

describe("getPackageNameValidation", () => {
  it("accepts a valid new directory", () => {
    expect(getPackageNameValidation(path.join(workDir, "fresh-app"))).toBe(true);
  });

  it("rejects a non-empty directory", () => {
    const target = path.join(workDir, "taken");
    fs.mkdirpSync(target);
    fs.writeFileSync(path.join(target, "file.txt"), "hi");
    expect(getPackageNameValidation(target)).toMatch(/already exists/);
  });

  it("rejects invalid npm names", () => {
    expect(getPackageNameValidation(path.join(workDir, "Invalid Name!"))).not.toBe(true);
  });
});
