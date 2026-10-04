import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "leaflet/dist/leaflet.css";
import "./index.css";
import { AuthProvider, Guard, HOME, useAuth } from "./auth";
import { ThemeProvider } from "./context/ThemeContext";
import Login from "./pages/auth/Login";
import StoreRoot from "./pages/store-manager/StoreRoot";
import StoreDashboard from "./pages/store-manager/Dashboard";
import MyOrders from "./pages/store-manager/MyOrders";
import PlaceOrder from "./pages/store-manager/PlaceOrder";
import IncomingDelivery from "./pages/store-manager/IncomingDelivery";
import Receiving from "./pages/store-manager/Receiving";
import StoreReports from "./pages/store-manager/Reports";
import StoreLogin from "./pages/store-manager/StoreLogin";
import Driver from "./pages/driver/Driver";
import LoaderRoot from "./pages/loader/LoaderRoot";
import LoaderLogin from "./pages/loader/LoaderLogin";
import LoadingManifest from "./pages/loader/LoadingManifest";
import RunDetail from "./pages/loader/RunDetail";
import RunLocked from "./pages/loader/RunLocked";
import StopSequence from "./pages/loader/StopSequence";
import ItemScan from "./pages/loader/ItemScan";
import ItemDetail from "./pages/loader/ItemDetail";
import FlagItem from "./pages/loader/FlagItem";
import Exceptions from "./pages/loader/Exceptions";
import SignOff from "./pages/loader/SignOff";
import Success from "./pages/loader/Success";
import OfflineSync from "./pages/loader/OfflineSync";
import ScanFailed from "./pages/loader/ScanFailed";
import MultiToast from "./pages/loader/MultiToast";
import SyncFailed from "./pages/loader/SyncFailed";
import EmptyState from "./pages/loader/EmptyState";
import ShiftCleared from "./pages/loader/ShiftCleared";
import Inbox from "./pages/loader/Inbox";
import RouteChanged from "./pages/loader/RouteChanged";
import Profile from "./pages/loader/Profile";
import ShiftHandover from "./pages/loader/ShiftHandover";
import HandoverConfirm from "./pages/loader/HandoverConfirm";
import Summary from "./pages/loader/Summary";
import DockLoader from "./pages/loader/DockLoader";
import DispatcherLayout from "./pages/dispatcher/DispatcherLayout";
import AllocationTab from "./pages/dispatcher/tabs/AllocationTab";
import DashboardTab from "./pages/dispatcher/tabs/DashboardTab";
import LiveDispatchTab from "./pages/dispatcher/tabs/LiveDispatchTab";
import FleetPage from "./pages/dispatcher/tabs/FleetPage";
import CapacityPage from "./pages/dispatcher/tabs/CapacityPage";
import FuelPage from "./pages/dispatcher/tabs/FuelPage";
import RoutesTab from "./pages/dispatcher/tabs/RoutesTab";
import ReportsTab from "./pages/dispatcher/tabs/ReportsTab";
import DeferralsTab from "./pages/dispatcher/tabs/DeferralsTab";
const Home = () => {
  const { u } = useAuth();
  return <Navigate to={u ? HOME[u.role] || "/dispatcher" : "/login"} replace />;
};
const Protected = (role, Component) => (
  <Guard role={role}>
    <Component />
  </Guard>
);
createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/dispatcher" element={Protected("DISPATCHER", DispatcherLayout)}>
              <Route index element={<Navigate to="allocation" replace />} />
              <Route path="allocation" element={<AllocationTab />} />
              <Route path="dashboard" element={<DashboardTab />} />
              <Route path="dispatch" element={<LiveDispatchTab />} />
              <Route path="fleet" element={<FleetPage />} />
              <Route path="capacity" element={<CapacityPage />} />
              <Route path="routes" element={<RoutesTab />} />
              <Route path="fuel" element={<FuelPage />} />
              <Route path="deferrals" element={<DeferralsTab />} />
              <Route path="reports" element={<ReportsTab />} />
            </Route>
            <Route path="/loader/login" element={<LoaderLogin />} />
            <Route path="/loader" element={Protected(["LOADER", "DISPATCHER"], LoaderRoot)}>
              <Route index element={<Navigate to="summary" replace />} />
              <Route path="summary" element={<Summary />} />
              <Route path="loads" element={<LoadingManifest />} />
              <Route path="manifest" element={<LoadingManifest />} />
              <Route path="manifest/:runId" element={<LoadingManifest />} />
              <Route path="run/:runId" element={<RunDetail />} />
              <Route path="run/:runId/locked" element={<RunLocked />} />
              <Route path="run/:runId/stops" element={<StopSequence />} />
              <Route path="run/:runId/stop/:stopId" element={<ItemScan />} />
              <Route path="run/:runId/stop/:stopId/detail" element={<ItemDetail />} />
              <Route path="run/:runId/flag/:stopId" element={<FlagItem />} />
              <Route path="run/:runId/exceptions" element={<Exceptions />} />
              <Route path="run/:runId/signoff" element={<SignOff />} />
              <Route path="run/:runId/success" element={<Success />} />
              <Route path="run/:runId/offline" element={<OfflineSync />} />
              <Route path="run/:runId/scan-failed" element={<ScanFailed />} />
              <Route path="multitoast" element={<MultiToast />} />
              <Route path="sync-failed" element={<SyncFailed />} />
              <Route path="empty" element={<EmptyState />} />
              <Route path="shift-cleared" element={<ShiftCleared />} />
              <Route path="inbox" element={<Inbox />} />
              <Route path="route-changed" element={<RouteChanged />} />
              <Route path="profile" element={<Profile />} />
              <Route path="handover" element={<ShiftHandover />} />
              <Route path="handover/confirm" element={<HandoverConfirm />} />
              <Route path="dock" element={<DockLoader />} />
            </Route>
            <Route path="/driver" element={Protected("DRIVER", Driver)} />
            <Route path="/store-manager/login" element={<StoreRoot><StoreLogin /></StoreRoot>} />
            <Route path="/store-manager" element={Protected(["STORE_MANAGER", "DISPATCHER"], StoreRoot)}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<StoreDashboard />} />
              <Route path="orders" element={<MyOrders />} />
              <Route path="place-order" element={<PlaceOrder />} />
              <Route path="incoming" element={<IncomingDelivery />} />
              <Route path="receiving" element={<Receiving />} />
              <Route path="reports" element={<StoreReports />} />
            </Route>
            <Route path="/sm" element={<Navigate to="/store-manager/dashboard" replace />} />
            <Route path="/sm/dashboard" element={<Navigate to="/store-manager/dashboard" replace />} />
            <Route path="/sm/orders" element={<Navigate to="/store-manager/orders" replace />} />
            <Route path="/sm/place-order" element={<Navigate to="/store-manager/place-order" replace />} />
            <Route path="/sm/incoming" element={<Navigate to="/store-manager/incoming" replace />} />
            <Route path="/sm/receiving" element={<Navigate to="/store-manager/receiving" replace />} />
            <Route path="/sm/reports" element={<Navigate to="/store-manager/reports" replace />} />
            <Route path="/sm/login" element={<Navigate to="/store-manager/login" replace />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  </React.StrictMode>
);
