<script>
import isObject from 'lodash.isobject';
import qs from 'qs';
import { maxValue } from 'vuelidate/lib/validators';

import {
    FigLabelValueGroup,
    FigLabelValue,
    FigFormInputMoney,
    FigFormSelectNative,
    FigFormTextarea,
    FigIconLabel,
    FigButton,
    FigMoney,
    FigSignpost,
    FigPercentage,
    FigSpecLayout,
    FigSpec
} from '@notoursllc/figleaf';

export default {
    components: {
        FigLabelValueGroup,
        FigLabelValue,
        FigFormInputMoney,
        FigFormSelectNative,
        FigFormTextarea,
        FigIconLabel,
        FigButton,
        FigMoney,
        FigSignpost,
        FigPercentage,
        FigSpecLayout,
        FigSpec
    },

    props: {
        cart: {
            type: Object,
            required: true
        }
    },

    data() {
        return {
            payment: {},
            refunds: [],
            form: {
                subtotal: 3,
                shipping: 0,
                tax: 0,
                reason: 'requested_by_customer',
                description: null,
                taxCalculationType: 'calculate'
            }
        };
    },

    validations() {
        return {
            form: {
                subtotal: {
                    maxValue: maxValue(this.cart.sub_total)
                },
                shipping: {
                    maxValue: maxValue(this.cart.shipping_total)
                },
                tax: {
                    maxValue: maxValue(this.cart.sales_tax)
                }
            }
        };
    },

    computed: {
        refundTotal() {
            let total = this.form.subtotal;

            if(this.form.taxCalculationType === 'manual') {
                total += this.form.tax;
            }
            else {
                total += this.calculatedTaxRefund;
            }

            total += this.form.shipping;
            total = total = this.availableToBeRefunded;

            return total;
        },

        maxRefundAmount() {
            return this.cart ? this.cart.grand_total : 0;
        },

        maxSubtotalRefund() {
            return this.cart ? this.cart.sub_total : 0;
        },

        maxShippingRefund() {
            return this.cart ? this.cart.shipping_total : 0;
        },

        maxTaxRefund() {
            return this.cart ? this.cart.sales_tax : 0;
        },

        calculatedTaxRefund() {
            let total = 0;

            if(isObject(this.cart.tax_nexus_applied) && this.cart.tax_nexus_applied.tax_rate) {
                total = Math.ceil(this.form.subtotal * this.cart.tax_nexus_applied.tax_rate);
            }

            return total;
        },

        previouslyRefunded() {
            return this.refunds.reduce((a, b) => a + parseInt(b.refund_total, 10), 0);
        },

        availableToBeRefunded() {
            const val = this.cart.grand_total - this.previouslyRefunded;
            return val < 0 ? 0 : val;
        }
    },

    watch: {
        cart: {
            handler: function(newVal) {
                this.form.subtotal = newVal ? newVal.sub_total : 0;
                this.form.shipping = newVal ? newVal.shipping_total : 0;
                this.form.tax = newVal ? newVal.sales_tax : 0;

                this.fetchRefunds();
            },
            immediate: true
        }
    },

    methods: {
        async onProcessRefund() {
            try {
                const refundAmountString = `$${this.refundTotal / 100}`;

                const confirmed = await this.$showConfirm(
                    this.$t('Are you sure?'),
                    'warning',
                    {
                        title: this.$t('The following amount will be refunded to the customer: {amount}', {amount: refundAmountString})
                    }
                );

                if(!confirmed) {
                    return;
                }

                await this.$api.cart.refund({
                    cart_id: this.cart.id,
                    // amount: this.refundTotal,
                    // TODO: send subtotal_refund, shipping_refund & tax_refund
                    description: this.form.description,
                    reason: this.form.reason
                });

                this.$emit('success', refundAmountString);
            }
            catch(err) {
                this.$figleaf.errorToast({
                    title: this.$t('Error'),
                    text: err.message
                });
            }
        },

        async fetchRefunds() {
            try {
                const { data } = await this.$api.cart.refund.list({
                    cart_id: this.cart.id
                });
                console.log("REFUNDS", data)

                this.refunds = data;
            }
            catch(e) {
                this.$figleaf.errorToast({
                    title: this.$t('Error'),
                    text: e.message
                });
            }
        }
    }
};
</script>


