<script>
import JsonTree from 'vue-json-tree';
import isObject from 'lodash.isobject';
import PackedProductDisplay from '@/components/orders/PackedProductDisplay.vue';
import OrderRefundForm from '@/components/orders/OrderRefundForm.vue';
import OrderRefundList from '@/components/orders/OrderRefundList.vue';
import {
    FigAddress,
    FigButton,
    FigTag,
    FigIconLabel,
    FigIcon,
    FigLabelValueGroup,
    FigLabelValue,
    FigMoney,
    FigModal,
    FigBooleanTag,
    FigTextCard,
    FigPopConfirm,
    FigCardLastFour,
    FigRowBuilder,
    FigFormTextarea,
    FigOverlay
} from '@notoursllc/figleaf';


export default {
    components: {
        PackedProductDisplay,
        FigAddress,
        FigButton,
        FigTag,
        FigIconLabel,
        FigIcon,
        FigLabelValueGroup,
        FigLabelValue,
        FigMoney,
        FigModal,
        FigBooleanTag,
        FigTextCard,
        FigPopConfirm,
        FigCardLastFour,
        FigRowBuilder,
        FigFormTextarea,
        FigOverlay,
        JsonTree,
        OrderRefundForm,
        OrderRefundList
    },

    data() {
        return {
            cart: null,
            label: null,
            payment: null,
            shippingRate: {},
            cartNotes: [],
            cartNotesLoading: false
        };
    },

    computed: {
        isPaypalPayment() {
            return isObject(this.payment) && this.payment.payer;
        }

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

    mounted() {
        this.getOrder();
        this.$store.dispatch('ui/title', this.$t('Order Details'));
    },

    methods: {
        async getOrder() {
            try {
                const { data } = await this.$api.cart.order.get(this.$route.params.id);
                this.cart = data.cart;
                this.label = data.label;
                this.payment = data.payment;
                this.cartNotes = data.cart.admin_order_notes ? [ ...data.cart.admin_order_notes ] : []

                if(!this.cart) {
                    throw new Error(this.$t('Cart not found'));
                }

                // if(isObject(this.cart.selected_shipping_rate)) {
                //     const { data } = await this.$api.cart.getShippingRate(
                //         this.cart.selected_shipping_rate.rate_id
                //     );
                //     this.shippingRate = data;
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

        showCartDataModal() {
            this.$refs.cart_modal.show();
        },

        showRefundModal() {
            this.$refs.refund_modal.show();
        },

        hideRefundModal() {
            this.$refs.refund_modal.hide();
        },

        showShippingLabelDetailsModal() {
            this.$refs.shipping_label_details_modal.show();
        },

        getProductImage(prod) {
            return Array.isArray(prod.product_variant.images) ? prod.product_variant.images[0].url : null;
        },

        async onConfirmPurchaseShippingLabel() {
            try {
                const { data } = await this.$api.cart.shipping.purchaseLabel(this.cart.id);
                this.label = data;

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
            const { data } = await this.$api.cart.shipping.isShipped(this.cart.id, isShipped);
            this.cart.shipped_at = data.shipped_at;
        },

        async sendOrderConfirmationEmail() {
            try {
                const { data } = await this.$api.cart.order.resendConfirmationEmail(this.cart.id);

                if(data.Message === 'OK') {
                    this.$figleaf.successToast({
                        title: this.$t('Success'),
                        text: this.$t('Order confirmation email sent successfully')
                    });
                }
                else {
                    throw new Error(
                        `${this.$t('The email response did not return a success code.')} ErrorCode: ${data.ErrorCode}. Message: ${data.Message}`
                    );
                }
            }
            catch(e) {
                this.$figleaf.errorToast({
                    title: this.$t('Error'),
                    text: e.message
                });
            }
        },

        onRefundSuccess(refundAmount) {
            this.hideRefundModal();

            this.$figleaf.successToast({
                title: this.$t('Refund successful'),
                text: refundAmount
            });

            this.$refs.orderRefundList.fetchData();
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

        onAddNote() {
            this.cartNotes.push({
                created_at: new Date().toISOString(),
                note: null
            })
        },

        onRemoveNote(index) {
            this.cartNotes.splice(index, 1);
        },

        async onSaveNotes() {
            try {
                this.cartNotesLoading = true;
                await this.$api.cart.order.notes.update(this.cart.id, this.cartNotes);

                this.$figleaf.successToast({
                    title: this.$t('Success'),
                    text: this.$t('Notes updated successfully')
                });
            }
            catch(e) {
                this.$figleaf.errorToast({
                    title: this.$t('Error'),
                    text: e.message
                });
            }
            finally {
                this.cartNotesLoading = false;
            }
        }
    }
};
</script>


<template>
    <div class="text-sm">
        <fig-text-card class="mb-6" v-if="cart" variant="white">
            <template v-slot:header-left>
                <div class="text-lg font-bold">
                    <fig-money :cents="cart.grand_total" />
                </div>
            </template>


            <fig-label-value-group density="md" display="table" class="text-sm">
                <!-- order created -->
                <fig-label-value>
                    <template v-slot:label>{{ $t('Date') }}:</template>
                    {{ cart.closed_at | format8601 }}
                </fig-label-value>

                <!-- sub total -->
                <fig-label-value>
                    <template v-slot:label>{{ $t('Subtotal') }}:</template>
                    <div class="text-right font-mono"><fig-money :cents="cart.sub_total" /></div>
                </fig-label-value>

                <!-- shipping_total -->
                <fig-label-value>
                    <template v-slot:label>{{ $t('Shipping') }}:</template>
                    <div class="text-right font-mono"><fig-money :cents="cart.shipping_total" /></div>
                </fig-label-value>

                <!-- sales tax -->
                <fig-label-value>
                    <template v-slot:label>{{ $t('Tax') }}:</template>
                    <div class="text-right font-mono"><fig-money :cents="cart.sales_tax" /></div>
                </fig-label-value>

                <!-- grand total -->
                <fig-label-value>
                    <template v-slot:label>{{ $t('Grand total') }}:</template>
                    <div class="text-right font-mono"><fig-money :cents="cart.grand_total" /></div>
                </fig-label-value>

                <!-- payment method -->
                <fig-label-value>
                    <template v-slot:label>{{ $t('Payment method') }}:</template>
                    <fig-card-last-four
                        :type="isPaypalPayment ? 'paypal' : payment.payment_method_details.card.brand"
                        :last-four="isPaypalPayment ? '' : payment.payment_method_details.card.last4"
                        :email="isPaypalPayment ? payment.payer.email_address : ''" />
                </fig-label-value>

                <fig-label-value>
                    <template v-slot:label>
                        {{ isPaypalPayment ? $t('Paypal details') : $t('Stripe details') }}:
                    </template>
                    <a
                        :href="isPaypalPayment ? 'https://www.paypal.com/activities/' : `https://dashboard.stripe.com/payments/${cart.stripe_payment_intent_id}`"
                        target="_blank">{{ $t('View') }}</a>
                </fig-label-value>
            </fig-label-value-group>
        </fig-text-card>


        <!-- Shipping address -->
        <fig-text-card class="mb-6" v-if="cart" variant="white">
            <template v-slot:header-left>
                <div class="flex items-center justify-center">
                    <fig-icon
                        icon="truck"
                        width="26"
                        height="26"
                        :stroke-width="1" />
                    <div class="text-lg font-bold pl-2">{{ $t('Shipping') }}</div>
                </div>
            </template>

            <fig-label-value-group density="md" display="row" class="text-sm">
                <!-- shipped at -->
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
                                            class="ml-2"
                                            icon="x"></fig-button>
                                    </template>
                                    <div>{{ $t('Are you sure you want to clear this value?') }}</div>
                                </fig-pop-confirm>
                            </template>
                        </fig-icon-label>
                    </template>

                    <template v-else>
                        <div>
                            <div>
                                <fig-tag variant="warning" size="sm">{{ $t('not shipped') }}</fig-tag>
                            </div>

                            <div class="mt-4">
                                <fig-button
                                    variant="primary"
                                    size="sm"
                                    @click="setShippedAt(true)">{{ $t('Mark as shipped') }}</fig-button>
                            </div>
                        </div>
                    </template>
                </fig-label-value>

                <!-- shipping label -->
                <fig-label-value>
                    <template v-slot:label>{{ $t('Shipping label') }}:</template>

                    <template v-if="!label">
                        <fig-tag variant="warning" size="sm">{{ $t('None') }}</fig-tag>

                        <div class="pt-4">
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
                        <!-- label PDF -->
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

                        <fig-button
                            variant="plain"
                            size="sm"
                            @click="showShippingLabelDetailsModal">{{ $t('label details') }}</fig-button>

                        <!-- shipping label details modal -->
                        <fig-modal
                            ref="shipping_label_details_modal"
                            size="lg"
                            close-button>
                            <json-tree
                                :data="label"
                                :level="1" />
                            <div class="flex flex-wrap overflow-hidden sm:-mx-2 px-4">
                                <div class="w-full sm:my-2 sm:px-2 md:w-1/2">
                                    <fig-label-value-group density="md" display="table">
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
                                    <fig-label-value-group density="md" display="table">
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
                        </fig-modal>
                    </template>
                </fig-label-value>

                <!-- shipping address -->
                <fig-label-value>
                    <template v-slot:label>{{ $t('Shipping address') }}:</template>
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
                </fig-label-value>

                <!-- email -->
                <fig-label-value>
                    <template v-slot:label>{{ $t('Email') }}:</template>
                    {{ cart.shipping_email }}
                </fig-label-value>

                <!-- phone -->
                <fig-label-value>
                    <template v-slot:label>{{ $t('Phone') }}:</template>
                    {{ cart.shipping_phone }}
                </fig-label-value>

                <!-- packing slip -->
                <fig-label-value>
                    <template v-slot:label>{{ $t('Packing slip') }}:</template>
                    <fig-button
                        variant="primary"
                        size="sm">
                        <nuxt-link :to="{ name: 'reports-orders-packing_slip-id', params: { id: cart.id }}">{{ $t('View') }}</nuxt-link>
                    </fig-button>
                </fig-label-value>
            </fig-label-value-group>


            <!-- Shipping rate -->
            <div class="mt-4 pl-4">
                <div class="flex items-center">
                    <div class="text-black">{{ $t('SHIPPING RATE') }}</div>

                    <fig-button
                        variant="plain"
                        size="sm"
                        class="ml-4"
                        @click="showShippigRateModal">{{ $t('view raw data') }}</fig-button>
                </div>

                <!-- raw data modal -->
                <fig-modal
                    ref="shipping_rate_modal"
                    size="lg"
                    close-button>
                    <json-tree
                        :data="cart.selected_shipping_rate"
                        :level="1" />
                </fig-modal>
            </div>

            <div class="flex flex-wrap overflow-hidden sm:-mx-2 px-4">
                <div class="w-full sm:my-2 sm:px-2 md:w-1/2">
                    <fig-label-value-group density="md" display="table">
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
                    <fig-label-value-group density="md" display="table">
                        <template v-if="cart.selected_shipping_rate">
                            <fig-label-value>
                                <template v-slot:label>{{ $t('Order is a gift') }}:</template>
                                <fig-boolean-tag
                                    :bool="cart.is_gift"
                                    size="sm" />
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
                                        class="text-amber-600">
                                        {{ message }}
                                    </li>
                                </ul>
                                <div v-else class="text-gray-400">({{ $t('none') }})</div>
                            </fig-label-value>
                        </template>
                    </fig-label-value-group>
                </div>
            </div>

            <div class="mt-2">

            </div>
        </fig-text-card>


        <!-- Packaging -->
        <fig-text-card class="mb-6" v-if="cart" variant="white">
            <template v-slot:header-left>
                <div class="flex items-center justify-center">
                    <fig-icon
                        icon="package"
                        width="26"
                        height="26"
                        :stroke-width="1" />
                    <div class="text-lg font-bold pl-2">{{ $t('Packaging') }}</div>
                </div>
            </template>

            <template v-if="cart.shipping_rate_quote">
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
                    border
                    shadow
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
                        <div class="grow">
                            <!-- product card -->
                            <div
                                v-for="(prod, idx) in p.products"
                                :key="idx"
                                class="mb-2">
                                <packed-product-display :product="prod" />
                            </div>
                        </div>
                    </div>
                </fig-text-card>
            </template>
        </fig-text-card>


        <!-- Refunds -->
        <fig-text-card class="mb-6" v-if="cart" variant="white">
            <template v-slot:header-left>
                <div class="flex justify-center items-center">
                    <fig-icon
                        icon="receipt-refund"
                        width="26"
                        height="26"
                        :stroke-width="1" />
                    <div class="text-lg font-bold pl-2">{{ $t('Refunds') }}</div>
                </div>
            </template>
            <template v-slot:header-right>
                <fig-button
                    variant="plain"
                    size="sm"
                    @click="showRefundModal">{{ $t('Create refund') }}</fig-button>

                <fig-modal
                    ref="refund_modal"
                    size="lg"
                    close-button>
                    <template v-slot:header>{{ $t('Refund payment') }}</template>
                    <order-refund-form
                        :cart="cart"
                        @success="onRefundSuccess" />
                </fig-modal>
            </template>

            <order-refund-list
                ref="orderRefundList"
                :cart-id="cart.id"
                :stripe="!!cart.stripe_payment_intent_id"
                :paypal="!!cart.paypal_order_id" />
        </fig-text-card>


        <!-- Billing -->
        <fig-text-card class="mb-6" v-if="cart" variant="white">
            <template v-slot:header-left>
                <div class="flex justify-center items-center">
                    <fig-icon
                        icon="file-invoice"
                        width="26"
                        height="26"
                        :stroke-width="1" />
                    <div class="text-lg font-bold pl-2">{{ $t('Billing') }}</div>
                </div>
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
        </fig-text-card>


        <!-- Cart -->
        <fig-text-card class="mb-6" v-if="cart" variant="white">
            <template v-slot:header-left>
                <div class="flex justify-center items-center">
                    <fig-icon
                        icon="cart"
                        width="26"
                        height="26"
                        :stroke-width="1" />
                    <div class="text-lg font-bold pl-2">{{ $t('Cart') }}</div>
                </div>
            </template>

            <div>
                <fig-button
                    variant="plain"
                    size="sm"
                    @click="showCartDataModal">{{ $t('view raw data') }}</fig-button>

                <!-- raw data modal -->
                <fig-modal
                    ref="cart_modal"
                    size="lg"
                    close-button>
                    <json-tree
                        :data="cart"
                        :level="1" />
                </fig-modal>
            </div>
        </fig-text-card>


        <!-- Additional actions -->
        <fig-text-card class="mb-6" v-if="cart" variant="white">
            <template v-slot:header-left>
                <div class="flex justify-center items-center">
                    <fig-icon
                        icon="click"
                        width="26"
                        height="26"
                        :stroke-width="1" />
                    <div class="text-lg font-bold pl-2">{{ $t('Additional actions') }}</div>
                </div>
            </template>

            <fig-pop-confirm @confirm="sendOrderConfirmationEmail()">
                <template v-slot:reference>
                    <fig-button
                        variant="plain"
                        size="sm"
                        icon="send">{{ $t('Re-send order acknowledgement email to customer') }}</fig-button>
                </template>
                <div>{{ $t('Are you sure you want to send another order confirmation email to the customer?') }}</div>
            </fig-pop-confirm>
        </fig-text-card>


        <!-- Notes -->
        <fig-text-card class="mb-6" v-if="cart" variant="white">
            <template v-slot:header-left>
                <div class="flex justify-center items-center">
                    <fig-icon
                        icon="notes"
                        width="26"
                        height="26"
                        :stroke-width="1" />
                    <div class="text-lg font-bold pl-2">{{ $t('Notes') }}</div>
                </div>
            </template>

            <div class="w-full">
                <fig-overlay :show="cartNotesLoading">
                    <fig-row-builder
                        v-model="cartNotes"
                        @add="onAddNote"
                        @remove="onRemoveNote"
                        :sortable="false"
                        class="w-full">
                        <template v-slot:buttonLabel>{{ $t('Add note') }}</template>

                        <template v-slot:default="slotScope">
                            <div class="flex gap-2 w-full">
                                <div class="whitespace-nowrap">
                                    {{ slotScope.rowBuilder.created_at | format8601 }}
                                </div>
                                <fig-form-textarea
                                    v-model="slotScope.rowBuilder.note"
                                    class="flex-grow"
                                    rows="1" />
                            </div>
                        </template>

                        <template v-slot:addButtonRight>
                            <fig-button
                                v-if="cartNotes.length"
                                @click="onSaveNotes"
                                variant="primary"
                                size="sm"
                                icon="floppy">{{ $t('Save notes') }}</fig-button>
                        </template>
                    </fig-row-builder>
                </fig-overlay>
            </div>
        </fig-text-card>
    </div>
</template>


<style>
.product_attr_group > label {
    @apply block text-sm font-semibold;
}
</style>
