import React from "react";
import { Outlet } from "react-router-dom";
import { AppProvider } from "../../context/AppContext";
export default function StoreRoot() {
  return (
    <AppProvider>
      <Outlet />
    </AppProvider>
  );
}
