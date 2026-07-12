export default function PagePlaceholder({ title, subtitle }) {
  return (
    <div>
      <h2 className="font-serif text-4xl font-semibold text-forest">{title}</h2>
      {subtitle && <p className="mt-3 max-w-xl text-forest/60">{subtitle}</p>}
      <div className="mt-8 rounded-3xl border border-stone bg-white p-12 text-center shadow-soft">
        <p className="text-sm uppercase tracking-widest text-forest/40">
          Coming soon
        </p>
      </div>
    </div>
  );
}
