import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import path from 'path'

// https://vite.dev/config/
export default defineConfig(() => {
  return {
    plugins: [vue()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    // 配置环境变量前缀（默认为 VITE_）
    envPrefix: 'VITE_',
    // 指定环境变量文件所在目录
    envDir: path.resolve(__dirname, '..')
  }
})
