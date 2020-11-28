<script>
import Vue from 'vue';
import { FigBadge } from '@notoursllc/figleaf';

export default Vue.extend({
    name: 'UsingColorValueBadge',

    components: {
        FigBadge
    }
});
</script>


<template>
    <fig-badge
        size="sm"
        variant="light"
        pill>{{ $t('Using color value') }}</fig-badge>
</template>
