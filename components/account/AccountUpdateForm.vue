<script>
import draggable from 'vuedraggable';
import AccountDetailsLayout from '@/components/account/AccountDetailsLayout.vue';
import {
    FigButton,
    FigOverlay,
    FigLabelValueGroup,
    FigLabelValue,
    FigFormInput,
    FigFormSelect,
    FigPopConfirm,
    FigSelectCountry,
    FigSelectStateProvince,
    FigSpecLayout,
    FigSpec,
    FigIcon
} from '@notoursllc/figleaf';


export default {
    components: {
        draggable,
        FigButton,
        FigOverlay,
        FigLabelValueGroup,
        FigLabelValue,
        FigFormInput,
        FigFormSelect,
        FigPopConfirm,
        FigSelectCountry,
        FigSelectStateProvince,
        FigSpecLayout,
        FigSpec,
        FigIcon,
        AccountDetailsLayout
    },

    props: {
        id: {
            type: String
        }
    },

    data() {
        return {
            loading: false,
            exchangeRateOptions: [],
            form: {
                application_name: null,
                application_url: null,
                application_logo: null,
                order_details_page_url: null,
                // paypal_client_id: null,
                stripe_key: null,
                shipengine_api_key: null,
                shipengine_carriers: [],
                shipping_from_company: null,
                shipping_from_streetAddress: null,
                shipping_from_city: null,
                shipping_from_state: null,
                shipping_from_postalCode: null,
                shipping_from_countryCodeAlpha2: null,
                shipping_from_phone: null,
                supported_currencies: [],
                default_currency: null
            },
        };
    },

    computed: {
        defaultExchangeRateOptions() {
            const opts = [];
            this.form.supported_currencies?.forEach((countryCode) => {
                opts.push(
                    { label: countryCode, value: countryCode }
                )
            });
            return opts;
        }
    },

    mounted() {
        this.fetchAccount();
        this.fetchRate();
    },

    methods: {
        async fetchAccount() {
            try {
                this.loading = true;

                const response = await this.$api.account.get();

                if(!response.data) {
                    throw new Error(this.$t('Item not found'));
                }

                for(let key in response.data) {
                    if(this.form.hasOwnProperty(key)) {
                        this.form[key] = response.data[key];
                    }
                }
            }
            catch(e) {
                this.$figleaf.errorToast({
                    title: this.$t('Error'),
                    text: e.message
                });
            }

            this.loading = false;
        },

        async fetchRate() {
            try {
                const response = await this.$api.exchangeRate.get();
                const rateOptions = [];

                if(response.data?.rates) {
                    for(let key in response.data.rates) {
                        rateOptions.push(
                            { label: key, value: key }
                        );
                    }
                }

                this.exchangeRateOptions = rateOptions;
            }
            catch(e) {
                this.$figleaf.errorToast({
                    title: this.$t('Error'),
                    text: e.message
                });
            }
        },

        async onSave(event) {
            try {
                this.loading = true;

                await this.$api.account.update({
                    ...this.form
                });

                this.$emit('saved');
            }
            catch(e) {
                this.$figleaf.errorToast({
                    title: this.$t('Error'),
                    text: e.message
                });
            }

            this.loading = false;
        },

        addCarrier() {
            if(!Array.isArray(this.form.shipengine_carriers)) {
                this.form.shipengine_carriers = [];
            }

            this.form.shipengine_carriers.push({
                id: null,
                service_codes: {
                    domestic: null,
                    international: null
                }
            })
        },

        onDeleteCarrier(idx) {
            this.form.shipengine_carriers.splice(idx, 1);
        },

        onRemoveSupportedCurrency(index) {
            this.form.supported_currencies.splice(index, 1);
        },

        async onLogoChange(event) {
            // event.target.files is a FileList object
            // https://developer.mozilla.org/en-US/docs/Web/API/FileList
            const files = event.target.files;

            if (!files.length) {
                return;
            }

            this.form.application_logo = files[0];
        }
    }
}
</script>


