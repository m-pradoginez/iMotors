/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Cores personalizadas para a identidade iMotors
        emerald: {
          500: '#10b981',
          600: '#059669',
          700: '#047857',
        },
        slate: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          400: '#94a3b8',
          500: '#64748b',
          900: '#0f172a',
        },
      },
      fontFamily: {
        // Definindo a Inter como padrão
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
