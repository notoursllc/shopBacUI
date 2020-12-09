<script>
import product_mixin from '@/mixins/product_mixin';
import OperationsDropdown from '@/components/OperationsDropdown';
import BooleanTag from '@/components/BooleanTag';
import Vnodes from '@/components/Vnodes';

import {
    FigButtonFab,
    FigTableSimple,
    FigTh,
    FigTd
} from '@notoursllc/figleaf';

export default {
    components: {
        OperationsDropdown,
        BooleanTag,
        Vnodes,
        FigButtonFab,
        FigTableSimple,
        FigTh,
        FigTd
    },

    mixins: [
        product_mixin
    ],

    data() {
        return {
            products: [],
            productSubTypes: []
        };
    },

    async created() {
        await Promise.all([
            this.fetchProducts(),
            this.fetchProductSubTypes()
        ]);
    },

    methods: {
        async fetchProducts(paramsObj) {
            try {
                this.products = await this.$api.products.list(paramsObj);
            }
            catch(err) {
                this.$errorToast(err.message);
            }
        },

        async fetchProductSubTypes() {
            this.productSubTypes = await this.$api.masterTypes.all({
                where: ['object', '=', 'product_sub_type']
            });
        },

        getSubTypeLabel(value) {
            const values = [];

            this.productSubTypes.forEach((obj) => {
                if(value & obj.value) {
                    values.push(obj.name);
                }
            });

            return values.join(', ');
        },

        sortChanged(val) {
            this.fetchProducts({
                sortBy: val.by,
                sortDesc: !val.isAsc
            });
        },

        async onProductDelete(product) {
            const confirmed = await this.$confirmModal(
                `Delete product "${product.title}"?`,
                'warning'
            );

            if(!confirmed) {
                return;
            }

            try {
                await this.$api.products.delete(product.id);
                this.$successToast(`"${product.title}" deleted successfully`);
                this.fetchProducts();
            }
            catch(e) {
                this.$errorToast(e.message);
            }
        },

        getNumPublishedPics(product) {
            let count = 0;

            const reducer = (accumulator, currentObj) => {
                return currentObj.published ? accumulator + 1 : accumulator;
            };

            if(Array.isArray(product.images)) {
                count += product.images.reduce(reducer, 0);
            }

            if(Array.isArray(product.skus)) {
                product.skus.forEach((sku) => {
                    count += sku.images.reduce(reducer, 0);
                });
            }

            return count;
        },


        getInventoryCountString(prod) {
            const numVariants = Array.isArray(prod.variants) ? prod.variants.length : 0;
            const totalInventoryCount = prod.total_inventory_count || 0;

            if(numVariants) {
                return this.$tc(
                    'n_in_stock_for_n_variants',
                    numVariants,
                    { numInventory: totalInventoryCount, numVariants: numVariants }
                );
            }

            return this.$t('n_in_stock', { numInventory: totalInventoryCount })
        },


        getFirstVariantImage(product) {
            let url = null;
            let altText = null;
            let smallestWidth = 0;

            // To make sure we only get the first published image
            let publishedImage = null;

            if(Array.isArray(product.skus)) {
                product.skus.forEach((sku) => {
                    if(Array.isArray(sku.images)) {
                        sku.images.forEach((img) => {
                            if(!publishedImage && img.published) {
                                publishedImage = img;

                                // the first published image is the baseline.
                                smallestWidth = publishedImage.width;
                                url = publishedImage.image_url;
                                altText = publishedImage.alt_text;

                                // now check to see if any of it's variants are smaller
                                if(Array.isArray(publishedImage.variants)) {
                                    publishedImage.variants.forEach((variant) => {
                                        if(variant.width < smallestWidth) {
                                            smallestWidth = variant.width;
                                            url = variant.image_url;
                                            // NOTE: variants do not have a separate alt_text property
                                        }
                                    });
                                }
                            }
                        });
                    }
                });
            }

            if(url) {
                const h = this.$createElement;
                return h(
                    'img',
                    {
                        attrs: {
                            src: url,
                            alt: altText
                        },
                        class: ['prodPicSmall']
                    }
                );
            }
        },

        numPicsLabel(product) {
            const numPublishedPics = this.getNumPublishedPics(product);
            return this.$tc('n_pictures', numPublishedPics, { num: numPublishedPics });
        }
    }
};
</script>


<template>
    <div>
        <fig-button-fab icon="plus" @click="goToProductUpsert()" />


        <fig-table-simple
            striped
            hover
            @sort="sortChanged">
            <template slot="head">
                <tr>
                    <fig-th></fig-th>
                    <fig-th sortable prop="title">{{ $t('Title') }}</fig-th>
                    <fig-th>{{ $t('Inventory') }}</fig-th>
                    <fig-th sortable prop="published">{{ $t('Published') }}</fig-th>
                    <fig-th sortable prop="sub_type">{{ $t('Sub Type') }}</fig-th>
                    <fig-th>{{ $t('Vendor') }}</fig-th>
                </tr>
            </template>

            <tr v-for="(prod, idx) in products" :key="idx">
                <!-- featured image -->
                <fig-td>
                    <vnodes :vnodes="getFirstVariantImage(prod)" />
                    <div class="text-xs">{{ numPicsLabel(prod) }}</div>
                </fig-td>

                 <!-- title -->
                <fig-td>
                    {{ prod.title }}
                    <operations-dropdown
                        :show-view="false"
                        @edit="goToProductUpsert(prod.id)"
                        @delete="onProductDelete(prod)"
                        class="ml-1" />
                </fig-td>

                <!-- inventory count -->
                <fig-td>
                    {{ getInventoryCountString(prod) }}
                </fig-td>

                <!-- published -->
                <fig-td>
                    <boolean-tag :value="prod.published" />
                </fig-td>

                <!-- sub type -->
                <fig-td>
                    {{ getSubTypeLabel(prod.sub_type) }}
                </fig-td>

                <!-- vendor -->
                <fig-td>
                    {{ prod.vendor }}
                </fig-td>
            </tr>
        </fig-table-simple>
    </div>
</template>


<style lang="scss">
    .prodPicSmall {
        width: 50px;
    }
</style>
