// tailwind.config.js

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}", // 关键：在这里告诉 Tailwind 要扫描哪些文件
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}