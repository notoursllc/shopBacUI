<script>
import {
    FigTableSimple,
    FigTh,
    FigTd,
    FigOperationsDropdown,
    FigBooleanTag,
    FigMoney,
    FigAddress
} from '@notoursllc/figleaf';


export default {
    components: {
        FigTableSimple,
        FigTh,
        FigTd,
        FigOperationsDropdown,
        FigBooleanTag,
        FigMoney,
        FigAddress
    },

    data() {
        return {
            carts: []
        };
    },

    created() {
        this.$store.dispatch('ui/title', this.$t('Orders'));
        this.fetchClosedCarts();
    },

    methods: {
        async fetchClosedCarts(paramsObj) {
            try {
                this.carts = await this.$api.cart.list({
                    where: ['closed_at', 'is not', 'NULL'],
                    viewAllRelated: true,
                    ...paramsObj
                });
            }
            catch(e) {
                this.$figleaf.errorToast({
                    title: this.$t('Error'),
                    text: e.message
                });
            }
        },

        sortChanged(val) {
            this.fetchClosedCarts({
                sortBy: val.by,
                sortDesc: !val.isAsc
            });
        }
    }
};
</script>


<template>
    <div>
        <fig-table-simple
            striped
            hover
            @sort="sortChanged"
            :cell-padding="1">
            <template slot="head">
                <tr>
                    <fig-th sortable prop="closed_at">{{ $t('Created') }}</fig-th>
                    <fig-th right>{{ $t('Subtotal') }}</fig-th>
                    <fig-th right>{{ $t('Shipping') }}</fig-th>
                    <fig-th right>{{ $t('Tax') }}</fig-th>
                    <fig-th right>{{ $t('Grand total') }}</fig-th>
                    <fig-th right>{{ $t('# items') }}</fig-th>
                    <fig-th>{{ $t('Shipping address') }}</fig-th>
                </tr>
            </template>

            <tr v-for="(cart, idx) in carts" :key="idx">
                <!-- title -->
                <fig-td>
                    <nuxt-link
                        :to="{ name: 'reports-orders-id', params: { id: cart.id }}"
                        tag="a">{{ cart.closed_at | format8601 }}</nuxt-link>

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
                    <fig-money :cents="cart.grand_total" />
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
            </tr>
        </fig-table-simple>
    </div>
</template>