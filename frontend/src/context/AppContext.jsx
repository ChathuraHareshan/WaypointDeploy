import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { storeApi as api } from "../api/storeApi";
import { toOrderView } from "../utils/format";
import { useAuth } from "../auth";

const AppContext = createContext();

const REFRESH_MS = 15000;

const DEFAULT_STORE = {
  id: "OUT001",
  outletId: "OUT001",
  name: "Waypoint Fresh Colombo 1",
  brand: "Fresh",
  district: "Colombo",
  depot: "Peliyagoda",
  dockType: "street",
  parking: "van_only",
  windowOpen: "05:00",
  windowClose: "07:30",
};

export function AppProvider({ children }) {
  const auth = useAuth();
  const currentAuthUser = auth?.u;

  const [user, setUser] = useState(currentAuthUser || null);
  const [orders, setOrders] = useState([]);
  const [orderCatalog, setOrderCatalog] = useState([]);
  const [store, setStore] = useState(DEFAULT_STORE);
  const [dashboard, setDashboard] = useState(null);
  const [cutoffAt, setCutoffAt] = useState(null);

  const outletRef = useRef(currentAuthUser?.outletId || "OUT001");

  const applyStore = useCallback((s) => {
    if (!s) return;
    setStore((prev) => ({ ...prev, ...s }));
    setCutoffAt(s?.cutoff ? Date.now() + s.cutoff.secondsRemaining * 1000 : null);
  }, []);

  const hydrate = useCallback(
    async (session) => {
      const outletId = session?.store?.outletId || session?.user?.outletId || currentAuthUser?.outletId || "OUT001";
      outletRef.current = outletId;
      if (session?.store) {
        applyStore(session.store);
      }
      if (session?.user) {
        setUser({ id: session.user.id, name: session.user.name, role: "Store Manager", outletId });
      }
      try {
        const [catRes, storeRes, listRes, dashRes] = await Promise.all([
          api.catalog().catch(() => []),
          api.store(outletId).catch(() => null),
          api.orders(outletId).catch(() => []),
          api.dashboard(outletId).catch(() => null),
        ]);
        if (catRes && catRes.length) setOrderCatalog(catRes);
        if (storeRes) applyStore(storeRes);
        if (listRes) setOrders(listRes.map(toOrderView));
        if (dashRes) setDashboard(dashRes);
      } catch (err) {
        console.error("Hydrate data fetch failed:", err);
      }
    },
    [applyStore, currentAuthUser]
  );

  const login = useCallback(async (username, password) => {
    const session = await api.login(username, password);
    await hydrate(session);
    return session;
  }, [hydrate]);

  const loginSso = useCallback(async (userId) => {
    try {
      const session = await api.sessionForUser(userId);
      await hydrate(session);
      return session;
    } catch (e) {
      console.error("SSO fetch failed:", e);
      const outletId = currentAuthUser?.outletId || "OUT001";
      const session = {
        user: { id: userId, name: currentAuthUser?.name || "Store Manager", role: "Store Manager", outletId },
      };
      await hydrate(session);
      return session;
    }
  }, [hydrate, currentAuthUser]);

  useEffect(() => {
    if (currentAuthUser) {
      const targetUser = currentAuthUser.outletId || currentAuthUser.username || currentAuthUser.id || "out001";
      loginSso(targetUser).catch(() => {});
    }
  }, [currentAuthUser, loginSso]);

  const logout = useCallback(() => {
    outletRef.current = null;
    setUser(null);
    setOrders([]);
    setDashboard(null);
    setStore(DEFAULT_STORE);
    setCutoffAt(null);
    if (auth?.logout) auth.logout();
  }, [auth]);

  const refreshOrders = useCallback(async () => {
    const id = outletRef.current;
    if (!id) return;
    try {
      const list = await api.orders(id);
      if (outletRef.current === id) setOrders(list.map(toOrderView));
    } catch (_) {}
  }, []);

  const refreshDashboard = useCallback(async () => {
    const id = outletRef.current;
    if (!id) return;
    try {
      const dash = await api.dashboard(id);
      if (outletRef.current === id) setDashboard(dash);
    } catch (_) {}
  }, []);

  const refreshStore = useCallback(async () => {
    const id = outletRef.current;
    if (!id) return;
    try {
      const s = await api.store(id);
      if (outletRef.current === id) applyStore(s);
    } catch (_) {}
  }, [applyStore]);

  useEffect(() => {
    if (!user) return undefined;
    const tick = () => {
      refreshOrders().catch(() => {});
      refreshDashboard().catch(() => {});
    };
    const i = setInterval(tick, REFRESH_MS);
    return () => clearInterval(i);
  }, [user, refreshOrders, refreshDashboard]);

  const placeOrder = async (items) => {
    const created = await api.placeOrder(
      outletRef.current,
      items.map((i) => ({ itemId: i.id || i.itemId, name: i.name, qty: i.qty }))
    );
    const view = toOrderView(created);
    setOrders((prev) => [view, ...prev]);
    refreshDashboard().catch(() => {});
    return view;
  };

  return (
    <AppContext.Provider
      value={{
        user, login, loginSso, logout,
        orders, placeOrder, store,
        orderCatalog,
        outletId: store?.outletId || currentAuthUser?.outletId || "OUT001",
        dashboard, cutoffAt,
        refreshOrders, refreshDashboard, refreshStore,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
