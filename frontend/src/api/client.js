const TOKEN_KEY = "lectosmart_token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

class ApiError extends Error {
  constructor(status, body) {
    super(body?.error || "Error de red");
    this.status = status;
    this.body = body;
  }
}

export async function apiFetch(path, { method = "GET", body, onUnauthorized } = {}) {
  const headers = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const base = import.meta.env.VITE_API_URL || "";
  const res = await fetch(`${base}/api${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401) {
    setToken(null);
    onUnauthorized?.();
  }

  const contentType = res.headers.get("content-type") || "";
  const data = contentType.includes("application/json") ? await res.json() : null;

  if (!res.ok) {
    throw new ApiError(res.status, data);
  }
  return data;
}

// Subida de archivos (multipart/form-data). No se usa apiFetch porque el
// navegador debe fijar el Content-Type con el boundary automáticamente.
export async function apiUpload(path, formData, { onUnauthorized } = {}) {
  const headers = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const base = import.meta.env.VITE_API_URL || "";
  const res = await fetch(`${base}/api${path}`, { method: "POST", headers, body: formData });

  if (res.status === 401) {
    setToken(null);
    onUnauthorized?.();
  }

  const contentType = res.headers.get("content-type") || "";
  const data = contentType.includes("application/json") ? await res.json() : null;
  if (!res.ok) throw new ApiError(res.status, data);
  return data;
}

// Descarga autenticada: baja el archivo como blob y dispara la descarga
// del navegador con el nombre original.
export async function apiDescargar(path, nombreArchivo) {
  const headers = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const base = import.meta.env.VITE_API_URL || "";
  const res = await fetch(`${base}/api${path}`, { headers });
  if (!res.ok) throw new ApiError(res.status, null);

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nombreArchivo;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