<template>
    <fig-overlay :show="loading">
        <form @submit.prevent="onSave">
            <account-details-layout>
                <template v-slot:application_name>
                    <fig-form-input v-model="form.application_name" />
                </template>

                <template v-slot:application_url>
                    <fig-form-input v-model="form.application_url" />
                </template>

                <template v-slot:application_logo>
                    <input
                        accept="image/*"
                        :multiple="false"
                        type="file"
                        :placeholder="$t('No file chosen')"
                        @input="onLogoChange" />
                </template>

                <template v-slot:order_details_page_url>
                    <fig-form-input v-model="form.order_details_page_url" />
                    <div class="text-sm text-gray-400">
                        {{ $t('order_details_page_url_token_tip') }}
                    </div>
                </template>

                <!-- <template v-slot:paypal_client_id>
                    <fig-form-input v-model="form.paypal_client_id" />
                </template>                -->

                <template v-slot:stripe_api_key>
                    <fig-form-input v-model="form.stripe_key" />
                </template>

                <template v-slot:shipengine_api_key>
                    <fig-form-input v-model="form.shipengine_api_key" />
                </template>

                <template v-slot:shipengine_carriers>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div
                            v-for="(obj, idx) in form.shipengine_carriers"
                            :key="idx"
                            class="rounded-md bg-gray-100 p-2">
                            <div>
                                <div class="mb-2">
                                    <div class="text-gray-500">{{ $t('ID') }}:</div>
                                    <fig-form-input v-model="obj.id" />
                                </div>

                                <div class="mb-2">
                                    <div class="text-gray-500">{{ $t('Service code (domestic)') }}:</div>
                                    <fig-form-input v-model="obj.service_codes.domestic" />
                                </div>

                                <div>
                                    <div class="text-gray-500">{{ $t('Service code (international)') }}:</div>
                                    <fig-form-input v-model="obj.service_codes.international" />
                                </div>
                            </div>

                            <div class="pt-4 text-right">
                                <fig-pop-confirm @confirm="onDeleteCarrier(idx)">
                                    {{ $t('Delete this item?') }}

                                    <fig-button
                                        slot="reference"
                                        variant="plain"
                                        size="sm"
                                        icon="trash">{{ $t('Remove') }}</fig-button>
                                </fig-pop-confirm>
                            </div>
                        </div>
                    </div>
                    <div class="pt-4">
                        <fig-button
                            variant="plain"
                            @click="addCarrier">{{ $t('Add carrier') }}</fig-button>
                    </div>
                </template>

                <template v-slot:shipping_from_company>
                    <fig-form-input v-model="form.shipping_from_company" />
                </template>

                <template v-slot:shipping_from_countryCodeAlpha2>
                    <fig-select-country
                        v-model="form.shipping_from_countryCodeAlpha2"
                        :clearable="false" />
                </template>

                <template v-slot:shipping_from_streetAddress>
                    <fig-form-input v-model="form.shipping_from_streetAddress" />
                </template>

                <template v-slot:shipping_from_city>
                    <fig-form-input v-model="form.shipping_from_city" />
                </template>

                <template v-slot:shipping_from_state>
                    <fig-select-state-province
                        v-model="form.shipping_from_state"
                        :country="form.shipping_from_countryCodeAlpha2"
                        :clearable="false" />
                </template>

                <template v-slot:shipping_from_postalCode>
                    <fig-form-input v-model="form.shipping_from_postalCode" />
                </template>

                <template v-slot:shipping_from_phone>
                    <fig-form-input v-model="form.shipping_from_phone" />
                </template>

                <template v-slot:default_currency v-if="defaultExchangeRateOptions.length">
                    <fig-form-select
                        v-model="form.default_currency"
                        :options="defaultExchangeRateOptions"
                        :clearable="true"
                        size="md"
                        :reduce="obj => obj.value" />
                </template>

                <template v-slot:supported_currencies>
                    <div class="grid grid-cols-2">
                        <draggable
                            v-model="form.supported_currencies"
                            handle=".supported_currencies_handle"
                            ghost-class="ghost"
                            tag="table">
                            <tr v-for="(obj, index) in form.supported_currencies" :key="index">
                                <td class="supported_currencies_handle cursor-grab">
                                    <fig-icon icon="dots-vertical-double" />
                                </td>
                                <td class="px-4">
                                    {{ obj }}
                                </td>
                                <td class="pb-1">
                                    <fig-button
                                        variant="plain"
                                        icon="trash"
                                        size="sm" />
                                </td>
                            </tr>
                        </draggable>

                        <!-- TODO: need way to add a new currency -->
                        <!-- <div>
                            add new
                        </div> -->
                    </div>
                </template>

                <template v-slot:button>
                    <fig-button
                        variant="primary"
                        @click="onSave">{{ $t('Save') }}</fig-button>
                </template>
            </account-details-layout>
        </form>
    </fig-overlay>
</template>
