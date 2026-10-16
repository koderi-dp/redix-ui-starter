/** The example domain: one CRUD resource, to show the UI → API pattern. */

export type Item = {
  id: string;
  name: string;
  description: string;
  status: "active" | "paused" | "failed";
  createdAt: string;
  updatedAt: string;
};

export type ItemBody = {
  name: string;
  description: string;
  status: Item["status"];
};

export type Overview = {
  items: { total: number; active: number; failed: number };
  updatedAt: string;
};

/** The 400 body the API returns: a title, a detail, and one error per invalid field. */
export type Problem = {
  title?: string;
  detail?: string;
  code?: string;
  errors?: { path: string; code: string; message: string }[];
};

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly problem: Problem,
  ) {
    super(message);
  }
}

/** One readable sentence for a toast. Field errors come first because they say what to fix. */
export function errorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    const first = error.problem.errors?.[0];
    if (first) return first.message;
    return error.problem.detail ?? error.problem.title ?? error.message;
  }
  return error instanceof Error ? error.message : "Request failed";
}

/** API field errors keyed by path, for showing under the matching control. */
export function fieldErrors(error: unknown): Record<string, string> {
  if (!(error instanceof ApiError)) return {};
  const map: Record<string, string> = {};
  for (const item of error.problem.errors ?? []) {
    map[item.path] = item.message;
  }
  return map;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(path, {
      ...init,
      headers: {
        Accept: "application/json",
        ...(init?.body ? { "Content-Type": "application/json" } : {}),
        ...init?.headers,
      },
    });
  } catch {
    throw new ApiError("The API is not reachable.", 0, { title: "The API is not reachable." });
  }
  if (!response.ok) {
    let problem: Problem = { title: response.statusText || `HTTP ${response.status}` };
    try {
      problem = (await response.json()) as Problem;
    } catch {
      /* empty or non-JSON body */
    }
    throw new ApiError(
      problem.detail ?? problem.title ?? "Request failed",
      response.status,
      problem,
    );
  }
  if (response.status === 204) {
    return undefined as T;
  }
  return (await response.json()) as T;
}

function send<T>(method: string, path: string, body?: unknown): Promise<T> {
  return request<T>(path, { method, body: body === undefined ? undefined : JSON.stringify(body) });
}

export const api = {
  overview: () => request<Overview>("/api/overview"),
  items: () => request<Item[]>("/api/items"),
  item: (id: string) => request<Item>(`/api/items/${id}`),
  createItem: (body: ItemBody) => send<Item>("POST", "/api/items", body),
  updateItem: (id: string, body: Partial<ItemBody>) =>
    send<Item>("PATCH", `/api/items/${id}`, body),
  deleteItem: (id: string) => send<void>("DELETE", `/api/items/${id}`),
};
