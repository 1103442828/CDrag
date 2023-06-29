
import resolve from 'rollup-plugin-node-resolve'; 
import commonjs from 'rollup-plugin-commonjs';
import babel from "rollup-plugin-babel";
import image from '@rollup/plugin-image';
import { terser } from 'rollup-plugin-terser';
export default {
  input: 'index.js', // 打包的入口文件
  output:{
    name: 'cdrag',  // 输入的包名
    file: './lib/index.js',
    format: 'umd'
  },
  plugins: [
    image(),
    resolve(),
    commonjs(),
    babel({
      exclude: 'node_modules/**',
      runtimeHelpers: true,
    }),
    terser(),
  ],
  ignore: [
    "node_modules/**" // 忽略目录
  ]
  
}