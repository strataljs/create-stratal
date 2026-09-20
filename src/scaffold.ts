import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { downloadTemplate } from "giget";
import { getGigetSource, type Template } from "./templates.js";

const execFileAsync = promisify(execFile);

/** Agent skills for Stratal, published from the framework repo. */
const SKILLS_SOURCE = "strataljs/stratal";

export async function scaffold(
  template: Template,
  targetDir: string,
  projectName: string,
): Promise<void> {
  const source = getGigetSource(template.dir);
  await downloadTemplate(source, { dir: targetDir, force: true });

  // giget resolves a missing subdirectory to an empty extraction instead of
  // failing, which used to leave the user with a silently empty project.
  if (readdirSync(targetDir).length === 0) {
    throw new Error(
      `Couldn't download the ${template.name} template. Check your connection and try again.`,
    );
  }

  updatePackageJson(targetDir, projectName);
  updateWranglerJsonc(targetDir, projectName);
}

function updatePackageJson(dir: string, projectName: string): void {
  const pkgPath = path.join(dir, "package.json");
  if (!existsSync(pkgPath)) return;

  const raw = readFileSync(pkgPath, "utf-8");
  const pkg = JSON.parse(raw);

  pkg.name = projectName;
  delete pkg.private;

  writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
}

function updateWranglerJsonc(dir: string, projectName: string): void {
  const jsoncPath = path.join(dir, "wrangler.jsonc");
  if (!existsSync(jsoncPath)) return;

  let content = readFileSync(jsoncPath, "utf-8");
  // Replace the name field value while preserving JSONC comments
  content = content.replace(
    /("name"\s*:\s*)"stratal-example-[^"]*"/,
    `$1"${projectName}"`,
  );
  writeFileSync(jsoncPath, content);
}

export async function installSkills(targetDir: string): Promise<void> {
  await execFileAsync(
    "npx",
    ["-y", "skills", "add", SKILLS_SOURCE, "-p", "-y"],
    { cwd: targetDir },
  );
}
