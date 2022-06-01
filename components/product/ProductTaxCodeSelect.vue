<script>
import { FigFormSelectStripeTaxCode } from '@notoursllc/figleaf';

export default {
    name: 'ProductTaxCodeSelect',

    components: {
        FigFormSelectStripeTaxCode
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
        },

        clearable: {
            type: Boolean,
            default: true
        }
    },

    data: function() {
        return {
            selected: null,
            whiteList: [
                'txcd_00000000', // Nontaxable
                'txcd_99999999', // General - Tangible goods
                'txcd_30011000', // Clothing and footwear
                'txcd_30011200', // Children's clothing and footwear
                'txcd_30060006', // Hats
                'txcd_30060007', // Jewelry
                'txcd_35010000', // Books
                'txcd_30060010', // Non-clothing accessories
            ]
        };
    },

    watch: {
        value: {
            handler(newVal) {
                this.selected = newVal;
            },
            immediate: true
        }
    },

    methods: {
        emitInput(val) {
            this.$emit('input', val);
        }
    }
};
</script>


<template>
    <fig-form-select-stripe-tax-code
        v-model="selected"
        :clearable="clearable"
        :placeholder="placeholder"
        :size="size"
        :white-list="whiteList"
        :tax-codes="$store.state.taxCodes"
        @input="emitInput" />
</template>
