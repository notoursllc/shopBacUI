<script>
import {
    FigTableSimple,
    FigTr,
    FigTh,
    FigTd,
    FigTrNoResults,
    FigMoney,
    FigAddress,
    FigPaginationWrapper,
    FigTag
} from '@notoursllc/figleaf';


export default {
    components: {
        FigTableSimple,
        FigTr,
        FigTh,
        FigTd,
        FigTrNoResults,
        FigMoney,
        FigAddress,
        FigPaginationWrapper,
        FigTag
    },

    data() {
        return {
            carts: [],
            pagination: {
                _page: 1,
                _pageSize: 100
            },
            table: {
                _sort: 'closed_at:desc'
            },
            totalResults: 0
        };
    },

    created() {
        this.$store.dispatch('ui/title', this.$t('Orders'));
        this.fetchData();
    },

    methods: {
        async fetchData() {
            try {
                const response = await this.$api.cart.closed({
                    _withRelated: '*',
                    ...this.pagination,
                    ...this.table
                });

                this.carts = response?.data || [];
                this.totalResults = response?.pagination.rowCount || 0;
            }
            catch(e) {
                this.$figleaf.errorToast({
                    title: this.$t('Error'),
                    text: e.message
                });
            }
        },

        onPaginationChange(data) {
            this.pagination = { ...data };
            this.fetchData();
        },

        sortChanged(val) {
            this.table._sort = val;
            this.fetchData();
        }
    }
};
</script>


<template>
    <fig-pagination-wrapper
        bottom
        :total-records="totalResults"
        @perPage="onPaginationChange"
        @pageNumber="onPaginationChange">

        <fig-table-simple
            striped
            hover
            @sort="sortChanged"
            :cell-padding="1">
            <template slot="head">
                <fig-tr>
                    <fig-th right>{{ $t('Grand total') }}</fig-th>
                    <fig-th right>{{ $t('Subtotal') }}</fig-th>
                    <fig-th right>{{ $t('Shipping') }}</fig-th>
                    <fig-th right>{{ $t('Tax') }}</fig-th>
                    <fig-th right>{{ $t('# items') }}</fig-th>
                    <fig-th>{{ $t('Shipping address') }}</fig-th>
                    <fig-th sortable prop="shipped_at">{{ $t('Shipped at') }}</fig-th>
                    <fig-th sortable prop="closed_at">{{ $t('Created') }}</fig-th>
                </fig-tr>
            </template>

            <fig-tr v-for="(cart, idx) in carts" :key="idx">
                <fig-td class="text-right">
                    <nuxt-link
                        :to="{ name: 'reports-orders-id', params: { id: cart.id }}"
                        tag="a"><fig-money :cents="cart.grand_total" /></nuxt-link>
                    <!-- <fig-operations-dropdown
                        :show-view="false"
                        @edit="goToProductUpsert(prod.id)"
                        @delete="onProductDelete(prod)"
                        class="ml-1" /> -->
                </fig-td>

                <fig-td class="text-right">
                    <fig-money :cents="cart.sub_total" />
                </fig-td>

                <fig-td class="text-right">
                    <fig-money :cents="cart.shipping_total" />
                </fig-td>

                <fig-td class="text-right">
                    <fig-money :cents="cart.sales_tax" />
                </fig-td>

                <fig-td class="text-right">
                    {{ $n(cart.num_items) }}
                </fig-td>

                <fig-td>
                    <fig-address
                        :first-name="cart.shipping_firstName"
                        :last-name="cart.shipping_lastName"
                        :company="cart.shipping_company"
                        :street-address="cart.shipping_streetAddress"
                        :extended-address="cart.shipping_extendedAddress"
                        :city="cart.shipping_city"
                        :state="cart.shipping_state"
                        :zip="cart.shipping_postalCode"
                        :country-code="cart.shipping_countryCodeAlpha2" />
                </fig-td>

                <!-- shipped at -->
                <fig-td>
                    <template v-if="cart.shipped_at">{{ cart.shipped_at | format8601 }}</template>
                    <template v-else>
                        <fig-tag
                            variant="warning"
                            size="sm">{{ $t('not shipped') }}</fig-tag>
                    </template>
                </fig-td>

                <!-- Created -->
                <fig-td>
                    {{ cart.closed_at | format8601 }}
                </fig-td>
            </fig-tr>

            <fig-tr-no-results v-if="!carts.length" :colspan="8" />
        </fig-table-simple>

    </fig-pagination-wrapper>
</template>
