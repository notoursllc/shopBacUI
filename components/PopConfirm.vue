<script>
import uuid from 'uuid';
import Pop from '@/components/Pop';

import {
    FigButton
} from '@notoursllc/figleaf';

export default {
    components: {
        Pop,
        FigButton
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

        focusCancelButton() {
            this.$refs[this.cancelRef].focus();
        },

        hide() {
            this.$refs[this.popoverRef].hide();
        }
    }
};
</script>


<template>
    <pop
        :ref="popoverRef"
        @shown="focusCancelButton"
        v-bind="$attrs"
        v-on="$listeners">
        <slot></slot>

        <div class="ptm tar" v-if="showConfirmButton || showCancelButton">
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

        <template v-slot:reference>
            <slot name="reference"></slot>
        </template>
    </pop>
</template>
