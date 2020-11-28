<script>
import {
    FigBadge
} from '@notoursllc/figleaf';

export default {
    name: 'BooleanTag',

    components: {
        FigBadge
    },

    props: {
        value: {
            type: Boolean
        },

        pill: {
            type: Boolean,
            default: false
        },

        size: {
            type: String,
            default: 'lg'
        }
    },

    computed: {
        label() {
            return this.value ? this.$t('Yes') : this.$t('No');
        },

        tagType() {
            return this.value ? 'success' : 'error';
        }
    }
};
</script>

<template>
    <fig-badge
        :variant="tagType"
        v-on="$listeners"
        :pill="pill"
        :size="size">{{ label }}</fig-badge>
</template>
