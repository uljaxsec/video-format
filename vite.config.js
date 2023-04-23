import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'node:path'
import dns from 'node:dns'

//  禁用 DNS 解析地址重新排序的行为
dns.setDefaultResultOrder('verbatim')

/**
 * 详情见 vitejs 文档：https://vitejs.dev/config/
 */
export default defineConfig({
  plugins: [
    vue(),
    {
      name: 'configure-response-headers',
      configureServer: server => {
        server.middlewares.use('/', (_, res, next) => {
          res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp')
          res.setHeader('Cross-Origin-Opener-Policy', 'same-origin')
          next()
        })
      }
    },
  ],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  },
  server: {
    host: 'localhost',
    port: 5173,
    open: true,
    // proxy: {
    //   // 项目 api 的服务端接口地址
    //   '^\/website-service': {
    //     // target: 'http://10.236.2.22:8900/',  //  后台接口文档地址
    //     target: 'http://10.236.2.180:1803/',
    //     changeOrigin: true,
    //     // secure: false,
    //     // ws: false,
    //     logLevel: "debug",
    //     // rewrite: (path) => path.replace(/^\/website-service/, ''),
    //   },
    // },
  }
})
