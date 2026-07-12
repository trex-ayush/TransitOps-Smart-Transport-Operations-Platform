import { NavLink } from "react-router-dom";
import { LayoutDashboard, Truck, Users, Route, Wrench, Receipt, BarChart3, Settings, UserCog } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const baseLinks = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/fleet", label: "Fleet", icon: Truck },
  { to: "/drivers", label: "Drivers", icon: Users },
  { to: "/trips", label: "Trips", icon: Route },
  { to: "/maintenance", label: "Maintenance", icon: Wrench },
  { to: "/expenses", label: "Fuel & Expenses", icon: Receipt },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const { user } = useAuth();
  const links = [...baseLinks];
  if (user?.role === "Fleet Manager") {
    links.splice(7, 0, { to: "/users", label: "Users", icon: UserCog });
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-stone bg-white/70 px-5 py-8 backdrop-blur-sm">
      <div className="mb-12 px-3">
        <h1 className="font-serif text-2xl font-bold tracking-tight text-forest">
          Transit<span className="italic text-sage">Ops</span>
        </h1>
        <p className="mt-1 text-[11px] uppercase tracking-widest text-sage">Fleet Operations</p>
      </div>

      <nav className="flex-1 space-y-1">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-full px-4 py-2.5 text-sm transition-colors duration-300 ${
                isActive ? "bg-forest text-white shadow-soft" : "text-forest/70 hover:bg-clay/40 hover:text-forest"
              }`
            }
          >
            <Icon size={18} strokeWidth={1.5} />
            {label}
          </NavLink>
        ))}
      </nav>

      <p className="px-3 text-[11px] uppercase tracking-widest text-forest/40">TransitOps © 2026</p>
    </aside>
  );
}
