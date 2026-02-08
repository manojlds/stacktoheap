/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      fontFamily: {
        sans: ['Inter var', 'system-ui', 'sans-serif'],
      },
      typography: {
        DEFAULT: {
          css: {
            'code::before': {
              content: '""',
            },
            'code::after': {
              content: '""',
            },
            'blockquote p:first-of-type::before': {
              content: '""',
            },
            'blockquote p:last-of-type::after': {
              content: '""',
            },
          },
        },
        lg: {
          css: {
            h1: {
              fontSize: '1.75rem',
              marginTop: '2.5rem',
              marginBottom: '1rem',
              fontWeight: '700',
            },
            h2: {
              fontSize: '1.375rem',
              marginTop: '2rem',
              marginBottom: '0.75rem',
              fontWeight: '600',
            },
            h3: {
              fontSize: '1.175rem',
              marginTop: '1.75rem',
              marginBottom: '0.5rem',
              fontWeight: '600',
            },
            h4: {
              fontSize: '1.05rem',
              marginTop: '1.5rem',
              marginBottom: '0.5rem',
              fontWeight: '600',
            },
          },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
