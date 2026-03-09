# create-stratal

Scaffold a new [Stratal](https://github.com/strataljs/stratal) project from official templates.

## Usage

```bash
# npm
npm create stratal my-app

# yarn
yarn create stratal my-app

# pnpm
pnpm create stratal my-app
```

This launches an interactive prompt to pick a template, then downloads it into `my-app/`.

## CLI Flags

| Flag | Description |
| --- | --- |
| `-t, --template <name>` | Skip the template picker and use a specific template |
| `-l, --list` | List all available templates |
| `-h, --help` | Show help |

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

## Examples

```bash
# Interactive mode
npm create stratal my-app

# Use a specific template
npm create stratal my-app --template crud-api

# Short flag
npm create stratal my-app -t openapi

# List templates
npm create stratal -- --list
```

## License

MIT
