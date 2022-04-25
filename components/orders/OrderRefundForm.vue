<script>
import { maxValue } from 'vuelidate/lib/validators';

import {
    FigLabelValueGroup,
    FigLabelValue,
    FigFormInputMoney,
    FigFormSelectNative,
    FigFormTextarea,
    FigFormInputToggle,
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
        FigFormInputToggle,
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
            refundSummary: {},
            form: {
                subtotal_refund: 0,
                shipping_refund: 0,
                tax_refund: 0,
                reason: 'requested_by_customer',
                description: null,
                taxCalculationType: 'calculate',
                shippingCalculationType: 'calculate',
                canIncludeShippingRefund: false,
                canIncludeTaxRefund: true
            }
        };
    },

    validations() {
        return {
            form: {
                subtotal_refund: {
                    maxValue: maxValue(this.cart.sub_total)
                },
                shipping_refund: {
                    maxValue: maxValue(this.cart.shipping_total)
                },
                tax_refund: {
                    maxValue: maxValue(this.cart.sales_tax)
                }
            }
        };
    },

    computed: {
        finalShippingRefund() {
            if(this.form.canIncludeShippingRefund) {
                if(this.form.shippingCalculationType === 'manual') {
                    return parseInt(this.form.shipping_refund, 10);
                }
                else {
                    return this.calculatedShippingRefund;
                }
            }

            return 0;
        },

        calculatedShippingRefund() {
            const subtotalRefundPercentage = parseInt(this.form.subtotal_refund, 10) / parseInt(this.cart.sub_total, 10);
            return parseInt(this.cart.shipping_total, 10) * subtotalRefundPercentage;
        },

        finalTaxRefund() {
            if(this.form.canIncludeTaxRefund) {
                if(this.form.taxCalculationType === 'manual') {
                    return parseInt(this.form.tax_refund, 10);
                }
                else {
                    return this.taxRefundByNexus;
                }
            }

            return 0;
        },

        // taxRefundByNexus() {
        //     let total = 0;

        //     if(isObject(this.cart.tax_nexus_applied) && this.cart.tax_nexus_applied.tax_rate) {
        //         const formRefund = (parseInt(this.form.subtotal_refund, 10) || 0)
        //             + (parseInt(this.form.shipping_refund, 10) || 0)
        //             + (parseInt(this.form.tax_refund, 10) || 0);

        //         total = Math.ceil(formRefund * this.cart.tax_nexus_applied.tax_rate);
        //     }

        //     return total;
        // },
        taxRefundByNexus() {
            let total = 0;

            if(this.cart.tax_rate) {
                const formRefund = (parseInt(this.form.subtotal_refund, 10) || 0)
                    + (parseInt(this.form.shipping_refund, 10) || 0)
                    + (parseInt(this.form.tax_refund, 10) || 0);

                total = Math.ceil(formRefund * this.cart.tax_rate);
            }

            return total;
        },

        computedRefund() {
            return parseInt(this.form.subtotal_refund, 10) + this.finalShippingRefund + this.finalTaxRefund;
        },

        computedRefundIsValid() {
            return this.computedRefund > 0 && (this.computedRefund <= this.availableToBeRefunded);
        },

        totalOfPreviousRefunds() {
            return this.refundSummary.total ? parseInt(this.refundSummary.total, 10) : 0;
        },

        availableToBeRefunded() {
            const val = this.cart.grand_total - this.totalOfPreviousRefunds;
            return val < 0 ? 0 : val;
        }
    },

    watch: {
        cart: {
            handler: function() {
                this.fetchRefundSummary();
            },
            immediate: true
        }
    },

    methods: {
        async onProcessRefund() {
            try {
                const refundAmountString = `$${this.computedRefund / 100}`;

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

                await this.$api.cart.refund.add({
                    cart_id: this.cart.id,
                    subtotal_refund: this.form.subtotal_refund,
                    shipping_refund: this.finalShippingRefund,
                    tax_refund: this.finalTaxRefund,
                    description: this.form.description,
                    reason: this.form.reason
                });

                this.$emit('success', refundAmountString);
            }
            catch(err) {
                this.$figleaf.errorToast({
                    title: this.$t('Error'),
                    text: this.$api.getErrorMessage(err)
                });
            }
        },

        async fetchRefundSummary() {
            try {
                const { data } = await this.$api.cart.refund.summary({
                    cart_id: this.cart.id
                });

                this.refundSummary = data;
            }
            catch(err) {
                this.$figleaf.errorToast({
                    title: this.$t('Error'),
                    text: this.$api.getErrorMessage(err)
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
                    <fig-label-value v-if="totalOfPreviousRefunds">
                        <template v-slot:label>{{ $t('Total of previous refunds') }}:</template>
                        <div class="text-right">- <fig-money class="font-mono" :cents="totalOfPreviousRefunds" /></div>
                    </fig-label-value>

                    <!-- available to be refunded -->
                    <fig-label-value>
                        <template v-slot:label>{{ $t('Available to be refunded') }}:</template>
                        <div class="text-right text-emerald-700 font-semibold"><fig-money class="font-mono" :cents="availableToBeRefunded" /></div>
                    </fig-label-value>
                </fig-label-value-group>
            </fig-spec>


            <fig-spec>
                <template v-slot:label>{{ $t('Refund') }}</template>

                <fig-label-value-group density="md" display="table" class="w-full">
                    <!-- Subtotal refund -->
                    <fig-label-value>
                        <template v-slot:label><label for="refund-advanced-subtotal">{{ $t('Subtotal') }}:</label></template>
                        <fig-form-input-money
                            v-model="form.subtotal_refund"
                            :min="0"
                            :max="availableToBeRefunded/100"
                            id="refund-advanced-subtotal" />
                    </fig-label-value>


                    <!-- Shipping refund -->
                    <fig-label-value>
                        <template v-slot:label>
                            <label for="refund-advanced-shipping" class="pr-1">{{ $t('Shipping') }}:</label>
                        </template>

                        <div class="flex justify-start items-center">
                            <fig-form-input-toggle
                                v-model="form.canIncludeShippingRefund"
                                size="sm"
                                variant="success"
                                class="w-10" />

                            <template v-if="form.canIncludeShippingRefund">
                                <!-- calculate or manual -->
                                <fig-form-select-native
                                    v-model="form.shippingCalculationType"
                                    :options="[
                                        { label: 'Calculate', value: 'calculate' },
                                        { label: 'Set manually', value: 'manual' }
                                    ]"
                                    class="mr-2" />

                                <div class="grow">
                                    <template v-if="form.shippingCalculationType === 'manual'">
                                        <fig-form-input-money
                                            v-model="form.shipping_refund"
                                            :min="0"
                                            id="refund-advanced-shipping" />
                                    </template>
                                    <template v-else>
                                        <fig-form-input-money
                                            :value="calculatedShippingRefund"
                                            disabled />
                                    </template>
                                </div>
                            </template>
                        </div>
                    </fig-label-value>


                    <!-- Tax -->
                    <fig-label-value>
                        <template v-slot:label>
                            <label for="refund-advanced-tax" class="flex items-center">
                                <div class="mr-1">{{ $t('Tax') }}:</div>
                                <!-- <fig-signpost>
                                    <div class="mb-1 font-semibold">{{ $t('Sales Tax Nexus') }}:</div>

                                    <fig-label-value-group density="md" display="table" class="w-full">
                                        <fig-label-value>
                                            <template v-slot:label>{{ $t('Country') }}:</template>
                                            {{ cart.tax_nexus_applied.countryCodeAlpha2 }}
                                        </fig-label-value>

                                        <fig-label-value>
                                            <template v-slot:label>{{ $t('State/Province/Region') }}:</template>
                                            {{ cart.tax_nexus_applied.state }}
                                        </fig-label-value>

                                        <fig-label-value>
                                            <template v-slot:label>{{ $t('Tax rate') }}:</template>
                                            <fig-percentage :value="cart.tax_nexus_applied.tax_rate" />
                                        </fig-label-value>
                                    </fig-label-value-group>
                                </fig-signpost> -->
                            </label>
                        </template>

                        <div class="flex justify-start items-center">
                            <fig-form-input-toggle
                                v-model="form.canIncludeTaxRefund"
                                size="sm"
                                variant="success"
                                class="w-10" />


                            <template v-if="form.canIncludeTaxRefund">
                                <fig-form-select-native
                                    v-model="form.taxCalculationType"
                                    :options="[
                                        { label: 'Calculate', value: 'calculate' },
                                        { label: 'Set manually', value: 'manual' }
                                    ]"
                                    class="mr-2" />

                                <div class="grow">
                                    <template v-if="form.taxCalculationType === 'manual'">
                                        <fig-form-input-money
                                            v-model="form.tax_refund"
                                            :min="0"
                                            id="refund-advanced-tax" />
                                    </template>
                                    <template v-else>
                                        <fig-form-input-money
                                            :value="taxRefundByNexus"
                                            disabled />
                                    </template>
                                </div>
                            </template>
                        </div>
                    </fig-label-value>


                    <!-- Refund -->
                    <fig-label-value>
                        <template v-slot:label>{{ $t('Refund') }}:</template>
                        <div class="flex items-center">
                            <fig-money
                                class="font-mono font-semibold text-xl mr-1"
                                :class="{'text-emerald-700': computedRefundIsValid, 'text-red-700': !computedRefundIsValid}"
                                :cents="computedRefund" />

                            <fig-signpost
                                v-if="!computedRefundIsValid"
                                icon="alert-circle"
                                icon-stroke-color="#b91c1c">
                                {{ $t('Refund must be less than or equal to:') }} <fig-money class="font-mono" :cents="availableToBeRefunded" />
                            </fig-signpost>
                        </div>
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
                :disabled="!computedRefundIsValid"
                slot="reference"
                variant="success"
                @click="onProcessRefund">
                {{ $t('Refund') }}<template v-if="computedRefundIsValid">: <fig-money :cents="computedRefund" /></template>
            </fig-button>
        </div>

    </div>
</template>
