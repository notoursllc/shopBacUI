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
    <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <fig-icon-sprite />
        <fig-toaster />

        <div class="max-w-md w-full space-y-8">
            <nuxt />
        </div>
    </div>
</template>


