/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        hasthi: {
          bg: '#f0f0f0',       
          yellow: '#d3af37',   
          text: '#0a0a0a'
        },
        gold: "#d3af37",
      },
      boxShadow: {
        card: "0 6px 15px rgba(0,0,0,0.25)",
        cardHover: "0 10px 20px rgba(0,0,0,0.35)",
      },
    },
  },
  plugins: [],
}
