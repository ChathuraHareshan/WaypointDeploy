import { request, get, post, patch } from "./http";
const store = (outletId) => `/api/stores/${encodeURIComponent(outletId)}`;
const order = (outletId, orderId) => `${store(outletId)}/orders/${encodeURIComponent(orderId)}`;
export const storeApi = {
  login: (username, password) => post("/api/auth/login", { username, password }),
  sessionForUser: (userId) => get(`/api/auth/users/${encodeURIComponent(userId)}`),
  store: (outletId) => get(store(outletId)),
  catalog: () => get("/api/catalog"),
  orders: (outletId) => get(`${store(outletId)}/orders`),
  placeOrder: (outletId, lines) =>
    post(`${store(outletId)}/orders`, { lines }),
  dashboard: (outletId) => get(`${store(outletId)}/dashboard`),
  currentDelivery: (outletId) => get(`${store(outletId)}/deliveries/current`),
  acknowledgeDeferral: (outletId, orderId) =>
    post(`${order(outletId, orderId)}/deferral/acknowledge`),
  receiving: (outletId) => get(`${store(outletId)}/receiving/current`),
  confirmReceipt: (outletId, orderId, results) =>
    post(`${order(outletId, orderId)}/receipt`, { results }),
  reports: (outletId) => get(`${store(outletId)}/reports`),
  setDeferralReason: (outletId, orderId, reason) =>
    patch(`${order(outletId, orderId)}/deferral`, { reason }),
  reschedule: (outletId, orderId) =>
    post(`${order(outletId, orderId)}/reschedule`),
};
export const api = storeApi;
