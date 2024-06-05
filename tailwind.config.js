/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx,html}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "rgb(30, 30, 30)",
        secondary: "rgb(77 124 15/1)",
        third: "rgba(163, 230, 53, .2)",
        fith: "#65686f",
        wooMain: "#674399"
      },
    },
    plugins: [],
  }
}