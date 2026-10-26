/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        navy: { DEFAULT: '#0B1F4B', 700: '#13306F' },
        electric: '#2563EB',
        teal: { DEFAULT: '#0FA3A3', soft: '#5EEAD4' },
        paper: '#F5F7FB',
        charcoal: { DEFAULT: '#14171F', card: '#1B1F2A', line: '#2A3040' },
      },
      fontFamily: {
        serif: ['Newsreader', 'Georgia', 'serif'],
        sans: ['"Public Sans"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
