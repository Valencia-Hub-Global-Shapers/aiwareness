/** @type {import('tailwindcss').Config} */
// Paleta y tipografia alineadas con el sitio de Global Shapers Valencia Hub:
// papel calido, azul de marca y UN acento naranja usado con moderacion.
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: "#1B1A17", soft: "#46433D" }, // texto
        paper: { DEFAULT: "#FAF7F0", 2: "#F2EDE2" }, // fondo / superficies
        line: { DEFAULT: "#E4DDCE", strong: "#D0C7B2" }, // filetes
        muted: "#6B6559",
        blue: { DEFAULT: "#054985", deep: "#04365F" }, // accion principal
        accent: { DEFAULT: "#D6521D", deep: "#B4400E" }, // IA / incorrecto
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "3px",
      },
    },
  },
  plugins: [],
};
