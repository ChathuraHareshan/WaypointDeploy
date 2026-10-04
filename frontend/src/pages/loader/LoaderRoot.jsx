import React from "react";
import { Outlet } from "react-router-dom";
import { LoaderProvider } from "../../store/LoaderStore";
export default function LoaderRoot() {
  return (
    <LoaderProvider>
      <Outlet />
    </LoaderProvider>
  );
}
