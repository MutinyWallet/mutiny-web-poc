const defaultTheme = require('tailwindcss/defaultTheme')

/** @type {import('tailwindcss').Config} */
module.exports = {
  plugins: [
    require('@tailwindcss/line-clamp'),
  ],
  content: [
    "./src/**/*.{js,ts,jsx,tsx}", // Note the addition of the `app` directory.
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      green: '#00D1A0',
      blue: '#6895F5',
      'dark-blue': '#071831',
      red: '#F61D5B',
      white: '#FFFFFF',
      'off-white': '#FBF5E9',
      black: '#000000',
      faint: "rgba(255,255,255,0.05)",
      "less-faint": "rgba(255,255,255,0.1)",
      "half-faint": "rgba(255,255,255,0.5)",
    },
    extend: {
      fontFamily: {
        'sans': ['Yantramanav', 'system-ui', ...defaultTheme.fontFamily.sans],
      },
      boxShadow: {
        'button': '2px 2px 4px rgba(0, 0, 0, 0.1), inset 4px 4px 4px rgba(255, 255, 255, 0.25), inset -4px -4px 6px rgba(0, 0, 0, 0.3)',
        'button-inverted': '2px 2px 4px rgba(0, 0, 0, 0.1), inset 4px 4px 4px rgba(0, 0, 0, 0.3), inset -4px -4px 6px rgba(255, 255, 255, 0.25)',
        'bar-bg': 'inset 0px 2px 4px rgba(0, 0, 0, 0.25)'
      },
      textShadow: {
        'button-text': '1px 1px 2px rgba(0, 0, 0, 0.15)'
      },
      backgroundImage: {
        'gray-button': 'linear-gradient(192.14deg, #FFFFFF -0.54%, #D9D9D9 101.77%)',
        'blue-button': 'linear-gradient(192.14deg, #6895F5 -0.54%, #3861CE 101.77%)',
        'green-button': 'linear-gradient(192.14deg, #00D1A0 -0.54%, #1EA67F 101.77%)',
        'fade-to-blue': 'linear-gradient(1.63deg, #0B215B 32.05%, rgba(11, 33, 91, 0) 84.78%)',
      },
      keyframes: {
        "fade-in": {
          '0%': { opacity: '0%' },
          '100%': { opacity: '100%' },
        }
      },
      animation: {
        "fade-in": 'fade-in 0.25s ease-in-out',
      }
    },
  },
  plugins: [],
}