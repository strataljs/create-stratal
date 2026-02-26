import { existsSync, readdirSync } from "node:fs";
import path from "node:path";

const VALID_NAME_RE = /^[a-zA-Z0-9_@][a-zA-Z0-9._\-/@]*$/;

export function isValidProjectName(name: string): string | undefined {
  if (!name) return "Project name cannot be empty";
  if (!VALID_NAME_RE.test(name)) {
    return "Project name contains invalid characters. Use letters, numbers, hyphens, or underscores.";
  }
  return undefined;
}

export function targetDir(projectName: string): string {
  return path.resolve(process.cwd(), projectName);
}

export function directoryExists(dir: string): boolean {
  return existsSync(dir);
}

export function directoryIsEmpty(dir: string): boolean {
  try {
    const files = readdirSync(dir);
    return files.length === 0;
  } catch {
    return true;
  }
}
