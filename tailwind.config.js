// https://tailwindcss.nuxtjs.org/tailwind-config/#default-configuration
const figleafTailwindConfig = require('@notoursllc/figleaf/tailwind.config.js');

// Add our own paths:
// figleafTailwindConfig.purge.enabled = true; //test only

figleafTailwindConfig.purge.content.push(
    'components/**/*.vue',
    'layouts/**/*.vue',
    'pages/**/*.vue',
    'plugins/**/*.js',
    'nuxt.config.js',
    'node_modules/@notoursllc/figleaf/components/**/*.vue',
    'node_modules/@notoursllc/figleaf/layouts/**/*.vue'
);

module.exports = Object.assign({}, figleafTailwindConfig);
