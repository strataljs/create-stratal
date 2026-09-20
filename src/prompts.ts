import * as p from "@clack/prompts";
import { templates, findTemplateByName, type Template } from "./templates.js";
import {
  isValidProjectName,
  targetDir,
  directoryExists,
  directoryIsEmpty,
} from "./utils.js";

export type PackageManagerChoice = "npm" | "yarn" | "pnpm" | "bun";

export const packageManagers: PackageManagerChoice[] = [
  "npm",
  "yarn",
  "pnpm",
  "bun",
];

/** Used for anything left unanswered under --yes. */
const DEFAULT_PROJECT_NAME = "my-stratal-app";
const DEFAULT_TEMPLATE = "hello-world";

export interface CliOptions {
  name?: string;
  template?: string;
  packageManager?: PackageManagerChoice;
  install: boolean;
  skills: boolean;
  force: boolean;
  yes: boolean;
}

interface PromptResult {
  projectName: string;
  template: Template;
  targetDir: string;
}

/** A prompt can only be shown when someone is there to answer it. */
function canPrompt(): boolean {
  return process.stdin.isTTY === true;
}

export function isPackageManager(
  value: string,
): value is PackageManagerChoice {
  return (packageManagers as string[]).includes(value);
}

/** Reads the package manager that invoked us, e.g. "pnpm/9.1.0 node/v22". */
export function detectPackageManager(): PackageManagerChoice {
  const agent = process.env.npm_config_user_agent ?? "";
  const name = agent.split("/")[0];
  return name && isPackageManager(name) ? name : "npm";
}

export async function runPrompts(
  options: CliOptions,
): Promise<PromptResult | undefined> {
  // Project name
  let projectName: string;
  if (options.name) {
    const error = isValidProjectName(options.name);
    if (error) {
      p.log.error(error);
      return undefined;
    }
    projectName = options.name;
  } else if (options.yes) {
    projectName = DEFAULT_PROJECT_NAME;
  } else if (!canPrompt()) {
    p.log.error("Missing project name. Pass it as the first argument.");
    return undefined;
  } else {
    const nameResult = await p.text({
      message: "What is your project name?",
      placeholder: DEFAULT_PROJECT_NAME,
      validate: (value) => isValidProjectName(value!),
    });
    if (p.isCancel(nameResult)) {
      p.cancel("Operation cancelled.");
      return undefined;
    }
    projectName = nameResult;
  }

  // Template selection
  let template: Template | undefined;
  if (options.template) {
    template = findTemplateByName(options.template);
    if (!template) {
      p.log.error(
        `Template "${options.template}" not found. Run with --list to see available templates.`,
      );
      return undefined;
    }
  } else if (options.yes) {
    template = findTemplateByName(DEFAULT_TEMPLATE)!;
  } else if (!canPrompt()) {
    p.log.error("Missing template. Pass --template, or --list to see them.");
    return undefined;
  } else {
    const templateResult = await p.select({
      message: "Which template would you like to use?",
      options: templates.map((t) => ({
        value: t,
        label: t.name,
        hint: t.description,
      })),
    });
    if (p.isCancel(templateResult)) {
      p.cancel("Operation cancelled.");
      return undefined;
    }
    template = templateResult;
  }

  // Overwrite check
  const dir = targetDir(projectName);
  if (directoryExists(dir) && !directoryIsEmpty(dir) && !options.force) {
    // Overwriting existing work is never a safe default, so --yes alone
    // is not enough to agree to it.
    if (options.yes || !canPrompt()) {
      p.log.error(
        `Directory "${projectName}" is not empty. Pass --force to overwrite it.`,
      );
      return undefined;
    }

    const overwrite = await p.confirm({
      message: `Directory "${projectName}" already exists and is not empty. Overwrite?`,
      initialValue: false,
    });
    if (p.isCancel(overwrite) || !overwrite) {
      p.cancel("Operation cancelled.");
      return undefined;
    }
  }

  return { projectName, template, targetDir: dir };
}

/**
 * Resolves the package manager without ever blocking: an explicit flag wins,
 * --yes follows whichever one invoked us, and a non-tty skips the install.
 */
export async function resolvePackageManager(
  options: CliOptions,
): Promise<PackageManagerChoice | null> {
  if (!options.install) return null;
  if (options.packageManager) return options.packageManager;
  if (options.yes) return detectPackageManager();
  if (!canPrompt()) return null;

  const result = await p.select({
    message: "Which package manager would you like to use?",
    options: [
      ...packageManagers.map((value) => ({ value, label: value })),
      { value: "skip" as const, label: "Skip" },
    ],
  });

  if (p.isCancel(result) || result === "skip") {
    return null;
  }

  return result;
}
