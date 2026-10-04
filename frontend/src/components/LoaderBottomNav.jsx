import { NavLink } from "react-router-dom";
import { Home, Package, Truck, MessageSquare, User } from "lucide-react";

const items = [
  { to: "/loader/summary", label: "Home", icon: Home },
  { to: "/loader/loads", label: "Loads", icon: Package },
  { to: "/loader/dock", label: "Dock", icon: Truck },
  { to: "/loader/inbox", label: "Inbox", icon: MessageSquare },
  { to: "/loader/profile", label: "Profile", icon: User },
];

export default function LoaderBottomNav() {
  return (
    <nav className="sticky bottom-0 z-30 bg-white dark:bg-[#1E2530] border-t border-gray-200 dark:border-gray-800 shadow-lg">
      <div className="mx-auto flex max-w-md items-center justify-around px-2 py-1.5">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-0.5 rounded-xl px-3 py-1 text-[10px] font-bold transition ${
                isActive
                  ? "bg-purplePrimary text-white shadow-sm shadow-purplePrimary/20"
                  : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/60 hover:text-purplePrimary"
              }`
            }
          >
            <Icon className="h-4 w-4" />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
