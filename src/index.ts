import * as p from "@clack/prompts";
import pc from "picocolors";
import { templates } from "./templates.js";
import {
  runPrompts,
  resolvePackageManager,
  isPackageManager,
  packageManagers,
  type CliOptions,
} from "./prompts.js";
import { installDependencies } from "nypm";
import { scaffold, installSkills } from "./scaffold.js";

const HELP = `
${pc.bold("create-stratal")} — Scaffold a new Stratal project

${pc.bold("Usage:")}
  npm create stratal@latest [project-name] [options]
  yarn create stratal@latest [project-name] [options]
  pnpm create stratal@latest [project-name] [options]

${pc.bold("Options:")}
  -t, --template <name>         Template to use
  -p, --package-manager <name>  Install with npm, yarn, pnpm, or bun
      --no-install              Skip installing dependencies
      --no-skills               Skip the Stratal agent skills
      --force                   Replace the contents of the target directory
  -y, --yes                     Accept defaults instead of asking
  -l, --list                    List available templates
  -h, --help                    Show this help message

${pc.bold("Examples:")}
  npm create stratal@latest my-app
  npm create stratal@latest my-app --template hello-world
  npm create stratal@latest my-app -t crud-api

${pc.bold("Non-interactive:")}
  Every question above has a flag, so the CLI never waits for input when
  each one is answered. Outside a terminal it will not ask at all: pass
  --yes for defaults, or name a template and a package manager.

  npm create stratal@latest my-app -t crud-api -p npm
  npm create stratal@latest my-app -t crud-api --no-install --no-skills
  npm create stratal@latest my-app --yes
`.trim();

interface ParsedArgs extends CliOptions {
  help: boolean;
  list: boolean;
}

class ArgError extends Error {}

/** Reads the value that follows a flag, e.g. "--template crud-api". */
function takeValue(argv: string[], index: number, flag: string): string {
  const value = argv[index];
  if (value === undefined || value.startsWith("-")) {
    throw new ArgError(`${flag} needs a value.`);
  }
  return value;
}

function parseArgs(argv: string[]): ParsedArgs {
  const args: ParsedArgs = {
    help: false,
    list: false,
    install: true,
    skills: true,
    force: false,
    yes: false,
  };

  let i = 0;
  while (i < argv.length) {
    const arg = argv[i];
    if (arg === "--help" || arg === "-h") {
      args.help = true;
    } else if (arg === "--list" || arg === "-l") {
      args.list = true;
    } else if (arg === "--yes" || arg === "-y") {
      args.yes = true;
    } else if (arg === "--force") {
      args.force = true;
    } else if (arg === "--no-install") {
      args.install = false;
    } else if (arg === "--no-skills") {
      args.skills = false;
    } else if (arg === "--template" || arg === "-t") {
      args.template = takeValue(argv, ++i, arg);
    } else if (arg === "--package-manager" || arg === "-p") {
      const value = takeValue(argv, ++i, arg);
      if (!isPackageManager(value)) {
        throw new ArgError(
          `Unknown package manager "${value}". Use ${packageManagers.join(", ")}.`,
        );
      }
      args.packageManager = value;
    } else if (arg.startsWith("-")) {
      throw new ArgError(`Unknown option "${arg}". Run with --help.`);
    } else if (args.name === undefined) {
      args.name = arg;
    } else {
      throw new ArgError(`Unexpected argument "${arg}". Run with --help.`);
    }
    i++;
  }

  return args;
}

async function main() {
  let args: ParsedArgs;
  try {
    args = parseArgs(process.argv.slice(2));
  } catch (error) {
    console.error(
      pc.red(error instanceof ArgError ? error.message : String(error)),
    );
    process.exit(1);
  }

  if (args.help) {
    console.log(HELP);
    return;
  }

  if (args.list) {
    console.log(pc.bold("\nAvailable templates:\n"));
    for (const t of templates) {
      const shortName = t.dir.replace(/^\d+-/, "");
      console.log(`  ${pc.cyan(shortName.padEnd(26))} ${pc.dim(t.description)}`);
    }
    console.log();
    return;
  }

  p.intro(pc.bgCyan(pc.black(" create-stratal ")));

  const result = await runPrompts(args);
  if (!result) {
    process.exit(1);
  }

  const s = p.spinner();
  s.start(`Scaffolding ${pc.cyan(result.projectName)}...`);

  try {
    await scaffold(
      result.template,
      result.targetDir,
      result.projectName,
      result.replace,
    );
    s.stop(`Scaffolded ${pc.cyan(result.projectName)}`);
  } catch (error) {
    s.stop("Failed to scaffold project");
    p.log.error(
      error instanceof Error ? error.message : "An unknown error occurred",
    );
    process.exit(1);
  }

  if (args.skills) {
    const skillsSpinner = p.spinner();
    skillsSpinner.start("Adding Stratal agent skills...");
    try {
      await installSkills(result.targetDir);
      skillsSpinner.stop("Added Stratal agent skills");
    } catch {
      // The project is usable without them, so this never fails the scaffold.
      skillsSpinner.stop("Couldn't add the agent skills. Skipping.");
    }
  }

  const packageManager = await resolvePackageManager(args);

  if (packageManager) {
    const installSpinner = p.spinner();
    installSpinner.start(`Installing dependencies with ${pc.cyan(packageManager)}...`);
    try {
      await installDependencies({
        cwd: result.targetDir,
        packageManager,
      });
      installSpinner.stop(`Installed dependencies with ${pc.cyan(packageManager)}`);
    } catch (error) {
      installSpinner.stop("Failed to install dependencies");
      p.log.error(
        error instanceof Error ? error.message : "An unknown error occurred",
      );
    }
  }

  const isNested = result.targetDir !== process.cwd();
  const pm = packageManager ?? "npm";
  const steps = isNested ? [`cd ${result.projectName}`] : [];

  if (!packageManager) {
    steps.push(`${pm} install`);
  }
  steps.push(`${pm} run dev`);

  p.note(steps.join("\n"), "Next steps");

  p.outro(`Done! Happy building with ${pc.cyan("Stratal")} ✨`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
