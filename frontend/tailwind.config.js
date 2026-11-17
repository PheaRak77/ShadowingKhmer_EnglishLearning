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
        sans: ['Poppins', 'Siemreap', 'system-ui', 'sans-serif'],
        khmer: ['Siemreap', 'Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
