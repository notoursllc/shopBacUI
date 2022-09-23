<script>
import { FigIconSprite } from '@notoursllc/figleaf';

export default {
    components: {
        FigIconSprite
    }
};
</script>


<template>
    <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 bg-gray-100">
        <fig-icon-sprite />
        <fig-toaster />

        <div class="-mt-20 max-w-md w-full p-4 lg:p-8 shadow-md rounded-md bg-white">
            <nuxt />
        </div>
    </div>
</template>
