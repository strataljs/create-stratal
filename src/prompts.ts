import * as p from "@clack/prompts";
import { templates, findTemplateByName, type Template } from "./templates.js";
import {
  isValidProjectName,
  targetDir,
  directoryExists,
  directoryIsEmpty,
} from "./utils.js";

interface PromptResult {
  projectName: string;
  template: Template;
  targetDir: string;
}

export async function runPrompts(
  argName?: string,
  argTemplate?: string,
): Promise<PromptResult | undefined> {
  // Project name
  let projectName: string;
  if (argName) {
    const error = isValidProjectName(argName);
    if (error) {
      p.log.error(error);
      return undefined;
    }
    projectName = argName;
  } else {
    const nameResult = await p.text({
      message: "What is your project name?",
      placeholder: "my-stratal-app",
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
  if (argTemplate) {
    template = findTemplateByName(argTemplate);
    if (!template) {
      p.log.error(
        `Template "${argTemplate}" not found. Run with --list to see available templates.`,
      );
      return undefined;
    }
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
  if (directoryExists(dir) && !directoryIsEmpty(dir)) {
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

export type PackageManagerChoice = "npm" | "yarn" | "pnpm" | "bun";

export async function runPackageManagerPrompt(): Promise<PackageManagerChoice | null> {
  const result = await p.select({
    message: "Which package manager would you like to use?",
    options: [
      { value: "npm" as const, label: "npm" },
      { value: "yarn" as const, label: "yarn" },
      { value: "pnpm" as const, label: "pnpm" },
      { value: "bun" as const, label: "bun" },
      { value: "skip" as const, label: "Skip" },
    ],
  });

  if (p.isCancel(result) || result === "skip") {
    return null;
  }

  return result;
}
