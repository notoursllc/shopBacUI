<script>
import isObject from 'lodash.isobject';
import { FigFormSelect } from '@notoursllc/figleaf';

export default {
    components: {
        FigFormSelect
    },

    props: {
        value: {},

        placeholder: {
            type: String,
            default: ''
        },

        options: {
            type: Array,
            required: true
        },

        multiple: {
            type: Boolean,
            default: true
        }
    },

    data: function() {
        return {
            selectedVal: []
        };
    },

    watch: {
        value: {
            handler(newVal) {
                this.setSelectedValue();
            },
            immediate: true
        },

        options: {
            handler(newVal) {
                this.setSelectedValue();
            },
            immediate: true
        }
    },

    methods: {
        selectValueChanged(valueArray) {
            let total = 0;

            if(!Array.isArray(valueArray)) {
                valueArray = [valueArray];
            }

            valueArray.forEach(function(obj) {
                if(isObject(obj)) {
                    total += obj.value;
                }
            });

            this.$emit('input', total);
        },

        setSelectedValue() {
            this.selectedVal = !this.multiple
                ? this.options.find((obj) => obj.value === this.value)
                : this.options.filter((obj) => obj.value & this.value);
        }
    }
};
</script>

<template>
    <fig-form-select
        v-model="selectedVal"
        :multiple="multiple"
        :placeholder="placeholder"
        :options="options"
        @input="selectValueChanged"
        class="w-full" />
</template>
