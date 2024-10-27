// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",  // Includes all React components
    "./public/index.html",          // Optional if needed for index.html styling
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
