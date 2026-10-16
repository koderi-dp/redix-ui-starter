import type { IncomingMessage, ServerResponse } from "node:http";
import type { Plugin } from "vite";
import type { Item, ItemBody, Overview } from "../src/lib/api";

/**
 * An in-memory API so the example pages render with no backend. Set `API_PROXY` to
 * point at a real API and this plugin is not loaded (see vite.config.ts).
 */

const now = () => new Date().toISOString();

let items: Item[] = [
  {
    id: "itm-01",
    name: "Nightly ingest",
    description: "Pulls the day's data and files it.",
    status: "active",
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: "itm-02",
    name: "Partner feed",
    description: "Syncs the partner's latest export.",
    status: "paused",
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: "itm-03",
    name: "Archive sweep",
    description: "Moves old records to cold storage.",
    status: "failed",
    createdAt: now(),
    updatedAt: now(),
  },
];

const STATUSES: Item["status"][] = ["active", "paused", "failed"];

function validate(body: Partial<ItemBody>): { path: string; code: string; message: string }[] {
  const errors: { path: string; code: string; message: string }[] = [];
  if (body.name != null && body.name.trim() === "") {
    errors.push({ path: "name", code: "required", message: "Name is required." });
  }
  if (body.status != null && !STATUSES.includes(body.status)) {
    errors.push({
      path: "status",
      code: "invalid",
      message: "Status must be active, paused or failed.",
    });
  }
  return errors;
}

function overview(): Overview {
  return {
    items: {
      total: items.length,
      active: items.filter((item) => item.status === "active").length,
      failed: items.filter((item) => item.status === "failed").length,
    },
    updatedAt: now(),
  };
}

function send(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

function empty(res: ServerResponse, status: number) {
  res.statusCode = status;
  res.end();
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
    });
    req.on("end", () => resolve(data));
  });
}

export function mockApi(): Plugin {
  return {
    name: "mock-api",
    configureServer(server) {
      server.middlewares.use("/api", async (req, res, next) => {
        const url = new URL(req.url ?? "/", "http://localhost");
        const path = url.pathname.replace(/^\/api/, "");
        const method = req.method ?? "GET";

        if (method === "GET" && path === "/overview") {
          return send(res, 200, overview());
        }

        if (method === "GET" && path === "/items") {
          return send(res, 200, items);
        }

        if (method === "POST" && path === "/items") {
          const body = JSON.parse(await readBody(req)) as ItemBody;
          const errors = validate(body);
          if (errors.length) {
            return send(res, 400, {
              title: "Validation failed",
              detail: "One or more fields are invalid.",
              errors,
            });
          }
          const item: Item = {
            id: `itm-${String(items.length + 1).padStart(2, "0")}`,
            name: body.name.trim(),
            description: body.description.trim(),
            status: body.status,
            createdAt: now(),
            updatedAt: now(),
          };
          items = [item, ...items];
          return send(res, 201, item);
        }

        const match = path.match(/^\/items\/([^/]+)$/);
        if (match) {
          const id = match[1];
          const found = items.find((item) => item.id === id);
          if (!found) {
            return send(res, 404, { title: "Not found", detail: `No item with id ${id}.` });
          }
          if (method === "GET") {
            return send(res, 200, found);
          }
          if (method === "DELETE") {
            items = items.filter((item) => item.id !== id);
            return empty(res, 204);
          }
          if (method === "PATCH") {
            const body = JSON.parse(await readBody(req)) as Partial<ItemBody>;
            const errors = validate(body);
            if (errors.length) {
              return send(res, 400, {
                title: "Validation failed",
                detail: "One or more fields are invalid.",
                errors,
              });
            }
            const updated: Item = {
              ...found,
              ...(body.name != null ? { name: body.name.trim() } : {}),
              ...(body.description != null ? { description: body.description.trim() } : {}),
              ...(body.status != null ? { status: body.status } : {}),
              updatedAt: now(),
            };
            items = items.map((item) => (item.id === id ? updated : item));
            return send(res, 200, updated);
          }
        }

        next();
      });
    },
  };
}
