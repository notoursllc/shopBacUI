<script>
import uuid from 'uuid';

import {
    FigButton,
    FigPopover
} from '@notoursllc/figleaf';

export default {
    components: {
        FigButton,
        FigPopover
    },

    inheritAttrs: false,

    props: {
        showConfirmButton: {
            type: Boolean,
            default: true
        },

        showCancelButton: {
            type: Boolean,
            default: true
        },

        confirmButtonLabel: {
            type: String,
            default: ''
        },

        cancelButtonLabel: {
            type: String,
            default: ''
        }
    },

    data() {
        return {
            uuid: uuid()
        };
    },

    computed: {
        confirmLabel() {
            return this.confirmButtonLabel || this.$t('OK');
        },

        cancelLabel() {
            return this.cancelButtonLabel || this.$t('cancel');
        },

        confirmRef() {
            return `btn-confirm-${this.uuid}`;
        },

        cancelRef() {
            return `btn-cancel-${this.uuid}`;
        },

        popoverRef() {
            return `popover-target-${this.uuid}`;
        }
    },

    methods: {
        onConfirmClick(e) {
            this.$emit('onConfirm', e);
            this.hide();
        },

        onCancelClick(e) {
            this.$emit('onCancel', e);
            this.hide();
        },

        focusCancelButton(isVisible) {
            if(isVisible) {
                this.$refs[this.cancelRef].$el.focus();
            }
        },

        hide() {
            this.$refs[this.popoverRef].hide();
        }
    }
};
</script>


<template>
    <fig-popover
        placement="top"
        @visible="focusCancelButton"
        :ref="popoverRef"
        v-bind="$attrs">

        <template v-slot:toggler>
            <slot name="reference"></slot>
        </template>

        <slot></slot>

        <div
            v-if="showConfirmButton || showCancelButton"
            slot="footer"
            class="text-right">
            <fig-button
                v-if="showCancelButton"
                variant="link"
                size="sm"
                @click="onCancelClick"
                :ref="cancelRef">{{ cancelLabel }}</fig-button>

            <fig-button
                v-if="showConfirmButton"
                variant="primary"
                size="sm"
                @click="onConfirmClick"
                :ref="confirmRef">{{ confirmLabel }}</fig-button>
        </div>
    </fig-popover>
</template>
