const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');
const webpack = require('webpack');
// CesiumJS源代码的路径
const cesiumSource = 'node_modules/cesium/Source';
const cesiumWorkers = '../Build/Cesium/Workers';

const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: '.',
  configureWebpack: {
    output: {
      sourcePrefix: ''
    },
    resolve: {
      fallback: { "https": false, "zlib": false, "http": false, "url": false },
    },
    plugins: [
      // 复制Cesium的Assets、Widgets和Workers到一个静态目录
      new CopyWebpackPlugin({
        patterns: [
          { from: path.join(cesiumSource, cesiumWorkers), to: 'Workers' },
          { from: path.join(cesiumSource, 'Assets'), to: 'Assets' },
          { from: path.join(cesiumSource, 'Widgets'), to: 'Widgets' },
          { from: path.join(cesiumSource, 'ThirdParty'), to: 'ThirdParty' }
        ]
      }),
      new webpack.DefinePlugin({
        //在Cesium中定义一个相对基本路径来加载资源
        CESIUM_BASE_URL: JSON.stringify('./')
      })
    ],
  },
  devServer: {//自定义项目启动选项
    port: 1327,
    host: 'localhost',
    open: true,
  }
})