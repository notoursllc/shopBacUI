<script>
import product_mixin from '@/mixins/product_mixin';
import ProductDetailsJsonView from '@/components/product/ProductDetailsJsonView';

import {
    FigButtonFab
} from '@notoursllc/figleaf';

export default {
    components: {
        ProductDetailsJsonView,
        FigButtonFab
    },

    mixins: [
        product_mixin
    ],

    data() {
        return {
            product: {}
        };
    },

    async created() {
        try {
            this.product = await this.$api.products.get(this.$route.params.id);

            if(!this.product) {
                throw new Error(this.$t('Product not found'));
            }
        }
        catch(e) {
            this.$figleaf.errorToast({
                title: this.$t('Error'),
                text: e.message
            });
        }
    },

    methods: {
        goToEdit() {
            this.$router.push({
                name: 'product-upsert-id',
                params: { id: this.product.id }
            });
        }
    }
};
</script>


<template>
    <div>
        <fig-button-fab icon="edit" @click="goToEdit()" />

        <product-details-json-view :product="product"></product-details-json-view>
    </div>
</template>
