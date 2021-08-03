<script>
import {
    FigAddress,
    FigButton,
    FigSpecLayout,
    FigSpec,
    FigTag,
    FigIconLabel,
    FigIcon,
    FigLabelValueGroup,
    FigLabelValue,
    FigMoney,
    FigDivider,
    FigModal,
    FigJsonTreeView,
    FigBooleanTag,
    FigTextCard
} from '@notoursllc/figleaf';
import BooleanTag from '~/components/BooleanTag.vue';

export default {
    components: {
        FigAddress,
        FigButton,
        FigSpecLayout,
        FigSpec,
        FigTag,
        FigIconLabel,
        FigIcon,
        FigLabelValueGroup,
        FigLabelValue,
        FigMoney,
        FigDivider,
        FigModal,
        FigJsonTreeView,
        FigBooleanTag,
        FigTextCard,
        BooleanTag
        // ShippingLabelButton: () => import('@/components/payment/ShippingLabelButton'),
    },

    data() {
        return {
            cart: null,
            shippingRate: {}
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

                // if(isObject(this.cart.selected_shipping_rate)) {
                //     this.shippingRate = await this.$api.cart.getShippingRate(
                //         this.cart.selected_shipping_rate.rate_id
                //     );
                // }
            }
            catch(e) {
                this.$figleaf.errorToast({
                    title: this.$t('Error'),
                    text: e.message
                });
            }
        },

        showShippigRateModal() {
            this.$refs.shipping_rate_modal.show();
        }

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

                <div class="flex flex-wrap overflow-hidden sm:-mx-2">
                    <!-- shipping address -->
                    <div class="w-full sm:my-2 sm:px-2 md:w-1/2">
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
                    </div>

                    <!-- User selected rate -->
                    <div class="w-full sm:my-2 sm:px-2 md:w-1/2">
                        <div class="font-semibold">{{ $t('User selected rate') }}</div>
                        <fig-divider :margin="1" />
                        <div>

                            <fig-label-value-group density="sm">
                                <fig-label-value>
                                    <template v-slot:label>{{ $t('Quoted shipping rate') }}:</template>
                                    <fig-money :cents="cart.shipping_total" />
                                </fig-label-value>

                                <fig-label-value>
                                    <template v-slot:label>{{ $t('Carrier') }}:</template>
                                    {{ cart.selected_shipping_rate.carrier_friendly_name }}
                                </fig-label-value>

                                <fig-label-value>
                                    <template v-slot:label>{{ $t('Service type') }}:</template>
                                    {{ cart.selected_shipping_rate.service_type }}
                                </fig-label-value>

                                <fig-label-value>
                                    <template v-slot:label>{{ $t('Estimated delivery') }}:</template>
                                    {{ cart.selected_shipping_rate.estimated_delivery_date | format8601 }}
                                </fig-label-value>

                                <fig-label-value>
                                    <template v-slot:label>{{ $t('Trackable') }}:</template>
                                    <fig-boolean-tag
                                        :bool="cart.selected_shipping_rate.trackable"
                                        size="sm" />
                                </fig-label-value>

                                <fig-label-value>
                                    <template v-slot:label>{{ $t('Address validation status') }}:</template>
                                    {{ cart.selected_shipping_rate.validation_status }}
                                </fig-label-value>

                                <fig-label-value>
                                    <template v-slot:label>{{ $t('Error messages') }}:</template>
                                    <ul v-if="cart.selected_shipping_rate.error_messages.length" class="list-disc">
                                        <li
                                            v-for="(message, index) in cart.selected_shipping_rate.error_messages"
                                            :key="index"
                                            class="text-red-700">
                                            {{ message }}
                                        </li>
                                    </ul>
                                    <div v-else class="text-gray-400">({{ $t('none') }})</div>
                                </fig-label-value>

                                <fig-label-value>
                                    <template v-slot:label>{{ $t('Warning messages') }}:</template>
                                    <ul v-if="cart.selected_shipping_rate.warning_messages.length" class="list-disc">
                                        <li
                                            v-for="(message, index) in cart.selected_shipping_rate.warning_messages"
                                            :key="index"
                                            class="text-yellow-600">
                                            {{ message }}
                                        </li>
                                    </ul>
                                    <div v-else class="text-gray-400">({{ $t('none') }})</div>
                                </fig-label-value>
                            </fig-label-value-group>

                            <div class="pt-2">
                                <fig-button
                                    variant="plain"
                                    size="sm"
                                    @click="showShippigRateModal">{{ $t('view raw data') }}</fig-button>
                            </div>

                            <!-- raw data modal -->
                            <fig-modal
                                ref="shipping_rate_modal"
                                size="lg"
                                close-button>
                                <fig-json-tree-view
                                    :data="cart.selected_shipping_rate"
                                    :level="2"></fig-json-tree-view>
                            </fig-modal>

                        </div>
                    </div>
                </div>
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

                <template v-if="cart.shipping_rate_quote">
                    <fig-text-card
                        v-for="(p, index) in cart.shipping_rate_quote.packingResults.packed"
                        :key="index"
                        class="mb-4">
                        <template slot="header-left">Box ({{ $t('{num1} of {num2}', { num1: ++index, num2: cart.shipping_rate_quote.packingResults.packed.length }) }})</template>

                        <div class="flex flex-row align-top">
                            <!-- box info -->
                            <div class="pr-10">
                                <div class="flex justify-center">
                                    <fig-icon
                                        slot="left"
                                        icon="package"
                                        width="50"
                                        height="50"
                                        :stroke-width="1" />
                                </div>
                                <div class="text-xs text-center">
                                    <div>{{ p.box.label }}</div>
                                    <div>{{ p.box.description }}</div>
                                </div>
                            </div>

                            <!-- products packed in box -->
                            <div class="flex-grow">
                                <ul v-if="p.products.length" class="list-decimal">
                                    <li
                                        v-for="(prod, index) in p.products"
                                        :key="index">
                                        prod {{ index }}


                                    </li>
                                </ul>
                            </div>
                        </div>
                    </fig-text-card>
                </template>
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
