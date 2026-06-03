/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: {
          900: '#0B0F19',
          800: '#111827',
          700: '#1F2937',
        },
        surface: {
          DEFAULT: '#161B26',
          light: '#232D3F',
        },
        accent: {
          emerald: '#10B981',
          blue: '#3B82F6',
          ruby: '#EF4444',
          amber: '#F59E0B',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
