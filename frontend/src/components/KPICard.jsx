export default function KPICard({ label, value, icon: Icon }) {
  return (
    <div className="rounded-3xl border border-stone bg-white p-5 shadow-soft transition-transform duration-500 hover:-translate-y-1">
      <div className="flex items-start justify-between">
        <p className="text-[11px] uppercase tracking-widest text-forest/50">{label}</p>
        {Icon && <Icon size={18} strokeWidth={1.5} className="text-sage" />}
      </div>
      <p className="mt-3 font-serif text-3xl font-semibold text-forest">{value}</p>
    </div>
  );
}
