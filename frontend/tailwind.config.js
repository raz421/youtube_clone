/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          base: "#9D4EDD",
          accent: "#22D3EE",
          ink: "#E6E6FA",
          muted: "#A1A1C2",
          surface: "rgba(24, 24, 36, 0.6)",
        },
      },
      fontFamily: {
        display: ["Sora", "sans-serif"],
        body: ["Space Grotesk", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 40px rgba(157, 78, 221, 0.35)",
        cyan: "0 0 35px rgba(34, 211, 238, 0.28)",
      },
      backgroundImage: {
        "vidvortex-radial":
          "radial-gradient(circle at 20% 20%, #1A0B2E 0%, #0A0A0B 40%, #050505 100%)",
      },
    },
  },
  plugins: [],
};
