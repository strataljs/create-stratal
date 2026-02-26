export interface Template {
  /** Display name shown in the select prompt */
  name: string;
  /** Directory name in the examples/ folder (e.g. "01-hello-world") */
  dir: string;
  /** Short description for the template */
  description: string;
}

export const templates: Template[] = [
  {
    name: "Hello World",
    dir: "01-hello-world",
    description: "A minimal Stratal app with a single GET endpoint",
  },
  {
    name: "CRUD API",
    dir: "02-crud-api",
    description: "RESTful notes API with full CRUD operations and DI",
  },
  {
    name: "Testing",
    dir: "03-testing",
    description: "Vitest + @stratal/testing with Cloudflare worker pool",
  },
  {
    name: "Guards",
    dir: "04-guards",
    description: "Route protection with @UseGuards and CanActivate",
  },
  {
    name: "Middleware",
    dir: "05-middleware",
    description: "Middleware configuration with apply/exclude/forRoutes",
  },
  {
    name: "Queues",
    dir: "06-queues",
    description: "Queue producer/consumer pattern with Cloudflare Queues",
  },
  {
    name: "Scheduled Tasks",
    dir: "07-scheduled-tasks",
    description: "Cron job scheduling with the CronJob interface",
  },
  {
    name: "OpenAPI",
    dir: "08-openapi",
    description: "OpenAPI docs with Scalar UI and Zod schema integration",
  },
];

const REPO = "strataljs/stratal";
const BRANCH = "main";

export function getGigetSource(dirName: string): string {
  return `github:${REPO}/examples/${dirName}#${BRANCH}`;
}

export function findTemplateByName(name: string): Template | undefined {
  const lower = name.toLowerCase();
  return templates.find(
    (t) =>
      t.dir === lower ||
      t.dir.replace(/^\d+-/, "") === lower ||
      t.name.toLowerCase() === lower,
  );
}
