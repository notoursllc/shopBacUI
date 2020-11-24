<script>
import uuid from 'uuid';
import {
    BInputGroup,
    BInputGroupAppend,
    BPopover
} from 'bootstrap-vue';

import {
    FigButton
} from '@notoursllc/figleaf';


export default {
    name: 'SizeInput',

    components: {
        BInputGroup,
        BInputGroupAppend,
        BPopover,
        FigButton
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
    <div class="d-inline-block">
        <b-input-group :size="size">
            <b-form-input
                v-model="selectedSize"
                @input="emitInput"
                :placeholder="placeholder" />
            <b-input-group-append>
                <fig-button
                    variant="plain"
                    @click="togglePopover"
                    :id="uuid"
                    :icon="showPopover ? 'chevron-up' : 'chevron-down'" />
            </b-input-group-append>
        </b-input-group>

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
