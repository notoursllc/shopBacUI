<script>
import {
    BCollapse,
    BInputGroup,
    BInputGroupAppend } from 'bootstrap-vue';

export default {
    name: 'SizeInput',

    components: {
        BCollapse,
        BInputGroup,
        BInputGroupAppend
    },

    props: {
        value: {
            type: String,
            default: null
        }
    },

    data: function() {
        return {
            selectedSize: null,
            showCollapse: false,
            predefinedSizes: [
                { label: 'Tshirt sizes', sizes: ['S', 'M', 'L', 'XL', '2XL'] },
                { label: 'Sweatshirt sizes', sizes: ['S', 'M', 'L', 'XL', '2XL'] }
            ]
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

    methods: {
        emitInput() {
            this.$emit('input', this.selectedSize);
        },

        toggleCollapse() {
            this.showCollapse = !this.showCollapse;
        },

        selectPredefined(size) {
            this.selectedSize = size;
            this.emitInput();
        }
    }
};
</script>


<template>
    <div class="d-inline-block">
        <b-input-group>
            <b-form-input
                v-model="selectedSize"
                @input="emitInput" />
            <b-input-group-append>
                <b-button
                    variant="outline-secondary"
                    @click="toggleCollapse">
                    <fig-icon :icon="showCollapse ? 'chevron-up' : 'chevron-down'" width="18" height="18" />
                </b-button>
            </b-input-group-append>
        </b-input-group>

        <b-collapse v-model="showCollapse" class="mt-2">
            <div
                v-for="(obj, index) in predefinedSizes"
                :key="index"
                :class="{'mb-2': predefinedSizes[index + 1]}">
                <div class="fs14">{{ obj.label }}:</div>
                <b-button
                    v-for="(size, idx) in obj.sizes"
                    :key="idx"
                    size="sm"
                    variant="light"
                    :class="{'mr-2': obj.sizes[idx + 1]}"
                    :disabled="selectedSize == size"
                    @click="selectPredefined(size)">{{ size }}</b-button>
            </div>
        </b-collapse>
    </div>
</template>
