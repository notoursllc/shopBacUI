<script>
import isObject from 'lodash.isobject'

export default {
    props: {
        product: {
            type: Object,
            required: true
        },

        showStrikethrough: {
            type: Boolean,
            default: true
        },

        stacked: {
            type: Boolean,
            default: false
        }
    },

    computed: {
        basePrice: function() {
            if (isObject(this.product) && this.product.base_price) {
                return this.$n(this.product.base_price, 'currency');
            }

            return 0;
        },

        salePrice: function() {
            if (isObject(this.product)
                && this.product.is_on_sale
                && this.product.sale_price) {
                return this.$n(this.product.sale_price, 'currency');
            }

            return 0;
        }
    }
};
</script>

<template>
    <div class="inline-block">
        <div v-if="salePrice && basePrice && showStrikethrough">
            <div class="text-gray-500 line-through mr-1 hidden sm:block" :class="{ 'inline-block': !stacked }">{{ basePrice }}</div>
            <div class="inline-block">{{ salePrice }}</div>
        </div>
        <div v-else-if="salePrice" class="inline-block">{{ salePrice }}</div>
        <div v-else class="inline-block">{{ basePrice }}</div>
    </div>
</template>
