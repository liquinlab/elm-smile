/* eslint-disable import/no-extraneous-dependencies */
/// <reference types="vitest" />
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import handlebars from 'vite-plugin-handlebars'
import Inspect from 'vite-plugin-inspect'
import { execSync } from 'child_process'
//import preLoaderPlugin from './plugins/preloader'
import stripDevToolPlugin from './plugins/strip-devtool'
import generateQRCode from './plugins/generate-qr.js'

// Execute git environment generation script
execSync('sh scripts/generate_git_env.sh', { stdio: 'inherit' })

// https://vitejs.dev/config/
export default ({ mode }) => {
  process.env = {
    ...loadEnv(mode, `${process.cwd()}/env/`, ''),
    ...loadEnv('deploy', `${process.cwd()}/env/`, ''),
    ...loadEnv('git', `${process.cwd()}/env/`, ''),
  }

  // import.meta.env.VITE_NAME available here with: process.env.VITE_NAME
  // import.meta.env.VITE_PORT available here with: process.env.VITE_PORT
  return defineConfig({
    // prettier-ignore
    plugins: [
      Inspect(),
      stripDevToolPlugin(),
      vue(),
      generateQRCode(),
      handlebars({
        context: {
          main_js: mode=='dashboard'? "/src/dev/dashboard/dashboard.js": "/src/core/main.js"
        }
      }),
      //preLoaderPlugin(),
    ],
    // if you need an additional page you have to list them here
    // see https://vitejs.dev/guide/build.html#multi-page-app
    // build: {
    //   rollupOptions: {
    //     input: {
    //       main: path.resolve(__dirname, 'index.html'),
    //       murk: path.resolve(__dirname, 'mturk.html'),
    //     },
    //   },
    // },
    envDir: 'env',
    base: process.env.VITE_DEPLOY_BASE_PATH,
    server: {
      port: process.env.VITE_DEV_PORT_NUM,
      strictPort: true,
    },
    clearScreen: false,
    test: {
      globals: true,
      environment: 'happy-dom',
      coverage: {
        all: true,
        enabled: true,
        src: path.resolve(__dirname, './src'),
        reporter: ['text', 'html'],
        provider: 'v8',
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        vue: 'vue/dist/vue.esm-bundler.js',
      },
    },
    define: {
      __BUILD_TIME__: JSON.stringify(new Date().toLocaleDateString()),
    },
  })
}
