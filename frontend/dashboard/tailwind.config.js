/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gray: {
          950: '#0a0f1a',
        },
      },
    },
  },
  plugins: [],
  safelist: [
    // Risk/status badge colors used dynamically
    'bg-red-900', 'text-red-300', 'border-red-700',
    'bg-amber-900', 'text-amber-300', 'border-amber-700',
    'bg-yellow-900', 'text-yellow-300', 'border-yellow-700',
    'bg-green-900', 'text-green-300', 'border-green-700',
    'bg-red-100', 'text-red-700', 'border-red-300',
    'bg-amber-100', 'text-amber-700', 'border-amber-300',
    'bg-yellow-100', 'text-yellow-700', 'border-yellow-300',
    'bg-green-100', 'text-green-700', 'border-green-300',
    // Decision button active states
    'bg-green-600', 'bg-red-600', 'bg-purple-600',
    'border-green-600', 'border-red-600', 'border-purple-600',
  ],
}
