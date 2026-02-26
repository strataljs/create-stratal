import * as p from "@clack/prompts";
import pc from "picocolors";
import { templates } from "./templates.js";
import { runPrompts, runPackageManagerPrompt } from "./prompts.js";
import { installDependencies } from "nypm";
import { scaffold } from "./scaffold.js";

const HELP = `
${pc.bold("create-stratal")} — Scaffold a new Stratal project

${pc.bold("Usage:")}
  npm create stratal [project-name] [options]
  yarn create stratal [project-name] [options]
  pnpm create stratal [project-name] [options]

${pc.bold("Options:")}
  -t, --template <name>  Use a specific template (skip interactive selection)
  -l, --list             List available templates
  -h, --help             Show this help message

${pc.bold("Examples:")}
  npm create stratal my-app
  npm create stratal my-app --template hello-world
  npm create stratal my-app -t crud-api
`.trim();

function parseArgs(argv: string[]) {
  const args: { name?: string; template?: string; help: boolean; list: boolean } = {
    help: false,
    list: false,
  };

  let i = 0;
  while (i < argv.length) {
    const arg = argv[i];
    if (arg === "--help" || arg === "-h") {
      args.help = true;
    } else if (arg === "--list" || arg === "-l") {
      args.list = true;
    } else if (arg === "--template" || arg === "-t") {
      args.template = argv[++i];
    } else if (!arg.startsWith("-")) {
      args.name = arg;
    }
    i++;
  }

  return args;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    console.log(HELP);
    return;
  }

  if (args.list) {
    console.log(pc.bold("\nAvailable templates:\n"));
    for (const t of templates) {
      const shortName = t.dir.replace(/^\d+-/, "");
      console.log(`  ${pc.cyan(shortName.padEnd(20))} ${pc.dim(t.description)}`);
    }
    console.log();
    return;
  }

  p.intro(pc.bgCyan(pc.black(" create-stratal ")));

  const result = await runPrompts(args.name, args.template);
  if (!result) {
    process.exit(1);
  }

  const s = p.spinner();
  s.start(`Scaffolding ${pc.cyan(result.projectName)}...`);

  try {
    await scaffold(result.template, result.targetDir, result.projectName);
    s.stop(`Scaffolded ${pc.cyan(result.projectName)}`);
  } catch (error) {
    s.stop("Failed to scaffold project");
    p.log.error(
      error instanceof Error ? error.message : "An unknown error occurred",
    );
    process.exit(1);
  }

  const packageManager = await runPackageManagerPrompt();

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
