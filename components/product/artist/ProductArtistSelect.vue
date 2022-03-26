<script>
import { FigFormSelect } from '@notoursllc/figleaf';

export default {
    name: 'ProductArtistSelect',

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
            selected: null,
            selectOptions: []
        };
    },

    watch: {
        value: {
            handler(newVal) {
                this.selectOptions.forEach((opt) => {
                    if(newVal === opt.value) {
                        this.selected = opt;
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
        emitInput() {
            this.$emit('input', this.selected?.value);
        },

        async createOptions() {
            const { data } = await this.$api.product_artists.list({
                _sort: 'name:asc'
            });

            const opts = [];

            data.forEach((obj) => {
                if(obj.published) {
                    const opt = {
                        label: obj.name,
                        value: obj.id
                    };

                    opts.push(opt);

                    if(this.value === opt.value) {
                        this.selected = opt;
                    }
                }
            });

            this.selectOptions = opts;
        }
    }
};
</script>


<template>
    <fig-form-select
        v-model="selected"
        :clearable="clearable"
        :options="selectOptions"
        :placeholder="placeholder"
        @input="emitInput"
        :size="size"
        v-bind="$attrs"
        class="w-full" />
</template>
