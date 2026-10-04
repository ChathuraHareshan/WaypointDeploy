export const getToken = () => localStorage.getItem("wp_token") || "";
export const setAuthSession = (token, user) => {
  if (token) localStorage.setItem("wp_token", token);
  else localStorage.removeItem("wp_token");
  if (user) localStorage.setItem("wp_user", JSON.stringify(user));
  else localStorage.removeItem("wp_user");
};
export const clearAuthSession = () => {
  localStorage.removeItem("wp_token");
  localStorage.removeItem("wp_user");
};
export async function request(path, { method = "GET", body, headers = {} } = {}) {
  const token = getToken();
  const reqHeaders = {
    "Content-Type": "application/json",
    ...headers,
  };
  if (token) {
    reqHeaders["Authorization"] = `Bearer ${token}`;
  }
  const url = path.startsWith("http") ? path : path.startsWith("/") ? path : `/${path}`;
  let res;
  try {
    res = await fetch(url, {
      method,
      headers: reqHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error("Unable to connect to the Waypoint server. Please check your connection.");
  }
  if (res.status === 401 && !url.includes("/api/auth/login")) {
    clearAuthSession();
    if (typeof window !== "undefined" && window.location.pathname !== "/login") {
      window.location.href = "/login";
    }
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || data.error || `Request failed with status ${res.status}`);
  }
  return data;
}
export const get = (url) => request(url);
export const post = (url, body = {}, method = "POST") => request(url, { method, body });
export const put = (url, body = {}) => request(url, { method: "PUT", body });
export const patch = (url, body = {}) => request(url, { method: "PATCH", body });
export const del = (url) => request(url, { method: "DELETE" });
