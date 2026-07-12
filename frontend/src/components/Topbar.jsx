import { Search } from "lucide-react";

export default function Topbar() {
  return (
    <header className="sticky top-0 z-30 flex items-center gap-4 border-b border-stone bg-alabaster/80 px-8 py-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md">
        <Search
          size={18}
          strokeWidth={1.5}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-sage"
        />
        <input
          type="text"
          placeholder="Search..."
          className="w-full rounded-full border border-transparent bg-card py-2.5 pl-11 pr-4 text-sm transition-colors placeholder:text-forest/40 focus:border-sage focus:outline-none"
        />
      </div>

      <div className="ml-auto flex items-center gap-3">
        <span className="rounded-full border border-sage px-3 py-1 text-[11px] uppercase tracking-widest text-sage">
          Dispatcher
        </span>
        <span className="text-sm font-medium text-forest">Raven K.</span>
        <div className="grid h-9 w-9 place-items-center rounded-full bg-forest text-sm font-medium text-white">
          RK
        </div>
      </div>
    </header>
  );
}
