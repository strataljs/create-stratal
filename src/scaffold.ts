import { readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { downloadTemplate } from "giget";
import { getGigetSource, type Template } from "./templates.js";

export async function scaffold(
  template: Template,
  targetDir: string,
  projectName: string,
): Promise<void> {
  const source = getGigetSource(template.dir);
  await downloadTemplate(source, { dir: targetDir, force: true });

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
