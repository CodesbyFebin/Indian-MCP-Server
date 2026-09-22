/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './app/**/*.{js,ts,jx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './lib/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1e40af',
        secondary: '#7c3aed',
        success: '#16a34a',
        warning: '#dc2525',
      },
    },
  },
  plugins: [],
};
