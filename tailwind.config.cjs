/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./**/*.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        mirage: {
          50: "#f6f6f7",
          100: "#e1e3e6",
          200: "#c3c7cc",
          300: "#9da2ab",
          400: "#787d89",
          500: "#5e636e",
          600: "#4a4d57",
          700: "#3e4047",
          800: "#34353b",
          900: "#202124",
        },
      },
    },
  },
  plugins: [],
};
