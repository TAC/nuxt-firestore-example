import { Configuration } from '@nuxt/types'
import envSet from '../.env/environment.js'
import pkg from './package.json'

const nuxtConfig: Configuration = {
  mode: 'universal',
  srcDir: 'src',

  env: envSet,

  /*
   ** Headers of the page
   */
  head: {
    title: pkg.name,
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: pkg.description }
    ],
    link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }]
  },

  /*
   ** Customize the progress-bar color
   */
  loading: { color: '#fff' },

  /*
   ** Global CSS
   */
  css: [],

  /*
   ** Plugins to load before mounting the App
   */
  plugins: [
    { src: '@/plugins/isLocalhost' },
    { src: '@/plugins/auth', ssr: false }
  ],

  /*
   ** Nuxt.js modules
   */
  modules: [['cookie-universal-nuxt', { parseJSON: false }]],

  /*
   ** Nuxt.js build modules
   */
  buildModules: ['@nuxt/typescript-build'],

  /*
   ** Build configuration
   */
  build: {
    publicPath: '/assets/',

    /*
     ** You can extend webpack config here
     */
    extend(config, ctx) {
      // Run ESLint on save
      if (ctx.isDev && ctx.isClient) {
        if (!config.module) return
        config.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue|ts)$/,
          loader: 'eslint-loader',
          exclude: /(node_modules|nuxt)/
        })
      }
    }
  }
}

export default nuxtConfig
