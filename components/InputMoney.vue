<script>
import accounting from 'accounting';

export default {

    inheritAttrs: false,

    props: {
        value: {
            type: Number,
            default: 0
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
            /**
             * Value is sent as a number (in cents) that needs
             * to be converted to 'dollars' (divide by 100)
             */
            handler(newVal) {
                this.selectedPrice = newVal ? newVal/100 : 0;
                // console.log('input money val watch', newVal, this.selectedPrice)

            },
            immediate: true
        }
    },

    methods: {
        /**
         * Value is emitted as a number (cents)
         *
         * @param val String
         */
        emitInput(val) {
            let clean = 0;

            if(val) {
                clean = accounting.toFixed(parseFloat(val) * 100, 0);
                clean = parseFloat(clean);
            }

            // console.log('MONEY EMIT CLEAN', clean, typeof clean)
            this.$emit('input', clean);
        }
    }
};
</script>


<template>
    <b-form-input
        v-model="selectedPrice"
        type="number"
        min="0"
        max="9999999"
        step=".01"
        v-bind="$attrs"
        @input="emitInput"
        class="input-money" />
</template>


<style scoped>
.input-money {
    min-width: 70px;
}
</style>
