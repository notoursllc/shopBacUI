<script>
import Vue from 'vue';
 import { VMoney } from 'v-money';
import accounting from 'accounting';
import { isNumeric } from '@/utils/common';

// register directive v-money and component <money>
// Vue.use(money, {precision: 2})

export default {

    directives: {
        money: VMoney
    },

    inheritAttrs: false,

    props: {
        value: {
            type: Number,
            default: 0
        },

        maxlength: {
            type: Number,
            default: 14
        }
    },


    data: function() {
        return {
            selectedPrice: null,
            money: {
                decimal: this.$t('money_decimal'),
                thousands: this.$t('money_thousands'),
                prefix: `${this.$t('money_symbol')}  `,
                suffix: '',
                precision: 2,
                masked: false,
                ...this.$attrs
            }
        };
    },

    watch: {
        value: {
            handler(newVal) {
                const val = parseInt(newVal);
                const cleanVal = isNumeric(val) ? val : 0;
                this.selectedPrice = cleanVal > 0 ? cleanVal/100 : 0;
            },
            immediate: true
        }
    },

    methods: {
        emitInput(val) {
            let clean = 0;

            if(val) {
                clean = val.toString().replace(new RegExp(this.money.thousands, 'g'), '');
                clean = val.replace(this.money.prefix, '');
                //  clean = accounting.toFixed(parseFloat(clean) * 100, 0);
                clean = parseFloat(clean) * 100;
            }

            this.$emit('input', parseInt(clean, 10));
        }
    }
};
</script>


<template>
    <b-form-input
        v-model.lazy="selectedPrice"
        v-bind="$attrs"
        v-money="money"
        @input="emitInput"
        :maxlength="maxlength" />
</template>
