const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  configureWebpack: {
    resolve: {
      alias: {
        'assets': '@/assets',
        'components': '@/components',
        'network': '@/network',
        'views': '@/views',
        'plugins': '@/plugins',
      }
    }
  },
  devServer: {
    port: 8787, // 自定义端口
    open: true, // 项目建成自动打开窗口
    proxy: {
      "/api": {
        target: "http://localhost:7070",  // 连接本地后端地址
        changeOrigin: true, 
        ws: true, 
        pathRewrite: {
          "^/api": "" 
        }
      },
    },
    client: {
      overlay: false, 
    },
  },
})