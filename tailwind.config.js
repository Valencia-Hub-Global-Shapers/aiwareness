/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#10151A",      // fondo casi negro, tono frío
        paper: "#F6F4EE",    // superficie clara para tarjetas
        signal: "#E6FF3C",   // acento "señal detectada" (verificación)
        alert: "#FF5A4E",    // acento IA detectada
        mute: "#6B7280",
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'IBM Plex Sans'", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
    },
  },
  plugins: [],
};
