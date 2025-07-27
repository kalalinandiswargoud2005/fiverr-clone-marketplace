// client/tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'fiverr-green': '#1dbf73', // Add this line for Fiverr's primary green
      },
    },
  },
  plugins: [],
}