<script>
import { FigIconSprite } from '@notoursllc/figleaf';

export default {
    components: {
        FigIconSprite
    }
};
</script>


<template>
    <div class="flex min-h-screen relative text-sm">
        <fig-icon-sprite />

        <div class="w-full md:p-6 sm:p-4">
            <nuxt />
        </div>
    </div>
</template>
