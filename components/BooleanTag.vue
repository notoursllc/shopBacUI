<script>
import {
    FigTag
} from '@notoursllc/figleaf';

export default {
    name: 'BooleanTag',

    components: {
        FigTag
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
    <fig-tag
        :variant="tagType"
        v-on="$listeners"
        :pill="pill"
        :size="size">{{ label }}</fig-tag>
</template>
