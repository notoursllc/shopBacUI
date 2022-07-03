<script>
import { FigFormSelectBitwise } from '@notoursllc/figleaf';

export default {
    name: 'MasterTypeSelect',

    components: {
        FigFormSelectBitwise
    },

    props: {
        object: {
            type: String,
            required: true
        },

        value: {
            type: Number,
            default: null
        },

        multiple: {
            type: Boolean,
            default: true
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
                this.selectedVal = newVal;
            },
            immediate: true
        },

        object: {
            handler(newVal) {
                if(newVal) {
                    this.createOptions();
                }
            },
            immediate: true
        }
    },

    methods: {
        emitChange(val) {
            // when the select clear button is clicked then the val changes to "0",
            // but we want null instead:
            if(!val) {
                this.$emit('input', null);
            }
            else {
                this.$emit('input', val);
            }
        },

        createOptions() {
            const opts = [];

            this.$store.state.masterTypes[this.object].forEach((obj) => {
                opts.push({
                    label: obj.name,
                    value: obj.value
                });
            });

            this.selectOptions = opts;
        }
    }
};
</script>


<template>
    <fig-form-select-bitwise
        v-model="selectedVal"
        :options="selectOptions"
        :multiple="multiple"
        :clearable="clearable"
        @input="emitChange" />
</template>
