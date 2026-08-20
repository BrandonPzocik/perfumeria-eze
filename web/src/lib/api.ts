export const API_BASE = (import.meta as any).env?.VITE_API_URL || "http://localhost:3001/api";
export const API_ORIGIN = API_BASE.replace(/\/api\/?$/, "");

export function assetUrl(path?: string | null): string | null {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${API_ORIGIN}${path}`;
}

/** Rutas públicas de logo (prioridad: logo.png del usuario, luego logo.svg incluido) */
export const PUBLIC_LOGO_PATHS = ["/logo.png", "/logo.svg"] as const;

const TOKEN_KEY = "maison-ambar-admin-token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: any;
  auth?: boolean;
  isFormData?: boolean;
}

async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {};
  let body: BodyInit | undefined;

  if (opts.body !== undefined) {
    if (opts.isFormData) {
      body = opts.body;
    } else {
      headers["Content-Type"] = "application/json";
      body = JSON.stringify(opts.body);
    }
  }

  if (opts.auth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method: opts.method || "GET",
    headers,
    body,
  });

  const isJson = res.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await res.json() : await res.blob();

  if (!res.ok) {
    const message = isJson && (data as any)?.error ? (data as any).error : "Ocurrió un error inesperado.";
    throw new ApiError(message, res.status);
  }

  return data as T;
}

export const api = {
  get: <T>(path: string, auth = false) => request<T>(path, { method: "GET", auth }),
  post: <T>(path: string, body?: any, auth = false) => request<T>(path, { method: "POST", body, auth }),
  patch: <T>(path: string, body?: any, auth = false) => request<T>(path, { method: "PATCH", body, auth }),
  del: <T>(path: string, auth = false) => request<T>(path, { method: "DELETE", auth }),
  upload: <T>(path: string, formData: FormData, auth = true) =>
    request<T>(path, { method: "POST", body: formData, isFormData: true, auth }),
};
