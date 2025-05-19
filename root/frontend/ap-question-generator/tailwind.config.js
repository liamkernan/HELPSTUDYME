/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        pastelBlue: '#a3cef7',     // A soft, cool blue
        pastelTeal: '#a0e7e5',     // A calming teal
        pastelGreen: '#b2f2bb',    // A gentle green
        pastelPurple: '#c3b1e1',   // A light, cool purple
        pastelMint: '#b3e283',     // A refreshing mint green
        pastelLavender: '#c6a4d3', // A muted lavender
      },
    },
  },
  plugins: [],
};