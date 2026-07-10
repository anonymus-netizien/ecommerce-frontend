// ponytail: native fetch replaces axios — no dep needed
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

async function request(method: string, url: string, data?: unknown) {
  const res = await fetch(`${BASE_URL}${url}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: data ? JSON.stringify(data) : undefined,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// ponytail: only post needed — add get/put when callers appear
export const axiosInstance = {
  post: (url: string, data: unknown) => request("POST", url, data),
};

export default axiosInstance;
