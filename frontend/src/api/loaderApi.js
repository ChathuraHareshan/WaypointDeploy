import { get, post, put } from "./http";
const BASE = "/api/loader";
export const loaderApi = {
  loginPin: (pin, dock) =>
    post(`${BASE}/auth/pin`, { pin, dock }),
  loginBadge: (badgeId, dock) =>
    post(`${BASE}/auth/badge`, { badgeId, dock }),
  listRuns: (loaderId = "LDR01") =>
    get(`${BASE}/runs?loaderId=${encodeURIComponent(loaderId)}`),
  getRun: (runId) =>
    get(`${BASE}/runs/${encodeURIComponent(runId)}`),
  startRun: (runId, loaderId = "LDR01") =>
    post(`${BASE}/runs/${encodeURIComponent(runId)}/start?loaderId=${encodeURIComponent(loaderId)}`),
  completeRun: (runId, loaderId = "LDR01") =>
    post(`${BASE}/runs/${encodeURIComponent(runId)}/complete?loaderId=${encodeURIComponent(loaderId)}`),
  markStopLoaded: (runId, stopIndex) =>
    post(`${BASE}/runs/${encodeURIComponent(runId)}/stops/${stopIndex}/load`),
  verifyItem: (runId, sku, zone) =>
    post(`${BASE}/items/verify`, { runId, sku, zone }),
  flagItem: (runId, sku, reason, note, photo = null) =>
    post(`${BASE}/items/flag`, { runId, sku, reason, note, photo }),
  listExceptions: (runId) =>
    get(`${BASE}/runs/${encodeURIComponent(runId)}/exceptions`),
  notifyDispatcher: (runId, sku) =>
    post(`${BASE}/runs/${encodeURIComponent(runId)}/exceptions/${encodeURIComponent(sku)}/notify`),
  signoff: (runId, pin, managerName = "Store Manager") =>
    post(`${BASE}/runs/${encodeURIComponent(runId)}/signoff`, { pin, managerName }),
  sync: (loaderId, ops) =>
    post(`${BASE}/sync`, { loaderId, ops }),
  listMessages: (loaderId = "LDR01") =>
    get(`${BASE}/messages?loaderId=${encodeURIComponent(loaderId)}`),
  acceptMessage: (id) =>
    post(`${BASE}/messages/${encodeURIComponent(id)}/accept`),
  disputeMessage: (id) =>
    post(`${BASE}/messages/${encodeURIComponent(id)}/dispute`),
  getProfile: (loaderId = "LDR01") =>
    get(`${BASE}/profile?loaderId=${encodeURIComponent(loaderId)}`),
  updateProfile: (loaderId, body) =>
    put(`${BASE}/profile?loaderId=${encodeURIComponent(loaderId)}`, body),
  summary: (loaderId = "LDR01") =>
    get(`${BASE}/summary?loaderId=${encodeURIComponent(loaderId)}`),
};
