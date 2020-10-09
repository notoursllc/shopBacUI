<script>
import isObject from 'lodash.isobject';

export default {
    components: {
        VueSelect2: () => import('@/components/VueSelect2')
    },

    inheritAttrs: false,

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

    created() {
        this.getMessages();
    },

    methods: {
        async getMessages() {
            try {
                const data = await this.$api.productSkuAccentMessages.getAll({
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

        setSelectedValue() {
            this.selectedVal = this.options.find((obj) => obj.value === this.value);
        },

        onChange(obj) {
            console.log("ONCHANGE", obj)
            this.$emit(
                'input',
                isObject(obj) ? obj.value : null
            );
        }
    }
};
</script>


<template>
    <vue-select2
        v-model="selectedVal"
        :options="options"
        @input="onChange"
        v-bind="$attrs">
    </vue-select2>
</template>
