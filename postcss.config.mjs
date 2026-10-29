// Tailwind stays on v3. @astrojs/tailwind only peers Astro 3–5, so PostCSS
// applies the same tailwindcss + autoprefixer pipeline the integration used
// (applyBaseStyles was already false; base styles live in src/styles/global.css).
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
