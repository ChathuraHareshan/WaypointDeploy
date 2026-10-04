import { NavLink, Link } from "react-router-dom";
import {
  LayoutDashboard,
  PlusCircle,
  Layers,
  Truck,
  CheckCircle2,
  BarChart3,
  LogOut,
  Activity,
  Package,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { useAuth } from "../../auth";

const navItems = [
  { to: "/store-manager/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/store-manager/place-order", label: "Place Order", icon: PlusCircle },
  { to: "/store-manager/orders", label: "My Orders", icon: Layers },
  { to: "/store-manager/incoming", label: "Incoming Delivery", icon: Truck },
  { to: "/store-manager/receiving", label: "Receiving", icon: CheckCircle2 },
  { to: "/store-manager/reports", label: "Reports", icon: BarChart3 },
];

export default function Sidebar() {
  const { logout: storeLogout, dashboard, store } = useApp();
  const { u, logout: authLogout } = useAuth();
  const kpi = dashboard?.stats;
  const isDispatcher = u?.role === "DISPATCHER";

  const handleLogout = () => {
    storeLogout();
    authLogout();
  };

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-[#1E2530] border-r border-gray-200 dark:border-gray-800 h-screen sticky top-0 shrink-0 overflow-y-auto p-4 justify-between select-none z-20">
      <div className="space-y-5">
        <Link to="/" className="flex items-center gap-3 px-2 py-1 group">
          <img
            src="/logo-icon.png"
            alt="Waypoint Logo"
            className="w-9 h-9 object-contain drop-shadow group-hover:scale-105 transition-transform duration-200"
          />
          <div>
            <div className="font-extrabold text-sm tracking-tight text-gray-900 dark:text-white flex items-center gap-1.5">
              WAYPOINT <span className="text-[10px] text-blue-600 dark:text-amber-400 font-extrabold px-1.5 py-0.5 bg-blue-50 dark:bg-blue-950/60 rounded">GROUP</span>
            </div>
            <div className="text-[10px] text-gray-400 -mt-0.5 tracking-wider">Store Portal · {store?.outletId || "OUT001"}</div>
          </div>
        </Link>

        {isDispatcher && (
          <div className="px-1">
            <Link
              to="/dispatcher"
              className="flex items-center justify-between px-3 py-2 rounded-2xl bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/50 dark:hover:bg-purple-900/50 text-purplePrimary dark:text-purple-300 text-xs font-bold border border-purple-200 dark:border-purple-800 transition"
            >
              <span>← Operations Desk</span>
              <span className="text-[10px] bg-purplePrimary text-white px-1.5 py-0.5 rounded font-black">ALL</span>
            </Link>
          </div>
        )}

        <div>
          <div className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-3 mb-2">
            Store Operations
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition ${
                      isActive
                        ? "bg-purplePrimary text-white shadow-md shadow-purplePrimary/20"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/60 hover:text-gray-900 dark:hover:text-white"
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span>{item.label}</span>
                  </div>
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div>
          <div className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-3 mb-2">
            Cross-Role Access
          </div>
          <Link
            to="/loader/summary"
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/60 hover:text-gray-900 dark:hover:text-white transition group"
          >
            <div className="flex items-center gap-3">
              <Package className="w-4 h-4 text-purplePrimary group-hover:scale-110 transition-transform" />
              <span>Loading Operations</span>
            </div>
            <span className="text-[10px] bg-purple-100 dark:bg-purple-950 text-purplePrimary px-2 py-0.5 rounded-full font-bold">
              Bay 3
            </span>
          </Link>
        </div>

        <div className="p-3 bg-gray-50 dark:bg-gray-800/40 rounded-2xl border border-gray-100 dark:border-gray-700/60 text-xs space-y-2">
          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 mb-1">
            <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10px]">
              <Activity className="w-3 h-3 text-emerald-500" /> Weekly Activity
            </span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 text-[11px]">
              {kpi?.onTimeRate != null ? `${kpi.onTimeRate}% on-time` : "100% on-time"}
            </span>
          </div>
          <div className="flex justify-between text-xs text-gray-600 dark:text-gray-300">
            <span>Orders placed</span>
            <span className="font-bold text-gray-900 dark:text-white">{kpi?.ordersThisWeek ?? 0}</span>
          </div>
          <div className="flex justify-between text-xs text-gray-600 dark:text-gray-300">
            <span>Deferred recently</span>
            <span className="font-bold text-gray-900 dark:text-white">{kpi?.deferredRecently ?? 0}</span>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-100 dark:border-gray-800 shrink-0">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 font-bold text-xs transition"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>
    </aside>
  );
}
