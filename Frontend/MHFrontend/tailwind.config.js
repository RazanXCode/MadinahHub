import PrimeUI from 'tailwindcss-primeui';


/** @type {import('tailwindcss').Config} */
module.exports = {
  purge: [
    './src/**/*.html',
    './src/**/*.ts',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      backgroundColor: {
        surface: 'var(--p-content-background)',
      },
      colors: {
        content: {
          'hover-background': 'var(--p-content-hover-background)',
          background: 'var(--p-content-background)',
        },
        'primary': '#E69B6B',
        'secondary': '#2c3e50',
      },
      keyframes: {
        slideIn: {
          'from': { transform: 'translateY(20px)', opacity: '0' },
          'to': { transform: 'translateY(0)', opacity: '1' }
        }
      },
      animation: {
        'slideIn': 'slideIn 0.3s ease-out'
      }
    },
  },
  variants: {},
  plugins: [PrimeUI],
}