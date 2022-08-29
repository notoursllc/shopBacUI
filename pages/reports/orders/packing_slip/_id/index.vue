<script>
import isObject from 'lodash.isobject';
import {
    FigPackingSlipLayout,
    FigBvLogo,
    FigAddress,
    FigTableSimple,
    FigTh,
    FigTr,
    FigTd,
    FigNuxtImgBunny
} from '@notoursllc/figleaf';

export default {
    layout: 'blank',

    components: {
        FigPackingSlipLayout,
        FigBvLogo,
        FigAddress,
        FigTableSimple,
        FigTh,
        FigTr,
        FigTd,
        FigNuxtImgBunny
    },

    data() {
        return {
            cart: {}
        };
    },

    mounted() {
        this.getOrder();
    },

    methods: {
        async getOrder() {
            try {
                const { data } = await this.$api.cart.order.get(this.$route.params.id);
                this.cart = data.cart;

                if(!this.cart) {
                    throw new Error(this.$t('Cart not found'));
                }
            }
            catch(e) {
                this.$figleaf.errorToast({
                    title: this.$t('Error'),
                    text: e.message
                });
            }
        },

        getVariantImageUrl(variant) {
            if(Array.isArray(variant.images) && isObject(variant.images[0])) {
                return variant.images[0].url;
            }
            return null;
        }
    }
}
</script>

<template>
    <fig-packing-slip-layout v-bind="$props">
        <template v-slot:logo>
            <fig-bv-logo
                class="inline-block"
                width="80"
                height="80" />
        </template>

        <!-- shipping address -->
        <template v-slot:address_shipping>
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
        </template>

        <!-- billing address -->
        <template v-slot:address_billing>
            <template v-if="cart.billing_same_as_shipping">
                ({{ $t('Same as shipping address') }})
            </template>
            <fig-address
                v-else
                :first-name="cart.billing_firstName"
                :last-name="cart.billing_lastName"
                :company="cart.billing_company"
                :street-address="cart.billing_streetAddress"
                :extended-address="cart.billing_extendedAddress"
                :city="cart.billing_city"
                :state="cart.billing_state"
                :zip="cart.billing_postalCode"
                :country-code="cart.billing_countryCodeAlpha2" />
        </template>

        <!-- returns address-->
        <template v-slot:address_returns>
            <fig-address
                :street-address="$config.SHIPPING_ADDRESS_FROM_ADDRESS1"
                :city="$config.SHIPPING_ADDRESS_FROM_CITY"
                :state="$config.SHIPPING_ADDRESS_FROM_STATE"
                :zip="$config.SHIPPING_ADDRESS_FROM_ZIP"
                :country-code="$config.SHIPPING_ADDRESS_FROM_COUNTRY_CODE" />
        </template>

        <!-- order date -->
        <template v-slot:order_date>
            {{ cart.closed_at | format8601 }}
        </template>

        <!-- order date -->
        <template v-slot:order_number>
            {{ cart.id }}
        </template>

        <fig-table-simple
            striped
            bordered>
            <template slot="head">
                <fig-tr>
                    <fig-th>{{ $t('Image') }}</fig-th>
                    <fig-th>{{ $t('Item') }}</fig-th>
                    <fig-th>{{ $t('Quantity') }}</fig-th>
                </fig-tr>
            </template>

            <fig-tr v-for="(item, index) in cart.cart_items" :key="index">
                <!-- image -->
                <fig-td>
                    <fig-nuxt-img-bunny
                        v-if="getVariantImageUrl(item.product_variant)"
                        :src="getVariantImageUrl(item.product_variant)"
                        preset="prodthumb"
                        loading="eager" />
                </fig-td>

                <!-- item -->
                <fig-td>
                    {{ item.product.title }}
                </fig-td>

                <!-- quantity -->
                <fig-td class="">
                    {{ $n(item.qty) }}
                </fig-td>
            </fig-tr>
        </fig-table-simple>

        <template v-slot:footer>
            <div class="text-gray-600 text-xs">{{ $t('Thank you!') }}</div>
        </template>
    </fig-packing-slip-layout>
</template>

<style>

</style>
