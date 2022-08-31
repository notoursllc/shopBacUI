import { presets } from './node_modules/@notoursllc/figleaf/components/nuxtImgBunny/bunnyProvider.js';

const isDev = process.env.NODE_ENV === 'development';

if(isDev) {
    require('dotenv').config();
}

export default {

    ssr: false,

    vue: {
        config: {
            productionTip: isDev,
            devtools: isDev
        }
    },

    publicRuntimeConfig: {
        axios: {
            browserBaseURL: process.env.API_URL
        },
        BUG_SNAG_API_KEY: process.env.BUG_SNAG_API_KEY,
        DOMAIN_NAME: process.env.DOMAIN_NAME,
        EMAIL_INFO: process.env.EMAIL_INFO,
        IMAGE_MANAGER_MAX_IMAGES: process.env.IMAGE_MANAGER_MAX_IMAGES,
        IMAGE_MANAGER_MAX_FEATURED_IMAGES: process.env.IMAGE_MANAGER_MAX_FEATURED_IMAGES,
        SKU_IMAGE_MANAGER_MAX_IMAGES: process.env.SKU_IMAGE_MANAGER_MAX_IMAGES,

        SHIPPING_ADDRESS_FROM_ADDRESS1: process.env.SHIPPING_ADDRESS_FROM_ADDRESS1,
        SHIPPING_ADDRESS_FROM_CITY: process.env.SHIPPING_ADDRESS_FROM_CITY,
        SHIPPING_ADDRESS_FROM_COMPANY: process.env.SHIPPING_ADDRESS_FROM_COMPANY,
        SHIPPING_ADDRESS_FROM_COUNTRY_CODE: process.env.SHIPPING_ADDRESS_FROM_COUNTRY_CODE,
        SHIPPING_ADDRESS_FROM_PHONE: process.env.SHIPPING_ADDRESS_FROM_PHONE,
        SHIPPING_ADDRESS_FROM_STATE: process.env.SHIPPING_ADDRESS_FROM_STATE,
        SHIPPING_ADDRESS_FROM_ZIP: process.env.SHIPPING_ADDRESS_FROM_ZIP
    },

    /*
    ** Headers of the page
    ** See https://nuxtjs.org/api/configuration-head
    */
    head: {
        htmlAttrs: {
            lang: 'en',
            class: 'text-gray-600 h-full p-0 m-0 overflow-x-hidden overflow-y-scroll'
        },
        title: process.env.npm_package_name || '',
        meta: [
            { charset: 'utf-8' },
            { name: 'viewport', content: 'width=device-width, initial-scale=1' },
            { hid: 'description', name: 'description', content: process.env.npm_package_description || '' }
        ],
        link: [
            { rel: 'icon', type: 'image/x-icon', href: '/images/favicon.ico' }
        ],
        bodyAttrs: {
            class: 'h-full p-0 m-0 font-normal'
        }
    },

    telemetry: false,

    /*
    ** Global CSS
    */
    css: [
        '@/assets/css/base.css',
        '@/node_modules/@notoursllc/figleaf/assets/css/tailwind.css'
    ],

    /*
    * Plugins to load before mounting the App
    * https://nuxtjs.org/guide/plugins
    *
    * Naming your plugin 'xxx.client.js' will make it execute only on the client-side.
    * https://nuxtjs.org/guide/plugins/#name-conventional-plugin
    */
    plugins: [
        '@/plugins/bugsnag.client.js',
        '@/plugins/persistedState.client.js',
        '@/plugins/api.js',
        '@/plugins/http',
        '@/plugins/i18n.js',
        '@/plugins/vuelidate',
        '@/plugins/format8601',
        '@/plugins/prettyJson',
        '@/plugins/notifications',
        '@/plugins/figIcon',
        '@/plugins/globals',
        '@/node_modules/@notoursllc/figleaf/components/toaster',
        '@/node_modules/@notoursllc/figleaf/components/confirm'
        // { src: '@/plugins/youtube', ssr: false },
    ],

    /*
    ** Auto import components
    ** See https://nuxtjs.org/api/configuration-components
    */
    // components: true,

    /*
    ** Nuxt.js dev-modules
    */
    buildModules: [
        // Doc: https://github.com/nuxt-community/eslint-module
        // '@nuxtjs/eslint-module'
        '@nuxt/postcss8',
        '@nuxt/image'
    ],


    // Nuxt image config
    // https://image.nuxtjs.org/api/options/
    image: {
        providers: {
            // cloudflare: {
            //     provider: '~/providers/cloudflare',
            //     baseURL: 'https://imagedelivery.net/onkdurJr24OykoZY1xYs4g'
            // },
            bunny: {
                provider: '@/node_modules/@notoursllc/figleaf/components/nuxtImgBunny/bunnyProvider.js'
            }
        },
        // The screen sizes predefined by `@nuxt/image`:
        screens: {
            xs: 320,
            sm: 640,
            md: 768,
            lg: 1024,
            xl: 1280,
            xxl: 1536,
            '2xl': 1536
        },
        presets: {
            ...presets
        }
    },

    // serverMiddleware: {
    //     '/_ipx': '~/server/middleware/ipx.js'
    // },

    // serverMiddleware: [
    //     '~/server/middleware/redirects.js'
    // ],

    /*
    ** Nuxt.js modules
    */
    modules: [
        '@nuxt/http',
        '@nuxtjs/axios'
    ],

    router: {
        middleware: [
            'check-auth'
        ]
    },

    axios: {
        // will send the session cookie with the requests
        credentials: true,
        retry: { retries: 3 }
    },

    /*
    * HTTP module config
    * https://http.nuxtjs.org/api/
    */
    http: {
        proxyHeaders: true,
        https: !isDev,
        retry: 1
    },

    /*
    ** Build configuration
    ** See https://nuxtjs.org/api/configuration-build/
    */
    build: {
        postcss: {
            plugins: {
                tailwindcss: {},
                autoprefixer: {}
            }
        },

        babel: {
            plugins: [
                '@babel/plugin-proposal-optional-chaining'
            ]
        },

        // transpile: [/^element-ui/],
        transpile: [
            '@notoursllc/figleaf',
            '@notoursllc/breadvan-api',
            'lodash-es'
        ],

        /*
        ** You can extend webpack config here
        */
        extend (config, ctx) {
        }
    },

    loading: {
        color: '#67c23a',
        height: '4px',
        duration: 5000
    },

    pageTransition: {
        name: 'fade',
        mode: 'out-in'
    }
};
