<script>
import {
    FigFormSelect
} from '@notoursllc/figleaf';

export default {
    name: 'DataTableSelect',

    components: {
        FigFormSelect
    },

    props: {
        value: {
            type: String,
            default: null
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
        }
    },

    created() {
        this.createOptions();
    },

    methods: {
        emitInput(val) {
            this.$emit('input', val);
        },

        async createOptions() {
            const dataTables = await this.$api.productDataTables.all();

            this.selectOptions = dataTables.map(obj => {
                return {
                    label: obj.name,
                    value: obj.id
                };
            });
        }
    }
};
</script>


<template>
    <fig-form-select
        v-model="selectedVal"
        :options="selectOptions"
        @input="emitInput"
        :reduce="obj => obj.value" />
</template>