<template>
    <div>
        <div class="px-6 py-2 bg-gray-100 text-sm">
            <fig-icon-label>
                <template v-slot:left>
                    <fig-icon
                        icon="info-circle"
                        width="20"
                        height="20"
                        :stroke-width="1.5" />
                </template>
                <div class="pl-1">{{ $t('refund_delay_info') }}</div>
            </fig-icon-label>
        </div>


        <fig-spec-layout class="mt-6">
            <fig-spec>
                <template v-slot:label>{{ $t('Cart Totals') }}</template>

                <fig-label-value-group density="md" display="table">
                    <!-- sub total -->
                    <fig-label-value>
                        <template v-slot:label>{{ $t('Subtotal') }}:</template>
                        <div class="text-right"><fig-money class="font-mono" :cents="cart.sub_total" /></div>
                    </fig-label-value>

                    <!-- shipping_total -->
                    <fig-label-value>
                        <template v-slot:label>{{ $t('Shipping') }}:</template>
                        <div class="text-right"><fig-money class="font-mono" :cents="cart.shipping_total" /></div>
                    </fig-label-value>

                    <!-- sales tax -->
                    <fig-label-value>
                        <template v-slot:label>{{ $t('Tax') }}:</template>
                        <div class="text-right"><fig-money class="font-mono" :cents="cart.sales_tax" /></div>
                    </fig-label-value>

                    <!-- total of previous refunds -->
                    <fig-label-value v-if="refundTotal">
                        <template v-slot:label>{{ $t('Total of previous refunds') }}:</template>
                        <div class="text-right">- <fig-money class="font-mono" :cents="previouslyRefunded" /></div>
                    </fig-label-value>

                    <!-- available to be refunded -->
                    <fig-label-value>
                        <template v-slot:label>{{ $t('Available to be refunded') }}:</template>
                        <div class="text-right text-green-700 font-semibold"><fig-money class="font-mono" :cents="availableToBeRefunded" /></div>
                    </fig-label-value>
                </fig-label-value-group>
            </fig-spec>


            <fig-spec>
                <template v-slot:label>{{ $t('Refund') }}</template>

                <fig-label-value-group density="md" display="table" class="w-full">
                    <!-- Subtotal -->
                    <fig-label-value>
                        <template v-slot:label><label for="refund-advanced-subtotal">{{ $t('Subtotal') }}:</label></template>
                        <fig-form-input-money
                            v-model="form.subtotal"
                            :min="0"
                            :max="maxSubtotalRefund/100"
                            id="refund-advanced-subtotal" />
                        <div class="text-right text-xs text-gray-500">{{ $t('Max refund') }}: <fig-money :cents="maxSubtotalRefund" /></div>

                        <template v-slot:error v-if="!$v.form.subtotal.maxValue">
                            <div>{{ $t('must be less than') }}: <fig-money :cents="$v.form.subtotal.$params.maxValue.max" /></div>
                        </template>
                    </fig-label-value>


                    <!-- Shipping -->
                    <fig-label-value>
                        <template v-slot:label><label for="refund-advanced-shipping">{{ $t('Shipping') }}:</label></template>
                        <fig-form-input-money
                            v-model="form.shipping"
                            :min="0"
                            :max="maxShippingRefund/100"
                            id="refund-advanced-shipping" />
                        <div class="text-right text-xs text-gray-500">{{ $t('Max refund') }}: <fig-money :cents="maxShippingRefund" /></div>

                        <template v-slot:error v-if="!$v.form.shipping.maxValue">
                            <div>{{ $t('must be less than') }}: <fig-money :cents="$v.form.shipping.$params.maxValue.max" /></div>
                        </template>
                    </fig-label-value>


                    <!-- Tax -->
                    <fig-label-value>
                        <template v-slot:label>
                            <label for="refund-advanced-tax" class="flex items-center">
                                <div class="mr-1">{{ $t('Tax') }}:</div>
                                <fig-signpost>
                                    <div class="mb-1 font-semibold">{{ $t('Sales Tax Nexus') }}:</div>

                                    <fig-label-value-group density="md" display="table" class="w-full">
                                        <!-- country -->
                                        <fig-label-value>
                                            <template v-slot:label>{{ $t('Country') }}:</template>
                                            {{ cart.tax_nexus_applied.countryCodeAlpha2 }}
                                        </fig-label-value>

                                        <!-- state -->
                                        <fig-label-value>
                                            <template v-slot:label>{{ $t('State/Province/Region') }}:</template>
                                            {{ cart.tax_nexus_applied.state }}
                                        </fig-label-value>

                                        <!-- tax rate -->
                                        <fig-label-value>
                                            <template v-slot:label>{{ $t('Tax rate') }}:</template>
                                            <fig-percentage :value="cart.tax_nexus_applied.tax_rate" />
                                        </fig-label-value>
                                    </fig-label-value-group>
                                </fig-signpost>
                            </label>
                        </template>

                        <div class="flex justify-start" :class="{'items-start': form.taxCalculationType === 'manual', 'items-center': form.taxCalculationType === 'calculate'}">
                            <fig-form-select-native
                                v-model="form.taxCalculationType"
                                :options="[
                                    { label: 'Calculate', value: 'calculate' },
                                    { label: 'Set manually', value: 'manual' }
                                ]"
                                class="mr-2" />

                            <div class="flex-grow">
                                <template v-if="form.taxCalculationType === 'manual'">
                                    <fig-form-input-money
                                        v-model="form.tax"
                                        :min="0"
                                        :max="maxTaxRefund/100"
                                        id="refund-advanced-tax" />
                                    <div class="text-right text-xs text-gray-500">{{ $t('Max refund') }}: <fig-money :cents="maxTaxRefund" /></div>

                                    <template v-if="!$v.form.tax.maxValue">
                                        <div>{{ $t('must be less than') }}: <fig-money :cents="$v.form.tax.$params.maxValue.max" /></div>
                                    </template>
                                </template>
                                <template v-else>
                                    <fig-form-input-money
                                        :value="calculatedTaxRefund"
                                        disabled />
                                </template>
                            </div>
                        </div>
                    </fig-label-value>


                    <!-- Refund -->
                    <fig-label-value>
                        <template v-slot:label>{{ $t('Refund') }}:</template>
                        <fig-money class="font-mono font-semibold text-green-700 text-xl" :cents="refundTotal" />
                    </fig-label-value>


                    <!-- Reason -->
                    <fig-label-value>
                        <template v-slot:label><label for="refund-reason">{{ $t('Reason') }}:</label></template>
                        <fig-form-select-native
                            v-model="form.reason"
                            :options="[
                                { label: this.$t('Duplicate'), value: 'duplicate' },
                                { label: this.$t('Fraudulent'), value: 'fraudulent' },
                                { label: this.$t('Requested by customer'), value: 'requested_by_customer' },
                                { label: this.$t('Other'), value: 'other' }
                            ]"
                            id="refund-reason" />
                    </fig-label-value>


                    <!-- more info -->
                    <fig-label-value>
                        <template v-slot:label>&nbsp;</template>
                        <fig-form-textarea
                            v-model="form.description"
                            :placeholder="$t('Add more details about this refund.')" />
                    </fig-label-value>
                </fig-label-value-group>
            </fig-spec>
        </fig-spec-layout>

        <div class="mt-6 flex justify-center">
            <fig-button
                slot="reference"
                variant="success"
                @click="onProcessRefund"
                :disabled="$v.$invalid">
                {{ $t('Refund') }}<template v-if="!$v.$invalid">: <fig-money :cents="refundTotal" /></template>
            </fig-button>
        </div>

    </div>
</template>
