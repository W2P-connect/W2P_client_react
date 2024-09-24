/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx,html}",
  ],
  theme: {
    extend: {
      // backgroundImage: {
      //   "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      //   "gradient-conic":
      //     "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      // },
      important: true,
      colors: {
        primary: {
          DEFAULT: 'rgb(15 42 23)',
          100: 'rgb(231,234,232)',
          200: 'rgb(207,212,209)',
          300: 'rgb(135,149,139)',
          400: 'rgba(63,85,69)',
          500: 'rgba(39,63,46)',
          600: 'rgba(15,42,23,1)',
        },
        secondary: {
          DEFAULT: 'rgb(77, 124, 15)',
          100: 'rgba(77, 124, 15, 0.2)',
          200: 'rgba(77, 124, 15, 0.4)',
          300: 'rgba(77, 124, 15, 0.6)',
          400: 'rgba(77, 124, 15, 0.8)',
          500: 'rgba(77, 124, 15, 1)',
        },
        third: {
          DEFAULT: 'rgba(163, 230, 53, .2)',
          50: 'rgba(163, 230, 53, .05)',
          100: 'rgba(163, 230, 53, .1)',
          200: 'rgba(163, 230, 53, .4)',
          300: 'rgba(163, 230, 53, .6)',
          400: 'rgba(163, 230, 53, 8)',
          500: 'rgba(163, 230, 53, 1)',
        },
        fith: {
          DEFAULT: '#65686f',
          100: '#7b7e85',
          200: '#92949c',
          300: '#a8aab2',
          400: '#bec0c8',
          500: '#d4d6de',
        },
        wooMain: {
          DEFAULT: '#674399',
          100: '#7a5db2',
          200: '#8e77cb',
          300: '#a292e4',
          400: '#b6adfd',
          500: '#c9c8ff',
        },
        pipedriveMain: {
          DEFAULT: '#6861f2',
          100: '#7d78f4',
          200: '#918ff6',
          300: '#a5a6f8',
          400: '#babdfb',
          500: '#cec4fd',
        },
        pipedriveSecondary: {
          DEFAULT: '#017737',
          100: '#018a45',
          200: '#019d52',
          300: '#01b060',
          400: '#01c36d',
          500: '#01d67b',
        },
      },
    },
  },
  plugins: [],
}