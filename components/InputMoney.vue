<script>
import accounting from 'accounting';
import { CurrencyDirective } from 'vue-currency-input';


export default {
    directives: {
        currency: CurrencyDirective
    },

    inheritAttrs: false,

    props: {
        value: {
            type: Number,
            default: 0
        }
    },

    data: function() {
        return {
            selectedPrice: null
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
                // console.log('watch', newVal, this.selectedPrice)

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
        emitInput() {
            let clean = 0;

            if(this.selectedPrice) {
                clean = accounting.toFixed(parseFloat(this.selectedPrice) * 100, 0);

                // accounting returns a string.  This converts back to a float
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
        type="text"
        v-bind="$attrs"
        @input="emitInput"
        class="input-money"
        v-currency="{
            currency: 'USD',
            locale: 'en-US',
            valueAsInteger: false,
            allowNegative: false,
            distractionFree: true,
            autoDecimalMode: true,
            valueRange: { min: 0 },
            allowNegative: false }" />
</template>


<style scoped>
.input-money {
    min-width: 70px;
}
</style>
