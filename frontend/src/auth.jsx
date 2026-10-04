import React, { createContext, useContext, useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { setAuthSession, clearAuthSession, getToken } from "./api/http";
import { api } from "./api";
const AuthContext = createContext();
export const HOME = {
  DISPATCHER: "/dispatcher",
  LOADER: "/loader",
  DRIVER: "/driver",
  STORE_MANAGER: "/store-manager/dashboard",
};
export const DEMO_USERS = [
  { label: "Lead Dispatcher", role: "DISPATCHER", username: "dispatcher", password: "dispatch123", name: "Maya Chen", depot: "Peliyagoda" },
  { label: "Store Manager (OUT001)", role: "STORE_MANAGER", username: "out001", password: "store123", name: "Manager OUT001", outletId: "OUT001" },
  { label: "Warehouse Loader (LDR01)", role: "LOADER", username: "loader01", password: "loader123", name: "Nimal (Loader)", loaderId: "LDR01" },
  { label: "Driver (VEH003)", role: "DRIVER", username: "driver003", password: "driver123", name: "M. Fernando", vehicleId: "VEH003" },
];
export function AuthProvider({ children }) {
  const [u, setU] = useState(() => {
    try {
      const stored = localStorage.getItem("wp_user");
      const token = getToken();
      if (token && stored) {
        return JSON.parse(stored);
      }
      return null;
    } catch {
      return null;
    }
  });
  const loginWithCredentials = async (username, password) => {
    const res = await api.login(username, password);
    setAuthSession(res.token, res.user);
    setU(res.user);
    return res;
  };
  const login = (userData, token) => {
    if (token) {
      setAuthSession(token, userData);
    } else {
      localStorage.setItem("wp_user", JSON.stringify(userData));
    }
    setU(userData);
  };
  const logout = () => {
    clearAuthSession();
    setU(null);
  };
  const switchRole = async (target) => {
    const demo = DEMO_USERS.find(
      (d) => d.role === target?.role || d.username === target?.username || d.username === target?.id
    );
    if (demo && demo.password) {
      try {
        await loginWithCredentials(demo.username, demo.password);
        return;
      } catch (err) {
        console.error("Demo role switch failed", err);
      }
    }
    login(target);
  };
  return (
    <AuthContext.Provider value={{ u, login, loginWithCredentials, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
}
export const useAuth = () => useContext(AuthContext);
export function Guard({ role, children }) {
  const { u } = useAuth();
  const token = getToken();
  if (!u || !token) {
    return <Navigate to="/login" replace />;
  }
  if (role) {
    const allowed = Array.isArray(role) ? role.includes(u.role) : u.role === role;
    if (!allowed) {
      return <Navigate to={HOME[u.role] || "/login"} replace />;
    }
  }
  return children;
}
