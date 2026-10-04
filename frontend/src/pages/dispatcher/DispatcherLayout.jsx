import React from "react";
import { Outlet } from "react-router-dom";
import Shell from "../../components/Shell";
import RouteDialog from "../../components/RouteDialog";
import DeferModal from "../../components/DeferModal";
import { CheckCircle } from "lucide-react";
import { DispatcherProvider, useDispatcher } from "./DispatcherContext";
function Frame() {
  const { board, error, successMsg, activeNavTab, setActiveNavTab, liveCount, modalVehicle, deferringOrder,
    setOpenVehicleModal, setDeferringOrder, handleLoaderChange, handleConfirmDeferral } = useDispatcher();
  const getTabTitle = () => {
    switch (activeNavTab) {
      case "dashboard": return "Operations Dashboard";
      case "dispatch": case "routes": return "Live Dispatch & Routes";
      case "fleet": return "Fleet Management & Roster";
      case "capacity": return "Capacity Planning & Headroom";
      case "fuel": return "Fuel Management & Quota Telemetry";
      case "deferrals": return "Deferral Management & History";
      case "reports": return "Logistics Operations Reports";
      default: return "Order Allocation";
    }
  };
  const getTabSub = () => {
    switch (activeNavTab) {
      case "dashboard": return "Metro retail distribution — Peliyagoda & Kandy Hubs · Live Telemetry";
      case "dispatch": case "routes": return "Real-time driver tracking, delivery progress, and route execution.";
      case "fleet": return "60 Vehicles · Real-time telemetry, maintenance scheduling, health scoring, and driver/loader assignments.";
      case "capacity": return "Weight, volume, refrigeration meters, van-only access constraints, and 8-week predictive demand forecasts.";
      case "fuel": return "Weekly quota monitoring, route distance burn rate, cost in LKR, CO2 footprint, and eco-routing advisor.";
      case "deferrals": return "Track deferred orders, skipped outlets, and reschedule plans.";
      case "reports": return "Summary of order fulfillment, fleet utilization, and fuel efficiency metrics.";
      default: return "Assign confirmed orders to vehicles and trips for Peliyagoda & Kandy. Drag an order onto a trip slot.";
    }
  };
  return (
    <Shell
      title={getTabTitle()}
      sub={getTabSub()}
      activeTab={activeNavTab}
      alerts={board?.alerts || []}
      fleet={{ total: board?.vehicles?.length || 0, available: (board?.vehicles || []).filter((v) => v.vehicle.status === "available").length }}
      navBadges={{ dispatch: liveCount > 0 ? String(liveCount) : undefined }}
      onTabChange={setActiveNavTab}
      right={
        <div className="flex items-center gap-2">
          {error && (
            <div className="bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-2 rounded-2xl text-xs font-bold animate-shake">
              {error}
            </div>
          )}
          {successMsg && (
            <div className="bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 px-4 py-2 rounded-2xl text-xs font-bold animate-fadeIn flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-500" /> {successMsg}
            </div>
          )}
        </div>
      }
    >
      {board ? (
        <Outlet />
      ) : (
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purplePrimary" />
        </div>
      )}
      {modalVehicle && (
        <RouteDialog
          key={modalVehicle.vehicle.id}
          v={modalVehicle}
          loaders={board.loaders || []}
          districts={board.districts || []}
          onClose={() => setOpenVehicleModal(null)}
          onLoader={handleLoaderChange}
        />
      )}
      {deferringOrder && (
        <DeferModal
          order={deferringOrder}
          onClose={() => setDeferringOrder(null)}
          onConfirm={handleConfirmDeferral}
        />
      )}
    </Shell>
  );
}
export default function DispatcherLayout() {
  return (
    <DispatcherProvider>
      <Frame />
    </DispatcherProvider>
  );
}
