<script>
import { FigFormSelect } from '@notoursllc/figleaf';

// TODO: fetch predefined sizes from API

export default {
    name: 'SizeSelect',

    components: {
        FigFormSelect
    },

    props: {
        value: {
            type: String,
            default: null
        },

        placeholder: {
            type: String,
            default: null
        },

        size: {
            type: String,
            default: 'md'
        }
    },

    data: function() {
        return {
            selectedSize: null,
            predefinedSizes: [
                { label: 'S', value: 'S' },
                { label: 'M', value: 'M' },
                { label: 'L', value: 'L' },
                { label: 'XL', value: 'XL' },
                { label: '2XL', value: '2XL' }
            ]
        };
    },

    watch: {
        value: {
            handler(newVal) {
                this.selectedSize = newVal;
            },
            immediate: true
        }
    },

    methods: {
        emitInput() {
            this.$emit('input', this.selectedSize.label);
        }
    }
};
</script>


<template>
    <fig-form-select
        v-model="selectedSize"
        taggable
        :clearable="false"
        :options="predefinedSizes"
        :placeholder="placeholder"
        @input="emitInput"
        :size="size"
        v-bind="$attrs"
        class="w-full" />
</template>
