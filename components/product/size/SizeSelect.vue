<script>
import { FigFormSelect } from '@notoursllc/figleaf';

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
            selectOptions: []
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

    created() {
        this.createOptions();
    },

    methods: {
        emitInput() {
            this.$emit('input', this.selectedSize.label);
        },

        async createOptions() {
            const { data } = await this.$api.masterType.all({
                where: ['object', '=', 'product_size_type'],
                sortBy: 'ordinal',
                sortDesc: false
            });

            this.selectOptions = data.map(obj => {
                return {
                    label: obj.name,
                    value: obj.value,
                    disabled: !obj.published
                };
            });
        }
    }
};
</script>


<template>
    <fig-form-select
        v-model="selectedSize"
        taggable
        :clearable="false"
        :options="selectOptions"
        :placeholder="placeholder"
        @input="emitInput"
        :size="size"
        v-bind="$attrs"
        class="w-full" />
</template>
