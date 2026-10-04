import { useNavigate, Link } from "react-router-dom";
import { Home, Package, MessageSquare, User, Sun, Moon, Truck } from "lucide-react";
import { useLoader } from "../store/LoaderStore";
import { useTheme } from "../context/ThemeContext";

export default function AppHeader({ showNav = false, activeNav = null, backTo = null }) {
  const { avatar } = useLoader();
  const { mode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const navItems = [
    { label: "Home", Icon: Home, to: "/loader/summary" },
    { label: "Loads", Icon: Package, to: "/loader/loads" },
    { label: "Dock", Icon: Truck, to: "/loader/dock" },
    { label: "Inbox", Icon: MessageSquare, to: "/loader/inbox" },
    { label: "Profile", Icon: User, to: "/loader/profile" },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white dark:bg-[#1E2530] border-b border-gray-200 dark:border-gray-800 shadow-sm shrink-0">
      <div className="mx-auto flex max-w-md items-center justify-between px-4 py-2.5">
        <button
          onClick={() => navigate(backTo || "/loader/summary")}
          className="flex items-center gap-2 group text-left"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purplePrimary text-[13px] font-black text-white group-hover:scale-105 transition-transform">
            W
          </div>
          <div>
            <div className="text-xs font-black tracking-tight text-gray-900 dark:text-white flex items-center gap-1">
              WAYPOINT <span className="text-[9px] text-blue-600 dark:text-amber-400 font-extrabold px-1 py-0.5 bg-blue-50 dark:bg-blue-950/60 rounded">DOCK</span>
            </div>
          </div>
        </button>

        <div className="flex items-center gap-2">
          <Link
            to="/dispatcher"
            className="inline-flex items-center gap-1 rounded-full bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/60 dark:hover:bg-purple-900/60 text-purplePrimary dark:text-purple-300 border border-purple-200 dark:border-purple-800 px-2 py-0.5 text-[11px] font-bold transition"
            title="Return to Operations Dispatcher"
          >
            ← Operations
          </Link>

          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 px-2 py-0.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Synced
          </span>

          <button
            onClick={toggleTheme}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:text-purplePrimary transition active:scale-95 border border-gray-200 dark:border-gray-700"
            aria-label={`Theme: ${mode} — tap to change`}
            title={`Toggle Morning / Evening mode`}
          >
            {mode === "morning" ? <Sun className="h-3.5 w-3.5 text-amber-500" /> : <Moon className="h-3.5 w-3.5 text-purple-400" />}
          </button>

          <div className="h-7 w-7 overflow-hidden rounded-full bg-purple-100 dark:bg-purple-950 border border-purple-200 dark:border-purple-800 flex items-center justify-center text-xs font-bold text-purplePrimary">
            {avatar ? <img src={avatar} alt="avatar" className="h-full w-full object-cover" /> : "L"}
          </div>
        </div>
      </div>

      {showNav && (
        <div className="mx-auto max-w-md px-3 pb-2.5">
          <div className="flex items-center justify-around rounded-2xl bg-gray-100 dark:bg-gray-800/70 p-1 border border-gray-200 dark:border-gray-700/80">
            {navItems.map(({ label, Icon, to }) => {
              const isActive = label === activeNav;
              return (
                <button
                  key={label}
                  onClick={() => navigate(to)}
                  className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1 text-[11px] font-bold transition ${
                    isActive
                      ? "bg-purplePrimary text-white shadow-sm"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
