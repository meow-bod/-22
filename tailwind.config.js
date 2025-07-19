const { fontFamily } = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FFB74D', // 柔和的橘色
          dark: '#FFA726', // 一個稍深的橘色，用於 hover 效果
        },
        secondary: {
          DEFAULT: '#607D8B', // 灰藍色
        },
        background: {
          DEFAULT: '#FFFFFF', // 純白
          subtle: '#F7F9FC', // 極淺的米灰色
        },
        text: {
          main: '#333333', // 主要文字
          subtle: '#757575', // 次要文字
        },
      },
      fontFamily: {
        sans: ['var(--font-nunito)', ...fontFamily.sans],
      },
    },
  },
  plugins: [],
};