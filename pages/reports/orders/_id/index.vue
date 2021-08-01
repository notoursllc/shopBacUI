<script>
import {
    FigAddress,
    FigSpecLayout,
    FigSpec,
    FigTag,
    FigIconLabel,
    FigIcon,
    FigLabelValueGroup,
    FigLabelValue,
    FigMoney
} from '@notoursllc/figleaf';

export default {
    components: {
        FigAddress,
        FigSpecLayout,
        FigSpec,
        FigTag,
        FigIconLabel,
        FigIcon,
        FigLabelValueGroup,
        FigLabelValue,
        FigMoney
        // ShippingLabelButton: () => import('@/components/payment/ShippingLabelButton'),
    },

    data() {
        return {
            cart: null
        };
    },

    created() {
        this.getCart();
    },

    methods: {
        // async viewPackingSlip() {
        //     const response = await this.$api.cart.get(this.payment.id);
        //     window.open(response.slip_url);
        // },

        async getCart() {
            try {
                this.cart = await this.$api.cart.get(this.$route.params.id, {
                    relations: true
                });

                if(!this.cart) {
                    throw new Error(this.$t('Cart not found'));
                }

                // if(!this.payment.shippo_order_id) {
                //     this.showShippoWarning = true;
                // }
            }
            catch(e) {
                this.$figleaf.errorToast({
                    title: this.$t('Error'),
                    text: e.message
                });
            }
        },

        // labelPurchased() {
        //     this.loadPayment();

        //     this.$figleaf.successToast({
        //         title: this.$t('Success'),
        //         text: 'Shipping label purchased'
        //     });
        // },

        // labelDeleted() {
        //     this.loadPayment();

        //     this.$figleaf.successToast({
        //         title: this.$t('Success'),
        //         text: 'Shipping label deleted'
        //     });
        // }
    }
};
</script>


<template>
    <div>
        <fig-spec-layout v-if="cart">
            <!-- Totals -->
            <fig-spec>
                <label slot="label">
                    <div class="flex justify-center">
                        <fig-icon
                            slot="left"
                            icon="credit-card"
                            width="30"
                            height="30"
                            :stroke-width="1" />
                    </div>
                    <div class="text-xs text-center">{{ $t('Totals') }}</div>
                </label>

                <fig-label-value-group density="sm">
                    <!-- sub total -->
                    <fig-label-value>
                        <template v-slot:label>{{ $t('Subtotal') }}:</template>
                        <fig-money class="font-mono" :cents="cart.grand_total" />
                    </fig-label-value>

                    <!-- shipping_total -->
                    <fig-label-value>
                        <template v-slot:label>{{ $t('Shipping') }}:</template>
                        <fig-money class="font-mono" :cents="cart.shipping_total" />
                    </fig-label-value>

                    <!-- sales tax -->
                    <fig-label-value>
                        <template v-slot:label>{{ $t('Tax') }}:</template>
                        <fig-money class="font-mono" :cents="cart.sales_tax" />
                    </fig-label-value>

                    <!-- grand total -->
                    <fig-label-value class="font-semibold text-green-700">
                        <template v-slot:label>{{ $t('Grand total') }}:</template>
                        <fig-money class="font-mono" :cents="cart.grand_total" />
                    </fig-label-value>
                </fig-label-value-group>
            </fig-spec>

            <!-- Shipping -->
            <fig-spec>
                <label slot="label">
                    <div class="flex justify-center">
                        <fig-icon
                            slot="left"
                            icon="truck"
                            width="30"
                            height="30"
                            :stroke-width="1" />
                    </div>
                    <div class="text-xs text-center">{{ $t('Shipping') }}</div>
                </label>
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
            </fig-spec>

            <!-- Packaging -->
            <fig-spec>
                <label slot="label">
                    <div class="flex justify-center">
                        <fig-icon
                            slot="left"
                            icon="package"
                            width="30"
                            height="30"
                            :stroke-width="1" />
                    </div>
                    <div class="text-xs text-center">{{ $t('Packaging') }}</div>
                </label>
                packaging info
            </fig-spec>



            <!-- Cart -->
            <fig-spec>
                <label slot="label">
                    <!-- <fig-icon-label>
                        <fig-icon
                            slot="left"
                            icon="cart"
                            width="20"
                            height="20"
                            :stroke-width="1" />{{ $t('Cart') }}
                    </fig-icon-label> -->
                    <div class="flex justify-center">
                        <fig-icon
                            slot="left"
                            icon="cart"
                            width="30"
                            height="30"
                            :stroke-width="1" />
                    </div>
                    <div class="text-xs text-center">{{ $t('Cart') }}</div>
                </label>
                Cart info
            </fig-spec>

            <!-- Billing -->
            <fig-spec>
                <label slot="label">
                    <div class="flex justify-center">
                        <fig-icon
                            slot="left"
                            icon="file-invoice"
                            width="30"
                            height="30"
                            :stroke-width="1" />
                    </div>
                    <div class="text-xs text-center">{{ $t('Billing') }}</div>
                </label>
                <fig-tag v-if="cart.billing_same_as_shipping">
                    {{ $t('Same as shipping address') }}
                </fig-tag>
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
            </fig-spec>

            <!-- General Info -->
            <fig-spec>
                <label slot="label">
                    <div class="flex justify-center">
                        <fig-icon
                            slot="left"
                            icon="folder"
                            width="30"
                            height="30"
                            :stroke-width="1" />
                    </div>
                    <div class="text-xs text-center">{{ $t('General Info') }}</div>
                </label>

                <fig-label-value-group density="sm">
                    <!-- closed at (order created)-->
                    <fig-label-value>
                        <template v-slot:label>{{ $t('Order created') }}:</template>
                        {{ cart.closed_at | format8601 }}
                    </fig-label-value>

                    <!-- cart created -->
                    <fig-label-value>
                        <template v-slot:label>{{ $t('Cart created') }}:</template>
                        {{ cart.created_at | format8601 }}
                    </fig-label-value>
                </fig-label-value-group>

            </fig-spec>

        </fig-spec-layout>
    </div>
</template>
