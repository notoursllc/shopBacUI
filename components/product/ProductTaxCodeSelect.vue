<script>
import { FigFormSelect } from '@notoursllc/figleaf';

export default {
    name: 'ProductTaxCodeSelect',

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
        },

        clearable: {
            type: Boolean,
            default: true
        }
    },

    data: function() {
        return {
            selectedVal: null,
            selectOptions: []
        };
    },

    watch: {
        value: {
            handler(newVal) {
                this.$store.state.taxCodes.forEach((obj) => {
                    if(obj.value === newVal) {
                        this.selectedVal = obj;
                    }
                });
            },
            immediate: true
        }
    },

    created() {
        this.createOptions();
    },

    methods: {
        emitInput(val) {
            // when the select clear button is clicked then the val changes to "0",
            // but we want null instead:
            if(!val) {
                this.$emit('input', null);
            }
            else {
                this.$emit('input', val.value);
            }
        },

        createOptions() {
            const opts = [];

            this.$store.state.taxCodes.forEach((obj) => {
                opts.push({
                    label: obj.name,
                    value: obj.id
                });
            });

            this.selectOptions = opts;
        }
    }
};
</script>


<template>
    <fig-form-select
        v-model="selectedVal"
        :clearable="clearable"
        :options="selectOptions"
        :placeholder="placeholder"
        @input="emitInput"
        :size="size"
        v-bind="$attrs"
        class="w-full" />
</template>
