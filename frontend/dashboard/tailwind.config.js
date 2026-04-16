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
        // Tech-inspired professional colors (Google/Microsoft inspired)
        teal: {
          950: '#0d2e2a',
          900: '#0f3f3a',
          800: '#0d5251',
          700: '#0f6661',
          600: '#1a8680',
          500: '#23a598',
        },
        slate: {
          950: '#0f1419',
          900: '#1a1f2e',
        },
      },
    },
  },
  plugins: [],
  safelist: [
    // Risk/status badge colors used dynamically - tech company palette
    'bg-red-950', 'text-red-300', 'border-red-800',
    'bg-amber-950', 'text-amber-300', 'border-amber-800',
    'bg-yellow-950', 'text-yellow-300', 'border-yellow-800',
    'bg-green-950', 'text-green-300', 'border-green-800',
    'bg-teal-950', 'text-teal-300', 'border-teal-800',
    'bg-slate-950', 'text-slate-300', 'border-slate-800',
    'bg-red-50', 'text-red-700', 'border-red-200',
    'bg-amber-50', 'text-amber-700', 'border-amber-200',
    'bg-yellow-50', 'text-yellow-700', 'border-yellow-200',
    'bg-green-50', 'text-green-700', 'border-green-200',
    'bg-teal-50', 'text-teal-700', 'border-teal-200',
    'bg-slate-50', 'text-slate-700', 'border-slate-200',
    // Decision button active states
    'bg-green-600', 'bg-red-600', 'bg-teal-600',
    'border-green-600', 'border-red-600', 'border-teal-600',
  ],
}
