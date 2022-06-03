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

        /**
         * Get all of the product artists.
         * However only the 'is_global' ones are added to the options
         * UNLESS the value prop (artis id) matches an artist where
         * is_global is false
         */
        async createOptions() {
            const { data } = await this.$api.product_artists.list({
                _sort: 'name:asc'
            });

            const opts = [];

            data.forEach((obj) => {
                const opt = {
                    label: obj.name,
                    value: obj.id
                };

                if (this.value === opt.value) {
                    opts.push(opt);
                    this.selected = opt;
                }
                else if(obj.published && obj.is_global) {
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
