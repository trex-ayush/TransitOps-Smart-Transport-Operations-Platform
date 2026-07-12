/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        alabaster: "#F9F8F4",
        forest: "#2D3A31",
        sage: "#8C9A84",
        clay: "#DCCFC2",
        stone: "#E6E2DA",
        terracotta: "#C27B66",
        card: "#F2F0EB",
      },
      fontFamily: {
        serif: ['"Playfair Display"', "serif"],
        sans: ['"Source Sans 3"', "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 4px 6px -1px rgba(45, 58, 49, 0.05)",
        medium: "0 10px 15px -3px rgba(45, 58, 49, 0.05)",
        large: "0 20px 40px -10px rgba(45, 58, 49, 0.05)",
      },
    },
  },
  plugins: [],
};
