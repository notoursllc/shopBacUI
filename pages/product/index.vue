<script>
import isObject from 'lodash.isobject';
import product_mixin from '@/mixins/product_mixin';
import BooleanTag from '@/components/BooleanTag';

import {
    FigButtonFab,
    FigTableSimple,
    FigTh,
    FigTd,
    FigTrNoResults,
    FigOperationsDropdown,
    FigVNodes,
    FigOverlay,
    FigPaginationWrapper,
    FigNuxtImgBunny
} from '@notoursllc/figleaf';

export default {
    components: {
        BooleanTag,
        FigButtonFab,
        FigTableSimple,
        FigTh,
        FigTd,
        FigTrNoResults,
        FigOperationsDropdown,
        FigVNodes,
        FigOverlay,
        FigPaginationWrapper,
        FigNuxtImgBunny
    },

    mixins: [
        product_mixin
    ],

    data() {
        return {
            loading: false,
            products: [],
            masterTypes: {},
            pagination: {
                _page: 1,
                _pageSize: 100
            },
            table: {
                _sort: 'updated_at:asc'
            },
            totalResults: 0
        };
    },

    created() {
        this.$store.dispatch('ui/title', this.$t('Products'));

        this.fetchProducts();
        this.fetchMasterTypes();
    },

    methods: {
        async fetchProducts(paramsObj) {
            try {
                this.loading = true;

                const { data, pagination } = await this.$api.product.list({
                    ...this.pagination,
                    ...this.table,
                    _withRelated: '*'
                });

                this.products = data;
                this.totalResults = pagination.rowCount;
            }
            catch(e) {
                this.$figleaf.errorToast({
                    title: this.$t('Error'),
                    text: e.message
                });
            }

            this.loading = false;
        },

        async fetchMasterTypes() {
            const { data } = await this.$api.masterType.list();
            const groupedTypes = {};

            if(Array.isArray(data)) {
                data.forEach((obj) => {
                    if(!groupedTypes.hasOwnProperty(obj.object)) {
                        groupedTypes[obj.object] = [];
                    }
                    groupedTypes[obj.object].push(obj);
                });
            }

            this.masterTypes = groupedTypes;
        },

        sortChanged(val) {
            this.table._sort = val;
            this.fetchProducts();
        },

        onPaginationChange(data) {
            this.pagination = { ...data };
            this.fetchProducts();
        },

        getMasterTypeLabel(object, value) {
            const labels = [];

            if(Array.isArray(this.masterTypes[object])) {
                this.masterTypes[object].forEach((obj) => {
                    if(value & obj.value) {
                        labels.push(obj.name);
                    }
                });
            }

            return labels.join(', ');
        },

        async onProductDelete(product) {
            const confirmed = await this.$showConfirm(
                this.$t('delete_name?', {name: product.title}),
                'warning'
            );

            if(!confirmed) {
                return;
            }

            try {
                await this.$api.product.delete(product.id);

                this.$figleaf.successToast({
                    title: this.$t('Success'),
                    text: `"${product.title}" deleted`
                });

                this.fetchProducts();
            }
            catch(e) {
                this.$figleaf.errorToast({
                    title: this.$t('Error'),
                    text: e.message
                });
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

            return this.$t('n_in_stock', { numInventory: totalInventoryCount });
        },


        getCoverImage(product) {
            let url = null;
            let altText = null;

            if(Array.isArray(product.variants)) {
                for(let i=0, l=product.variants.length; i<l; i++) {
                    const variant = product.variants[i];

                    if(Array.isArray(variant.images) && isObject(variant.images[0])) {
                        url = variant.images[0].url;
                        altText = variant.images[0].alt_text;
                        break;
                    }
                }
            }

            if(url) {
                return this.$createElement(
                    'fig-nuxt-img-bunny',
                    {
                        attrs: {
                            src: url,
                            alt: altText,
                            preset: 'prodthumbxs'
                        }
                    }
                );
            }
        },

        numPicsLabel(product) {
            let numPics = 0;

            if(Array.isArray(product.variants)) {
                product.variants.forEach((variant) => {
                    numPics += Array.isArray(variant.images) ? variant.images.length : 0;
                });
            }

            return this.$tc('n_pictures', numPics, { num: numPics });
        }
    }
};
</script>


<template>
    <div>
        <fig-button-fab icon="plus" @click="goToProductUpsert()" />

        <fig-pagination-wrapper
            bottom
            :total-records="totalResults"
            @perPage="onPaginationChange"
            @pageNumber="onPaginationChange">

            <fig-overlay :show="loading">
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
                            <fig-th sortable prop="gender_type">{{ $t('Gender') }}</fig-th>
                            <fig-th class="w-8"></fig-th>
                        </tr>
                    </template>

                    <tr v-for="(prod, idx) in products" :key="idx">
                        <!-- featured image -->
                        <fig-td class="text-center">
                            <div class="inline-block">
                                <fig-v-nodes :vnodes="getCoverImage(prod)" />
                            </div>
                            <div class="text-xs">{{ numPicsLabel(prod) }}</div>
                        </fig-td>

                        <!-- title -->
                        <fig-td>
                            {{ prod.title }}
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
                            {{ getMasterTypeLabel('product_sub_type', prod.sub_type) }}
                        </fig-td>

                        <!-- gender -->
                        <fig-td>
                            {{ getMasterTypeLabel('product_gender_type', prod.gender_type) }}
                        </fig-td>

                        <!-- actions -->
                        <fig-td class="text-center">
                            <fig-operations-dropdown
                                :show-view="false"
                                @edit="goToProductUpsert(prod.id)"
                                @delete="onProductDelete(prod)"
                                class="ml-1" />
                        </fig-td>
                    </tr>

                    <fig-tr-no-results v-if="!products.length" :colspan="6" />
                </fig-table-simple>
            </fig-overlay>

        </fig-pagination-wrapper>
    </div>
</template>
