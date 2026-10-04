import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sun, Moon, LogOut, ChevronDown, CheckCircle2, Clock, Store } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { useAuth, DEMO_USERS, HOME } from "../../auth";
import { useTheme } from "../../context/ThemeContext";
import { useCutoffCountdown } from "../../utils/cutoff";

export default function Header({ title }) {
  const { user, store, logout: storeLogout } = useApp();
  const { u, logout: authLogout, switchRole } = useAuth();
  const { mode, toggleTheme, cutoffTime } = useTheme();
  const countdown = useCutoffCountdown();
  const navigate = useNavigate();
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const storeName = store?.name || (store?.outletId ? `Store ${store.outletId}` : "Waypoint Store");
  const isDispatcher = u?.role === "DISPATCHER";

  const handleLogout = () => {
    storeLogout();
    authLogout();
    navigate("/login");
  };

  const handleRoleSwitch = (demoUser) => {
    switchRole(demoUser);
    setShowRoleMenu(false);
    navigate(HOME[demoUser.role]);
  };

  return (
    <header className="shrink-0 sticky top-0 z-30 bg-white dark:bg-[#1E2530] h-16 px-4 md:px-6 flex items-center justify-between border-b border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="flex items-center gap-3 min-w-0">
        <h1 className="text-xl md:text-2xl font-black tracking-tight text-gray-900 dark:text-white truncate">
          {title}
        </h1>
        {isDispatcher && (
          <Link
            to="/dispatcher"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/60 dark:hover:bg-purple-900/60 text-purplePrimary dark:text-purple-300 text-xs font-bold border border-purple-200/80 dark:border-purple-800 transition shrink-0"
            title="Return to Operations Dispatcher"
          >
            ← Operations Desk
          </Link>
        )}
      </div>

      <div className="flex items-center gap-2 md:gap-3 shrink-0">
        <span className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-50 dark:bg-purple-950/40 text-purplePrimary dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/60 text-xs font-bold">
          <Clock className="w-3.5 h-3.5 text-purplePrimary" />
          Cutoff in {countdown || cutoffTime}
        </span>

        <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-bold border border-gray-200 dark:border-gray-700 max-w-[220px] truncate">
          <Store className="w-3.5 h-3.5 text-gray-500" />
          {storeName}
        </span>

        <button
          onClick={toggleTheme}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/50 dark:hover:bg-purple-900/50 text-purplePrimary text-xs font-bold border border-purple-200/60 dark:border-purple-800 transition"
          title="Toggle Morning / Evening adaptive theme"
        >
          {mode === "morning" ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-purple-400" />}
          <span className="hidden md:inline">
            {mode === "morning" ? "Morning" : "Evening"}
          </span>
        </button>

        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-2 px-2.5 md:px-3 py-1.5 rounded-2xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition text-left"
          >
            <div className="w-7 h-7 rounded-full bg-purplePrimary text-white flex items-center justify-center font-bold text-xs">
              {user?.name?.charAt(0) || u?.name?.charAt(0) || "M"}
            </div>
            <div className="hidden md:block">
              <div className="text-xs font-bold text-gray-900 dark:text-gray-100 truncate max-w-[110px]">
                {user?.name || u?.name || "Manager"}
              </div>
              <div className="text-[10px] text-gray-500 dark:text-gray-400 capitalize">
                {u?.role?.replace("_", " ") || "Store Manager"}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-[#1E2530] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 p-2 z-50 animate-fadeIn space-y-1">
              <div className="px-3 py-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                Switch Persona (Demo)
              </div>
              {DEMO_USERS.map((demo) => (
                <button
                  key={demo.role + demo.username}
                  onClick={() => handleRoleSwitch(demo)}
                  className={`w-full flex items-center justify-between p-2 rounded-xl text-xs font-semibold transition ${
                    u?.role === demo.role
                      ? "bg-purplePrimary text-white"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  <span>{demo.label}</span>
                  {u?.role === demo.role && <CheckCircle2 className="w-4 h-4" />}
                </button>
              ))}
              <div className="border-t border-gray-100 dark:border-gray-800 pt-1 mt-1">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 p-2 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
