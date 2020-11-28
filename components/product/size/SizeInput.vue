<script>
import uuid from 'uuid';
import {
    BPopover
} from 'bootstrap-vue';

import {
    FigButton,
    FigFormInput,
    FigFormInputEndcapper
} from '@notoursllc/figleaf';
import Button from '@notoursllc/figleaf/components/Button.vue';


export default {
    name: 'SizeInput',

    inheritAttrs: false,

    components: {
        BPopover,
        FigButton,
        FigFormInput,
        FigFormInputEndcapper
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
            default: null
        }
    },

    data: function() {
        return {
            selectedSize: null,
            showPopover: false,
            uuid: uuid(),
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

        togglePopover() {
            this.showPopover = !this.showPopover;
        },

        selectPredefined(size) {
            this.selectedSize = size;
            this.emitInput();
            this.togglePopover();
        }
    }
};
</script>


<template>
    <div class="w-full">

        <fig-form-input-endcapper>
            <fig-form-input
                v-model="selectedSize"
                @input="emitInput"
                :placeholder="placeholder"
                v-bind="$attrs"
                square-right />

            <fig-button
                slot="suffix"
                variant="naked"
                type="button"
                @click="togglePopover"
                :id="uuid"
                :icon="showPopover ? 'chevron-up' : 'chevron-down'" />
        </fig-form-input-endcapper>

        <b-popover
            :target="uuid"
            triggers="click"
            :show.sync="showPopover"
            placement="right"
            ref="popover">
            <div
                v-for="(obj, index) in predefinedSizes"
                :key="index"
                :class="{'mb-2': predefinedSizes[index + 1]}">
                <div class="fs14">{{ obj.label }}:</div>
                <fig-button
                    v-for="(sz, idx) in obj.sizes"
                    :key="idx"
                    size="sm"
                    variant="plain"
                    :class="{'mr-2': obj.sizes[idx + 1]}"
                    :disabled="selectedSize == sz"
                    @click="selectPredefined(sz)">{{ sz }}</fig-button>
            </div>
        </b-popover>
    </div>
</template>
