/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ocean: {
          50: '#caf0f8',
          100: '#90e0ef',
          200: '#00b4d8',
          300: '#0077b6'
        },
        alert: {
          warn: '#ffb703',
          danger: '#ef233c'
        }
      },
      boxShadow: {
        float: '0 10px 30px -10px rgba(0,123,167,0.25)'
      }
    }
  },
  plugins: []
}


