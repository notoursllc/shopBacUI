<script>
import Vue from 'vue';
import { FigTag } from '@notoursllc/figleaf';

export default Vue.extend({
    name: 'UsingColorValueBadge',

    components: {
        FigTag
    }
});
</script>


<template>
    <fig-tag
        size="sm"
        variant="light"
        pill>{{ $t('Using color value') }}</fig-tag>
</template>
