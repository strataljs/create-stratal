import {
  readFileSync,
  writeFileSync,
  existsSync,
  readdirSync,
  mkdirSync,
  mkdtempSync,
  renameSync,
  rmSync,
} from "node:fs";
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
  replace = false,
): Promise<void> {
  const source = getGigetSource(template.dir);

  if (replace) {
    // Stage the download beside the target so a failed fetch never leaves
    // the user with the directory already emptied. Same parent keeps the
    // move a rename rather than a cross-device copy.
    const parent = path.dirname(targetDir);
    mkdirSync(parent, { recursive: true });
    const staging = mkdtempSync(path.join(parent, ".create-stratal-"));
    try {
      await downloadTemplate(source, { dir: staging, force: true });
      assertDownloaded(staging, template);

      clearDirectory(targetDir);
      for (const entry of readdirSync(staging)) {
        renameSync(path.join(staging, entry), path.join(targetDir, entry));
      }
    } finally {
      rmSync(staging, { recursive: true, force: true });
    }
  } else {
    await downloadTemplate(source, { dir: targetDir, force: true });
    assertDownloaded(targetDir, template);
  }

  updatePackageJson(targetDir, projectName);
  updateWranglerJsonc(targetDir, projectName);
}

/**
 * giget resolves a missing subdirectory to an empty extraction instead of
 * failing, which used to leave the user with a silently empty project.
 */
function assertDownloaded(dir: string, template: Template): void {
  if (readdirSync(dir).length === 0) {
    throw new Error(
      `Couldn't download the ${template.name} template. Check your connection and try again.`,
    );
  }
}

/** Empties a directory without removing the directory itself. */
function clearDirectory(dir: string): void {
  mkdirSync(dir, { recursive: true });
  for (const entry of readdirSync(dir)) {
    rmSync(path.join(dir, entry), { recursive: true, force: true });
  }
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
    // npx is a .cmd on Windows, which Node refuses to spawn without a shell.
    // Every argument here is a constant, so there is nothing to inject.
    { cwd: targetDir, shell: process.platform === "win32" },
  );
}
