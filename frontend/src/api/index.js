import { get, post, put, del } from "./http";
import { loaderApi } from "./loaderApi";
import { storeApi } from "./storeApi";
const E = encodeURIComponent;
const D = "/api/dispatcher";
const dep = (d) => `?depot=${E(d)}`;
export const api = {
  login: (username, password) => post("/api/auth/login", { username, password }),
  me: () => get("/api/auth/me"),
  board: (depot = "Peliyagoda") => get(`${D}/board${dep(depot)}`),
  assign: (orderRef, vehicleId, trip) => post(`${D}/allocations`, { orderRef, vehicleId, trip }),
  unassign: (ref) => del(`${D}/allocations/${E(ref)}`),
  autoAllocate: (depot = "Peliyagoda") => post(`${D}/allocations/auto${dep(depot)}`),
  resetAllocations: (depot = "Peliyagoda") => post(`${D}/allocations/reset${dep(depot)}`),
  defer: (ref, reason, notes = "", rescheduleDate = "Tomorrow") =>
    post(`${D}/orders/${E(ref)}/defer`, { reason, notes, rescheduleDate }),
  reissue: (ref) => post(`${D}/orders/${E(ref)}/reissue`),
  loader: (vehicleId, loaderId) => put(`${D}/vehicles/${E(vehicleId)}/loader`, { loaderId }),
  sequence: (vehicleId, trip, orderRefs) => put(`${D}/trips/${E(vehicleId)}/${trip}/sequence`, { orderRefs }),
  fleet: (depot = "Peliyagoda") => get(`${D}/fleet${dep(depot)}`),
  updateVehicleStatus: (id, status, notes = "") => post(`${D}/vehicles/${E(id)}/status`, { status, notes }),
  updateVehicleDriver: (id, driver) => post(`${D}/vehicles/${E(id)}/driver`, { driver }),
  refuelVehicle: (id, amount = 0) => post(`${D}/vehicles/${E(id)}/refuel`, { amount }),
  capacity: (depot = "Peliyagoda") => get(`${D}/capacity${dep(depot)}`),
  fuel: (depot = "Peliyagoda") => get(`${D}/fuel${dep(depot)}`),
  reports: (depot = "Peliyagoda") => get(`${D}/reports${dep(depot)}`),
  resetSeed: () => post(`${D}/seed/reset`),
  loaderRuns: (loaderId) => get(`/api/loader/${E(loaderId)}/runs`),
  load: (ref, loaded) => post(`/api/loader/orders/${E(ref)}/load`, { loaded }),
  flag: (ref, issue, photo = "", notes = "") => post(`/api/loader/orders/${E(ref)}/flag`, { issue, photo, notes }),
  depart: (vehicleId) => post(`/api/loader/vehicles/${E(vehicleId)}/depart`),
  driverRun: (vehicleId) => get(`/api/driver/${E(vehicleId)}/run`),
  driverSync: (vehicleId, actions) => post(`/api/driver/${E(vehicleId)}/sync`, { actions }),
  driverPod: (ref) => get(`/api/driver/orders/${E(ref)}/pod`),
  outlets: () => get("/api/store/outlets"),
  catalog: () => get("/api/catalog"),
  place: (order) => post("/api/store/orders", order),
  storeOrders: (outletId) => get(`/api/stores/${E(outletId)}/orders`),
  receipt: (ref, ok, note = "", claimType = "") => post(`/api/store/orders/${E(ref)}/receipt`, { ok, note, claimType }),
};
export { loaderApi, storeApi };
export * from "./http";
export default api;
