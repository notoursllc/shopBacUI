<script>
import {
    FigLabelValueGroup,
    FigLabelValue,
    FigFormInputMoney,
    FigFormSelectNative,
    FigFormTextarea,
    FigIconLabel,
    FigButton,
    FigPopConfirm,
    FigMoney
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
        FigPopConfirm,
        FigMoney
    },

    props: {
        cart: {
            type: Object,
            required: true
        }
    },

    data() {
        return {
            form: {
                refund: 0,
                reason: 'requested_by_customer',
                description: null
            }
        };
    },

    computed: {
        maxRefundAmount() {
            return this.cart ? this.cart.grand_total : 0;
        }
    },

    watch: {
        cart: {
            handler: function(newVal) {
                this.form.refund = newVal ? newVal.grand_total : 0;
            },
            immediate: true
        }
    },

    methods: {
        async onConfirmRefund() {
            console.log("onConfirmRefund");

            try {
                // await this.$api.cart.items.refundCartItems(
                //     cartItems,
                //     this.refundForm.refundSalesTax
                // );
            }
            catch(e) {
                this.$figleaf.errorToast({
                    title: this.$t('Error'),
                    text: e.message
                });
            }
        }
    },


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

        <div class="mt-6">
            <fig-label-value-group density="md" class="w-full">
                <!-- Cart totals -->
                <fig-label-value>
                    <template v-slot:label><label>{{ $t('Totals') }}:</label></template>
                    <fig-label-value-group density="sm">
                        <!-- sub total -->
                        <fig-label-value>
                            <template v-slot:label>{{ $t('Subtotal') }}:</template>
                            <fig-money class="font-mono" :cents="cart.sub_total" />
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
                </fig-label-value>

                <!-- Refund -->
                <fig-label-value>
                    <template v-slot:label><label for="refund-amount">{{ $t('Refund') }}:</label></template>
                    <fig-form-input-money
                        v-model="form.refund"
                        min="0"
                        :max="maxRefundAmount"
                        id="refund-amount" />
                    <!-- <template v-slot:error v-if="$v.nexus.countryCodeAlpha2.$invalid">
                        <div>{{ $t('Required') }}</div>
                    </template> -->
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
        </div>

        <div class="mt-6 flex justify-center">
            <fig-pop-confirm
                @confirm="onConfirmRefund">
                {{ $t('Process refund?') }} (<fig-money :cents="form.refund" />)
                <fig-button
                    slot="reference"
                    variant="danger">{{ $t('Process refund') }}: <fig-money :cents="form.refund" /></fig-button>
            </fig-pop-confirm>
        </div>

</div>
</template>
