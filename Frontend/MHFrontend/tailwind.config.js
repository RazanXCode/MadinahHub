/** @type {import('tailwindcss').Config} */
module.exports = {
  purge: [
    './src/**/*.html',
    './src/**/*.ts',
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#E69B6B',
        'secondary': '#2c3e50',
        'accent': '#8EA7C1', //Light Blue
        'neutral': '#F1D288', //Yellow
        'foreground': '#00100B', //Text
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
  plugins: [],
}