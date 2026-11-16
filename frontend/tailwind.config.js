/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#FAF9F6',
        primary: '#2563EB',
      },
      fontFamily: {
        sans: ['Inter', 'Kantumruy Pro', 'Noto Sans Khmer', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

