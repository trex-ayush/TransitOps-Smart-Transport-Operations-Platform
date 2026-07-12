const variants = {
  primary: "bg-forest text-white hover:bg-terracotta",
  secondary: "border border-sage text-sage hover:bg-sage/10",
};

export default function Button({ variant = "primary", className = "", children, ...props }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-full px-6 py-2.5 text-sm uppercase tracking-widest transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-40 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
