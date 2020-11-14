<script>
import isObject from 'lodash.isobject';
import size_input_mixin from '@/components/product/size/formInputs/size_input_mixin';
import {
    BInputGroup,
    BInputGroupAppend,
    BTooltip
} from 'bootstrap-vue';


export default {
    name: 'InputAppendCheckbox',

    components: {
        BTooltip,
        BInputGroup,
        BInputGroupAppend
    },

    mixins: [
        size_input_mixin
    ],

    props: {
        value: {
            type: Boolean
        },

        size: {
            type: String,
            default: 'sm'
        }
    },

    data: function() {
        return {
            inherit: false
        };
    },

    watch: {
        value: {
            handler(newVal) {
                this.inherit = newVal;
            },
            immediate: true
        }
    },

    methods: {
        emitInput() {
            this.$emit('input', this.inherit);
        }
    }
};
</script>


<template>
    <b-input-group :size="size" class="no-flex-wrap">
        <slot :checked="inherit"></slot>
        <b-input-group-append is-text>
            <b-form-checkbox
                v-b-tooltip.hover.right="getInheritTooltip(inherit)"
                v-model="inherit"
                plain
                @input="emitInput" />
        </b-input-group-append>
    </b-input-group>
</template>


<style lang="scss">
.no-flex-wrap {
    flex-wrap: nowrap !important
}
</style>
