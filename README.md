# create-stratal

Scaffold a new [Stratal](https://stratal.dev) project from official templates.

[Documentation](https://stratal.dev) · [Stratal on GitHub](https://github.com/strataljs/stratal) · [Examples](https://github.com/strataljs/examples)

## Usage

```bash
# npm
npm create stratal@latest my-app

# yarn
yarn create stratal@latest my-app

# pnpm
pnpm create stratal@latest my-app
```

This launches an interactive prompt to pick a template, then downloads it into `my-app/`.

Every new project also gets the [Stratal agent skills](https://skills.sh/strataljs/stratal), so coding agents
know the framework from the first prompt. Pass `--no-skills` to leave them out.

## CLI Flags

| Flag | Description |
| --- | --- |
| `-t, --template <name>` | Skip the template picker and use a specific template |
| `-p, --package-manager <name>` | Install with `npm`, `yarn`, `pnpm`, or `bun` |
| `--no-install` | Skip installing dependencies |
| `--no-skills` | Skip the Stratal agent skills |
| `--force` | Replace the contents of the target directory |
| `-y, --yes` | Accept defaults instead of asking |
| `-l, --list` | List all available templates |
| `-h, --help` | Show help |

## Non-interactive use

Every question has a flag, so the CLI can run unattended — useful in CI or
when an agent drives it. Outside a terminal it never prompts: anything left
unanswered is reported as an error naming the flag to pass, so a run either
completes or exits non-zero, and never hangs waiting for input.

```bash
# Fully specified
npm create stratal@latest my-app -t crud-api -p npm

# Scaffold only, no install and no skills
npm create stratal@latest my-app -t crud-api --no-install --no-skills

# Accept every default (hello-world, the package manager that invoked it)
npm create stratal@latest my-app --yes
```

`--force` empties the target directory before writing the template, so
nothing from a previous project is left behind. `--yes` alone will not do
this. The template is downloaded to a staging directory first, so a failed
download leaves the existing directory untouched.

Run `--list` to see the template names `--template` accepts.

## Available Templates

| Template | Description |
| --- | --- |
| `hello-world` | A minimal Stratal app with a single GET endpoint |
| `crud-api` | RESTful notes API with full CRUD operations and DI |
| `testing` | Vitest + @stratal/testing with Cloudflare worker pool |
| `guards` | Route protection with @UseGuards and CanActivate |
| `middleware` | Middleware configuration with apply/exclude/forRoutes |
| `queues` | Queue producer/consumer pattern with Cloudflare Queues |
| `scheduled-tasks` | Cron job scheduling with the CronJob interface |
| `openapi` | OpenAPI docs with Scalar UI and Zod schema integration |
| `seeders` | Database seeding with @stratal/seeders and stratal-seed CLI |
| `events` | Type-safe event system with @Listener and @On decorators |
| `auth` | Session-based authentication with Better Auth |
| `database` | ZenStack ORM with PostgreSQL via Hyperdrive |
| `rbac` | Role-based access control with Casbin |
| `factories` | Test data factories with Faker.js and state modifiers |
| `multi-connection-database` | Multi-connection database with per-connection schema management |
| `workers` | Durable Objects, Workflows, and WorkerEntrypoints with DI |
| `commands` | Custom Quarry CLI commands |
| `inertia` | Inertia.js v3 with React SSR, typed props, and flash messages |

## Examples

```bash
# Interactive mode
npm create stratal@latest my-app

# Use a specific template
npm create stratal@latest my-app --template crud-api

# Short flag
npm create stratal@latest my-app -t openapi

# List templates
npm create stratal@latest -- --list

# Skip the agent skills
npm create stratal@latest my-app -t crud-api --no-skills
```

## Links

- [Documentation](https://stratal.dev)
- [Stratal on GitHub](https://github.com/strataljs/stratal)
- [Examples](https://github.com/strataljs/examples)
- [Report an issue](https://github.com/strataljs/create-stratal/issues)

## License

MIT
