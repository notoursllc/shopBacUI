<script>
import Vue from 'vue';

import { FigIconSprite } from '@notoursllc/figleaf';

export default Vue.extend({
    components: {
        FigIconSprite
    }
});
</script>


<template>
    <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 bg-gray-100">
        <fig-icon-sprite />

        <div class="-mt-20 max-w-md w-full p-4 lg:p-8 shadow-md rounded-md bg-white">
            <nuxt />
        </div>
    </div>
</template>
