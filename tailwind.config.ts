/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          brand: {
            DEFAULT: '#E07856',
            light: '#FFF5F2',
            dark: '#C55E3E',
          },
          charcoal: '#2C2C2C',
          offwhite: '#FAFAF8',
          lightgray: '#F5F5F3',
        },
        fontFamily: {
          sans: ['Inter', 'system-ui', 'sans-serif'],
        },
      },
    },
    plugins: [],
  }