<script>
import AccountUpdateForm from '@/components/account/AccountUpdateForm.vue';
import AccountDetailsLayout from '@/components/account/AccountDetailsLayout.vue';
import {
    FigModal,
    FigIcon,
    FigOverlay,
    FigLabelValueGroup,
    FigLabelValue,
    FigButton
} from '@notoursllc/figleaf';


export default {
    components: {
        FigModal,
        FigIcon,
        FigOverlay,
        FigLabelValueGroup,
        FigLabelValue,
        FigButton,
        AccountUpdateForm,
        AccountDetailsLayout
    },

    data() {
        return {
            account: {},
            form: {
                accountId: null
            },
            loading: false
        };
    },

    created() {
        this.$store.dispatch('ui/title', this.$t('Account'));
        this.fetchData();
    },

    methods: {
        async fetchData() {
            try {
                const resposne = await this.$api.account.get();
                this.account = resposne?.data || {};
            }
            catch(e) {
                this.$figleaf.errorToast({
                    title: this.$t('Error'),
                    text: e.message
                });
            }
        },

        onUpdate() {
            this.showModal();
        },

        showModal(show) {
            show === false ? this.$refs.account_upsert_modal.hide() : this.$refs.account_upsert_modal.show();
        },

        onFormSaved() {
            this.fetchData();
            this.showModal(false);
        },

        init() {
            this.fetchData();
        }
    }
};
</script>


<template>
    <div>
        <fig-overlay :show="loading">
            <account-details-layout>
                <template v-slot:application_name>{{ account.application_name }}</template>
                <template v-slot:application_url>{{ account.application_url }}</template>
                <template v-slot:paypal_client_id>{{ account.paypal_client_id }}</template>
                <template v-slot:shipengine_api_key>{{ account.shipengine_api_key }}</template>
                <template v-slot:shipengine_carriers>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div
                            v-for="(obj, idx) in account.shipengine_carriers"
                            :key="idx"
                            class="rounded-md bg-gray-100 p-2">
                            <div>
                                <div class="mb-2">
                                    <div class="text-gray-500">{{ $t('ID') }}:</div>
                                    {{ obj.id }}
                                </div>

                                <div class="mb-2">
                                    <div class="text-gray-500">{{ $t('Service code (domestic)') }}:</div>
                                    {{ obj.service_codes.domestic }}
                                </div>

                                <div>
                                    <div class="text-gray-500">{{ $t('Service code (international)') }}:</div>
                                    {{ obj.service_codes.international }}
                                </div>
                            </div>
                        </div>
                    </div>
                </template>
                <template v-slot:shipping_from_company>{{ account.shipping_from_company }}</template>
                <template v-slot:shipping_from_streetAddress>{{ account.shipping_from_streetAddress }}</template>
                <template v-slot:shipping_from_city>{{ account.shipping_from_city }}</template>
                <template v-slot:shipping_from_state>{{ account.shipping_from_state }}</template>
                <template v-slot:shipping_from_postalCode>{{ account.shipping_from_postalCode }}</template>
                <template v-slot:shipping_from_countryCodeAlpha2>{{ account.shipping_from_countryCodeAlpha2 }}</template>
                <template v-slot:shipping_from_phone>{{ account.shipping_from_phone }}</template>
                <template v-slot:button>
                    <fig-button
                        variant="primary"
                        @click="onUpdate">{{ $t('Edit') }}</fig-button>
                </template>
            </account-details-layout>
        </fig-overlay>


        <!-- add/upsert modal -->
        <fig-modal
            ref="account_upsert_modal"
            size="xl">

            <template v-slot:header>
                {{ $t('Edit account') }}
            </template>

            <account-update-form
                @saved="onFormSaved" />
        </fig-modal>
    </div>
</template>
