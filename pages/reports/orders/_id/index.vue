<script>
import JsonTree from 'vue-json-tree';
import isObject from 'lodash.isobject';
import PackedProductDisplay from '@/components/orders/PackedProductDisplay.vue';
import OrderRefundForm from '@/components/orders/OrderRefundForm.vue';
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
    FigBooleanTag,
    FigTextCard,
    FigMessage,
    FigPopConfirm
} from '@notoursllc/figleaf';


export default {
    components: {
        PackedProductDisplay,
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
        FigBooleanTag,
        FigTextCard,
        FigMessage,
        FigPopConfirm,
        JsonTree,
        OrderRefundForm
        // ShippingLabelButton: () => import('@/components/payment/ShippingLabelButton'),
    },

    data() {
        return {
            cart: null,
            label: null,
            shippingRate: {}
        };
    },

    computed: {
        // numPackedProducts() {
        //     return isObject(this.cart.shipping_rate_quote.packingResults) && this.cart.shipping_rate_quote.packingResults.packed
        //         ? this.cart.shipping_rate_quote.packingResults.packed.length
        //         : 0;
        // },

        // numUnPackedProducts() {
        //     return isObject(this.cart.shipping_rate_quote.packingResults) && this.cart.shipping_rate_quote.packingResults.unpacked
        //         ? this.cart.shipping_rate_quote.packingResults.unpacked.length
        //         : 0;
        // }
    },

    created() {
        this.getOrder();
    },

    methods: {
        // async viewPackingSlip() {
        //     const response = await this.$api.cart.get(this.payment.id);
        //     window.open(response.slip_url);
        // },

        async getOrder() {
            try {
                const { cart, label } = await this.$api.cart.order(this.$route.params.id);
                this.cart = cart;
                this.label = label;

                if(!this.cart) {
                    throw new Error(this.$t('Cart not found'));
                }

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
        },

        showShippigLabelModal() {
            this.$refs.shipping_label_modal.show();
        },

        showCartDataModal() {
            this.$refs.cart_modal.show();
        },

        showRefundModal() {
            this.$refs.refund_modal.show();
        },

        getProductImage(prod) {
            return Array.isArray(prod.product_variant.images) ? prod.product_variant.images[0].url : null;
        },

        async onConfirmPurchaseShippingLabel() {
            try {
                this.label = await this.$api.cart.purchaseShippingLabel(this.cart.id);

                this.$figleaf.successToast({
                    title: this.$t('Success'),
                    text: this.$t('Shipping label purchased successfully')
                });

                // if(!this.cart) {
                //     throw new Error(this.$t('Cart not found'));
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

        async setShippedAt(isShipped) {
            const Cart = await this.$api.cart.shipped(this.cart.id, isShipped);
            this.cart.shipped_at = Cart.shipped_at;
        },

        async sendOrderConfirmationEmail() {
            try {
                const result = await this.$api.cart.resendOrderConfirmationEmail(this.cart.id);

                if(result.Message === 'OK') {
                    this.$figleaf.successToast({
                        title: this.$t('Success'),
                        text: this.$t('Order confirmation email sent successfully')
                    });
                }
                else {
                    throw new Error(
                        `${this.$t('The email response did not return a success code.')} ErrorCode: ${result.ErrorCode}. Message: ${result.Message}`
                    );
                }
            }
            catch(e) {
                this.$figleaf.errorToast({
                    title: this.$t('Error'),
                    text: e.message
                });
            }
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
                <template v-slot:label>
                    <div class="flex justify-center">
                        <fig-icon
                            icon="credit-card"
                            width="30"
                            height="30"
                            :stroke-width="1" />
                    </div>
                    <div class="text-xs text-center">{{ $t('Totals') }}</div>
                </template>

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
                <template v-slot:label>
                    <div class="flex justify-center">
                        <fig-icon
                            icon="truck"
                            width="30"
                            height="30"
                            :stroke-width="1" />
                    </div>
                    <div class="text-xs text-center">{{ $t('Shipping') }}</div>
                </template>


                <!-- Shipped at -->
                <div>
                    <fig-label-value-group density="sm">
                        <fig-label-value>
                            <template v-slot:label>{{ $t('Shipped at') }}:</template>

                            <template v-if="cart.shipped_at">
                                <fig-icon-label>
                                    {{ cart.shipped_at | format8601 }}

                                    <template v-slot:right>
                                        <fig-pop-confirm @confirm="setShippedAt(false)">
                                            <template v-slot:reference>
                                                <fig-button
                                                    variant="plain"
                                                    size="sm"
                                                    class="ml-2">{{ $t('Clear') }}</fig-button>
                                            </template>
                                            <div>{{ $t('Are you sure you want to clear this value?') }}</div>
                                        </fig-pop-confirm>
                                    </template>
                                </fig-icon-label>
                            </template>

                            <template v-else>
                                <div class="flex items-center">
                                    <fig-tag variant="warning">{{ $t('not shipped') }}</fig-tag>

                                    <fig-button
                                        variant="primary"
                                        size="sm"
                                        class="ml-3"
                                        @click="setShippedAt(true)">{{ $t('Mark as shipped') }}</fig-button>
                                </div>
                            </template>
                        </fig-label-value>
                    </fig-label-value-group>
                </div>


                <!-- shipping address -->
                <div class="mt-4">
                    <div class="font-semibold">{{ $t('Shipping address') }}</div>
                    <fig-divider :margin="1" />

                    <div class="flex flex-wrap overflow-hidden sm:-mx-2 px-4">
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
                        <div class="w-full sm:my-2 sm:px-2 md:w-1/2">
                            <fig-label-value-group density="sm">
                                <!-- Email address -->
                                <fig-label-value>
                                    <template v-slot:label>{{ $t('Email address') }}:</template>
                                    {{ cart.shipping_email }}
                                </fig-label-value>

                                <!-- Email address -->
                                <fig-label-value>
                                    <template v-slot:label>{{ $t('Phone') }}:</template>
                                    {{ cart.shipping_phone }}
                                </fig-label-value>
                            </fig-label-value-group>
                        </div>
                    </div>
                </div>

                <!-- shipping label -->
                <div class="mt-4">
                    <div class="font-semibold">
                        {{ $t('Shipping label') }}

                        <div class="inline-block pl-4">
                            <fig-button
                                v-if="label"
                                variant="plain"
                                size="sm"
                                @click="showShippigLabelModal">{{ $t('view raw data') }}</fig-button>
                        </div>

                        <!-- raw data modal -->
                        <fig-modal
                            ref="shipping_label_modal"
                            size="lg"
                            close-button>
                            <json-tree
                                :data="label"
                                :level="2"></json-tree>
                        </fig-modal>
                    </div>

                    <fig-divider :margin="1" />

                    <div class='px-4'>
                        <!-- show buy shipping label button if no label -->
                        <template v-if="!label">
                            <fig-message variant="warning">{{ $t('A shipping label has not been purhased yet') }}</fig-message>

                            <div class="pt-2">
                                <fig-pop-confirm @confirm="onConfirmPurchaseShippingLabel">
                                    <template v-slot:reference>
                                        <fig-button
                                            variant="primary"
                                            size="sm">{{ $t('Buy a shipping label') }}</fig-button>
                                    </template>
                                    <div>{{ $t('Are you sure you want to purchase a shipping label?') }}</div>
                                </fig-pop-confirm>
                            </div>
                        </template>

                        <!-- show label details -->
                        <template v-else>
                            <div class="flex flex-wrap overflow-hidden sm:-mx-2 px-4">
                                <div class="w-full sm:my-2 sm:px-2 md:w-1/2">
                                    <fig-label-value-group density="sm">
                                        <!-- label PDF -->
                                        <fig-label-value>
                                            <template v-slot:label>{{ $t('Label') }}:</template>
                                            <fig-icon-label>
                                                <template v-slot:right>
                                                    <fig-icon
                                                        icon="new-window"
                                                        width="18"
                                                        height="18" />
                                                </template>
                                                <a :href="label.label_download.pdf"
                                                    target="_blank"
                                                    class="pr-1">{{ $t('View') }}</a>
                                            </fig-icon-label>
                                        </fig-label-value>

                                        <!-- tracking # -->
                                        <fig-label-value>
                                            <template v-slot:label>{{ $t('Tracking #') }}:</template>
                                            {{ label.tracking_number }}
                                        </fig-label-value>

                                        <!-- is return label -->
                                        <fig-label-value>
                                            <template v-slot:label>{{ $t('Is return label') }}:</template>
                                            <fig-boolean-tag
                                                :bool="label.is_return_label"
                                                size="sm" />
                                        </fig-label-value>

                                        <!-- is international -->
                                        <fig-label-value>
                                            <template v-slot:label>{{ $t('Is international') }}:</template>
                                            <fig-boolean-tag
                                                :bool="label.is_international"
                                                size="sm" />
                                        </fig-label-value>

                                        <!-- voided -->
                                        <fig-label-value>
                                            <template v-slot:label>{{ $t('Voided') }}:</template>
                                            <fig-boolean-tag
                                                :bool="label.voided"
                                                size="sm" />
                                        </fig-label-value>
                                    </fig-label-value-group>
                                </div>

                                <div class="w-full sm:my-2 sm:px-2 md:w-1/2">
                                    <fig-label-value-group density="sm">
                                        <!-- Created -->
                                        <fig-label-value>
                                            <template v-slot:label>{{ $t('Created') }}:</template>
                                            {{ label.created_at | format8601 }}
                                        </fig-label-value>

                                        <!-- Shipment ID -->
                                        <fig-label-value>
                                            <template v-slot:label>{{ $t('ShipEngine label ID') }}:</template>
                                            {{ label.label_id }}
                                        </fig-label-value>

                                        <!-- Shipment ID -->
                                        <fig-label-value>
                                            <template v-slot:label>{{ $t('ShipEngine shipment ID') }}:</template>
                                            {{ label.shipment_id }}
                                        </fig-label-value>
                                    </fig-label-value-group>
                                </div>
                            </div>
                        </template>
                    </div>
                </div>

                <!-- User selected rate -->
                <div class="mt-4">
                    <div class="font-semibold">
                        {{ $t('User selected rate') }}

                        <div class="inline-block pl-4">
                            <fig-button
                                variant="plain"
                                size="sm"
                                @click="showShippigRateModal">{{ $t('view raw data') }}</fig-button>

                            <!-- raw data modal -->
                            <fig-modal
                                ref="shipping_rate_modal"
                                size="lg"
                                close-button>
                                <json-tree
                                    :data="cart.selected_shipping_rate"
                                    :level="2"></json-tree>
                            </fig-modal>
                        </div>
                    </div>
                    <fig-divider :margin="1" />

                    <div class="flex flex-wrap overflow-hidden sm:-mx-2 px-4">
                        <div class="w-full sm:my-2 sm:px-2 md:w-1/2">
                            <fig-label-value-group density="sm">
                                <fig-label-value>
                                    <template v-slot:label>{{ $t('Quoted shipping rate') }}:</template>
                                    <fig-money :cents="cart.shipping_total" />
                                </fig-label-value>

                                <!--
                                    There is a scenario where cart.selected_shipping_rate is null.
                                    It happens when there was no suitable package (box) for the products
                                    in the cart, thus a shipping rate could not be calculated
                                -->
                                <template v-if="cart.selected_shipping_rate">
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
                                </template>
                            </fig-label-value-group>
                        </div>

                        <div class="w-full sm:my-2 sm:px-2 md:w-1/2">
                            <fig-label-value-group density="sm">
                                <template v-if="cart.selected_shipping_rate">
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
                                </template>
                            </fig-label-value-group>
                        </div>
                    </div>
                </div>
            </fig-spec>


            <!-- Packaging -->
            <fig-spec>
                <template v-slot:label>
                    <div class="flex justify-center">
                        <fig-icon
                            icon="package"
                            width="30"
                            height="30"
                            :stroke-width="1" />
                    </div>
                    <div class="text-xs text-center">{{ $t('Packaging') }}</div>
                </template>

                <template v-if="cart.shipping_rate_quote">
                    <!-- create refund button -->
                    <div class="mb-4 flex w-full justify-end">
                        <fig-button
                            variant="danger"
                            size="sm"
                            @click="showRefundModal">{{ $t('Create refund') }}</fig-button>

                        <fig-modal
                            ref="refund_modal"
                            size="full"
                            close-button>
                            <template v-slot:header>{{ $t('Select products to refund') }}</template>
                            <order-refund-form :cart="cart" />
                        </fig-modal>
                    </div>

                    <!-- UNPACKED products -->
                    <fig-text-card class="mb-2 sm:mb-4" v-if="cart.shipping_rate_quote.packingResults.unpacked.length">
                        <template v-slot:header-left>
                            <fig-icon-label>
                                <template v-slot:left>
                                    <fig-icon
                                        icon="alert-circle"
                                        width="24"
                                        height="24"
                                        :stroke-width="1.5"
                                        stroke="#e01616" />
                                </template>
                                <div class="text-red-700">{{ $t('UNPACKED PRODUCTS') }}</div>
                            </fig-icon-label>
                        </template>

                        <div
                            v-for="(p, index) in cart.shipping_rate_quote.packingResults.unpacked"
                            :key="index"
                            class="mb-2">
                            <packed-product-display :product="p" />
                        </div>
                    </fig-text-card>

                    <!-- PACKED products -->
                    <fig-text-card
                        v-for="(p, index) in cart.shipping_rate_quote.packingResults.packed"
                        :key="index"
                        class="mb-2 sm:mb-4">
                        <template v-slot:header-left>
                            {{ $t('Box') }} ({{ $t('{num1} of {num2}', { num1: index + 1, num2: cart.shipping_rate_quote.packingResults.packed.length }) }}) -
                            {{ $tc('{num} items', p.products.length, {num: p.products.length}) }}
                        </template>

                        <div class="flex flex-row align-top px-2">
                            <!-- box info -->
                            <div class="pr-5">
                                <div class="flex justify-center">
                                    <fig-icon
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
                                <!-- product card -->
                                <div
                                    v-for="(prod, index) in p.products"
                                    :key="index"
                                    class="mb-2">
                                    <packed-product-display :product="prod" />
                                </div>
                            </div>
                        </div>
                    </fig-text-card>
                </template>
            </fig-spec>


            <!-- Cart -->
            <fig-spec>
                <template v-slot:label>
                    <div class="flex justify-center">
                        <fig-icon
                            icon="cart"
                            width="30"
                            height="30"
                            :stroke-width="1" />
                    </div>
                    <div class="text-xs text-center">{{ $t('Cart') }}</div>
                </template>

                <div>
                    <fig-button
                        variant="plain"
                        size="sm"
                        @click="showCartDataModal">{{ $t('view raw data') }}</fig-button>
                </div>

                <!-- raw data modal -->
                <fig-modal
                    ref="cart_modal"
                    size="lg"
                    close-button>
                    <json-tree
                        :data="cart"
                        :level="2"></json-tree>
                </fig-modal>
            </fig-spec>

            <!-- Billing -->
            <fig-spec>
                <template v-slot:label>
                    <div class="flex justify-center">
                        <fig-icon
                            icon="file-invoice"
                            width="30"
                            height="30"
                            :stroke-width="1" />
                    </div>
                    <div class="text-xs text-center">{{ $t('Billing') }}</div>
                </template>

                <div v-if="cart.billing_same_as_shipping" class="text-gray-500">
                    ({{ $t('Same as shipping address') }})
                </div>
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
                <template v-slot:label>
                    <div class="flex justify-center">
                        <fig-icon
                            icon="folder"
                            width="30"
                            height="30"
                            :stroke-width="1" />
                    </div>
                    <div class="text-xs text-center">{{ $t('General Info') }}</div>
                </template>

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

            <!-- Additional actions -->
            <fig-spec>
                <template v-slot:label>
                    <div class="flex justify-center">
                        <fig-icon
                            icon="click"
                            width="30"
                            height="30"
                            :stroke-width="1" />
                    </div>
                    <div class="text-xs text-center">{{ $t('Additional actions') }}</div>
                </template>

                <div>
                    <fig-pop-confirm @confirm="sendOrderConfirmationEmail()">
                        <template v-slot:reference>
                            <fig-button
                                variant="plain"
                                icon="send">{{ $t('Re-send order acknowledgement email to customer') }}</fig-button>
                        </template>
                        <div>{{ $t('Are you sure you want to send another order confirmation email to the customer?') }}</div>
                    </fig-pop-confirm>
                </div>
            </fig-spec>

        </fig-spec-layout>
    </div>
</template>


<style>
.product_attr_group > label {
    @apply block text-sm font-semibold;
}
</style>
