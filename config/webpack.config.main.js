/**
 * Webpack config for production electron main process
 */

 const path = require('path')
 const webpack = require('webpack')
 // import path from 'path';
 // import webpack from 'webpack';
 // import merge from 'webpack-merge';
 // import TerserPlugin from 'terser-webpack-plugin';
 const TerserPlugin = require('terser-webpack-plugin')
 // import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
 // import baseConfig from './webpack.config.base';
 // import CheckNodeEnv from '../internals/scripts/CheckNodeEnv';
 // import DeleteSourceMaps from '../internals/scripts/DeleteSourceMaps';
 
 // CheckNodeEnv('production');
 // DeleteSourceMaps();
 
 // merge.smart({}, 
 module.exports = {
 // export default {
   devtool: process.env.DEBUG_PROD === 'true' ? 'source-map' : 'hidden-source-map',
   mode: 'production',
   target: 'electron-main',
   entry: path.resolve(__dirname, '../main/index.js'),
   output: {
     path: path.join(__dirname, '../build'),
     filename: 'main.js'
   },
   optimization: {
     // minimizer: process.env.E2E_BUILD
     //   ? []
     //   : [
     //       new TerserPlugin({
     //         parallel: true,
     //         sourceMap: true,
     //         cache: true
     //       })
     //     ]
     minimizer: [
       new TerserPlugin({
         parallel: true,
         terserOptions: {
           ecma: undefined,
           warnings: false,
           parse: {},
           compress: {
             drop_console: true,
             drop_debugger: true,
             pure_funcs: ['console.log']
           },
         },
       })
     ]
   },
 
   plugins: [
     // new BundleAnalyzerPlugin({
     //   analyzerMode:
     //     process.env.OPEN_ANALYZER === 'true' ? 'server' : 'disabled',
     //   openAnalyzer: process.env.OPEN_ANALYZER === 'true'
     // }),
 
     /**
      * Create global constants which can be configured at compile time.
      *
      * Useful for allowing different behaviour between development builds and
      * release builds
      *
      * NODE_ENV should be production so that modules do not perform certain
      * development checks
      */
     new webpack.EnvironmentPlugin({
       NODE_ENV: 'production'
     })
   ],
 
   /**
    * Disables webpack processing of __dirname and __filename.
    * If you run the bundle in node.js it falls back to these values of node.js.
    * https://github.com/webpack/webpack/issues/2010
    */
   node: {
     __dirname: false,
     __filename: false
   }
 }
 // );