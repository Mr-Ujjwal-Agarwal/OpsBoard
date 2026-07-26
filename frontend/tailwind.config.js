/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        base: {
          950: "#0A0E14",
          900: "#0F141C",
          800: "#151B26",
          700: "#1D2532",
          600: "#2A3444",
          500: "#3D4A5E",
        },
        ink: {
          100: "#EAEEF4",
          300: "#B7C0CE",
          500: "#7C8798",
          700: "#4C5563",
        },
        signal: {
          teal: "#2DD9C3",
          blue: "#4C8DFF",
          amber: "#F2B155",
          red: "#F0685B",
          green: "#3FCB7E",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["'IBM Plex Mono'", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      boxShadow: {
        panel: "0 1px 0 0 rgba(255,255,255,0.03) inset, 0 8px 24px -12px rgba(0,0,0,0.5)",
      },
      backgroundImage: {
        "grid-fade":
          "linear-gradient(to bottom, rgba(45,217,195,0.06), transparent 60%)",
      },
    },
  },
  plugins: [],
};
