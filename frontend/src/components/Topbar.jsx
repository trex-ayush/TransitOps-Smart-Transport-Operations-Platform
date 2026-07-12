import { Link } from "react-router-dom";
import { Search, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const initials = (name) =>
  name
    ? name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase()
    : "?";

export default function Topbar() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex items-center gap-4 border-b border-stone bg-alabaster/80 px-8 py-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md">
        <Search size={18} strokeWidth={1.5} className="absolute left-4 top-1/2 -translate-y-1/2 text-sage" />
        <input
          type="text"
          placeholder="Search..."
          className="w-full rounded-full border border-transparent bg-card py-2.5 pl-11 pr-4 text-sm transition-colors placeholder:text-forest/40 focus:border-sage focus:outline-none"
        />
      </div>

      <div className="ml-auto flex items-center gap-3">
        <span className="rounded-full border border-sage px-3 py-1 text-[11px] uppercase tracking-widest text-sage">
          {user?.role}
        </span>
        <Link to="/profile" className="flex items-center gap-3 transition-opacity hover:opacity-80">
          <span className="text-sm font-medium text-forest">{user?.name}</span>
          <div className="grid h-9 w-9 place-items-center rounded-full bg-forest text-sm font-medium text-white">
            {initials(user?.name)}
          </div>
        </Link>
        <button onClick={logout} className="text-forest/40 transition-colors hover:text-terracotta" title="Log out">
          <LogOut size={18} strokeWidth={1.5} />
        </button>
      </div>
    </header>
  );
}
