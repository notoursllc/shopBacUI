<script>
import {
    FigFormSelect
} from '@notoursllc/figleaf';

export default {
    components: {
        FigFormSelect
    },

    props: {
        value: {
            type: String,
            default: null
        }
    },

    data() {
        return {
            selectedVal: null,
            data: [],
            options: []
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
        this.getMessages();
    },

    methods: {
        async getMessages() {
            try {
                // TODOs
                const data = await this.$api.productAccentMessages.all({
                    sortBy: 'message',
                    sortDesc: false
                });
                const options = [];

                if(Array.isArray(data)) {
                    data.forEach((obj) => {
                        options.push({
                            label: obj.message,
                            value: obj.id
                        });
                    });
                }

                this.options = options;
            }
            catch(e) {
                this.$errorToast(e.message);
            }
        },

        onChange(val) {
            this.$emit('input', val);
        }
    }
};
</script>


<template>
    <fig-form-select
        v-model="selectedVal"
        :options="options"
        @input="onChange"
        :reduce="obj => obj.value" />
</template>
