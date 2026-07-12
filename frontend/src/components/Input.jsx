export default function Input({ label, className = "", ...props }) {
  return (
    <label className="block">
      {label && (
        <span className="mb-1.5 block text-[11px] uppercase tracking-widest text-forest/50">
          {label}
        </span>
      )}
      <input
        className={`w-full rounded-full border border-transparent bg-card px-4 py-2.5 text-sm text-forest transition-colors placeholder:text-forest/40 focus:border-sage focus:outline-none ${className}`}
        {...props}
      />
    </label>
  );
}
