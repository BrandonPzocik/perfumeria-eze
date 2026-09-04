/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        stone: "var(--color-surface, #F4F1EB)",
        "stone-soft": "var(--color-surface-soft, #FAF8F5)",
        ink: "var(--color-ink, #1C1814)",
        "ink-soft": "var(--color-ink-soft, #6B635A)",
        primary: "var(--color-primary, #3D3229)",
        "primary-deep": "var(--color-primary-deep, #1C1814)",
        accent: "var(--color-accent, #A68B5B)",
        "accent-soft": "var(--color-accent-soft, #D4C4A8)",
        bottle: "var(--color-bottle, #3D3229)",
        line: "var(--color-line, rgba(28,24,20,0.12))",
        "line-soft": "var(--color-line-soft, rgba(28,24,20,0.06))",
        wine: "var(--color-primary, #3D3229)",
        "wine-deep": "var(--color-primary-deep, #1C1814)",
        gold: "var(--color-accent, #A68B5B)",
        "gold-soft": "var(--color-accent-soft, #D4C4A8)",
        "gold-ink": "#5C4E3A",
        cream: "#FAF8F5",
      },
      fontFamily: {
        display: ["Barlow Condensed", "Arial Narrow", "sans-serif"],
        sans: ["Inter", "sans-serif"],
      },
      borderRadius: {
        card: "var(--radius-card, 6px)",
        pill: "var(--radius-pill, 999px)",
      },
      boxShadow: {
        card: "var(--shadow-card)",
        "card-hover": "var(--shadow-card-hover)",
        drawer: "var(--shadow-drawer)",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInRight: {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
        slideInLeft: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0)" },
        },
        slideInUp: {
          "0%": { transform: "translateY(100%)" },
          "100%": { transform: "translateY(0)" },
        },
        backdropIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
      },
      animation: {
        fadeIn: "fadeIn 0.5s ease both",
        fadeInUp: "fadeInUp 0.6s ease both",
        slideInRight: "slideInRight 0.35s cubic-bezier(0.4, 0, 0.2, 1) both",
        slideInLeft: "slideInLeft 0.35s cubic-bezier(0.4, 0, 0.2, 1) both",
        slideInUp: "slideInUp 0.35s cubic-bezier(0.4, 0, 0.2, 1) both",
        backdropIn: "backdropIn 0.25s ease both",
        float: "float 4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
