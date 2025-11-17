// /** @type {import('tailwindcss').Config} */
// export default {
//   content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
//   theme: {
//     extend: {},
//   },
//   plugins: [],
// };

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // ADD THIS SECTION:
      keyframes: {
        'drift': {
          '0%': { transform: 'translateX(-100%) translateY(0)' },
          '100%': { transform: 'translateX(100vw) translateY(-20px)' },
        },
        'drift-slow': {
          '0%': { transform: 'translateX(-100%) translateY(0)' },
          '100%': { transform: 'translateX(100vw) translateY(10px)' },
        },
        'drift-slower': {
          '0%': { transform: 'translateX(100vw) translateY(0)' },
          '100%': { transform: 'translateX(-100%) translateY(-15px)' },
        },
      },
      animation: {
        'drift': 'drift 25s linear infinite',
        'drift-slow': 'drift-slow 35s linear infinite',
        'drift-slower': 'drift-slower 40s linear infinite',
      },
    },
  },
  plugins: [],
}