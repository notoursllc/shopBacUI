<script>
import {
    FigLabelValueGroup,
    FigLabelValue,
    FigSpecLayout,
    FigSpec
} from '@notoursllc/figleaf';

export default {
    components: {
        FigLabelValueGroup,
        FigLabelValue,
        FigSpecLayout,
        FigSpec
    }
};
</script>


<template>
    <fig-spec-layout v-bind="$props">
        <!-- Application -->
        <fig-spec>
            <label slot="label">{{ $t('Application')}}</label>

            <fig-label-value-group density="lg" display="table" class="w-full">
                <fig-label-value>
                    <template v-slot:label>{{ $t('Application name') }}:</template>
                    <slot name="application_name" />
                </fig-label-value>

                <fig-label-value>
                    <template v-slot:label>{{ $t('Application URL') }}:</template>
                    <slot name="application_url" />
                </fig-label-value>

                <fig-label-value>
                    <template v-slot:label>{{ $t('Application logo') }}:</template>
                    <slot name="application_logo" />
                </fig-label-value>

                <fig-label-value>
                    <template v-slot:label>{{ $t('URL to order details page') }}:</template>
                    <slot name="order_details_page_url" />
                </fig-label-value>

                <fig-label-value>
                    <template v-slot:label>{{ $t('API key') }}:</template>
                    <slot name="api_key" />
                </fig-label-value>
            </fig-label-value-group>
        </fig-spec>

        <!-- Payments -->
        <fig-spec>
            <label slot="label">{{ $t('Payments')}}</label>

            <fig-label-value-group density="lg" display="table" class="w-full">
                <!-- <fig-label-value>
                    <template v-slot:label>{{ $t('Paypal client ID') }}:</template>
                    <slot name="paypal_client_id" />
                </fig-label-value> -->

                <fig-label-value>
                    <template v-slot:label>{{ $t('Stripe API key') }}:</template>
                    <slot name="stripe_api_key" />
                </fig-label-value>


                <fig-label-value>
                    <template v-slot:label>{{ $t('Default currency') }}:</template>
                    <slot name="default_currency" />
                </fig-label-value>

                <fig-label-value>
                    <template v-slot:label>{{ $t('Supported currency') }}:</template>
                    <slot name="supported_currencies" />
                </fig-label-value>
            </fig-label-value-group>
        </fig-spec>

        <!-- Shipping -->
        <fig-spec>
            <label slot="label">{{ $t('Shipping')}}</label>

            <fig-label-value-group density="lg" display="table" class="w-full">
                <fig-label-value>
                    <template v-slot:label>{{ $t('ShipEngine API key') }}:</template>
                    <slot name="shipengine_api_key" />
                </fig-label-value>

                <fig-label-value>
                    <template v-slot:label>{{ $t('ShipEngine carriers') }}:</template>
                    <slot name="shipengine_carriers" />
                </fig-label-value>

                <fig-label-value>
                    <template v-slot:label>{{ $t('Shipping from address: company') }}:</template>
                    <slot name="shipping_from_company" />
                </fig-label-value>

                <fig-label-value>
                    <template v-slot:label>{{ $t('Shipping from address: country') }}:</template>
                    <slot name="shipping_from_countryCodeAlpha2" />
                </fig-label-value>

                <fig-label-value>
                    <template v-slot:label>{{ $t('Shipping from address: street address') }}:</template>
                    <slot name="shipping_from_streetAddress" />
                </fig-label-value>

                <fig-label-value>
                    <template v-slot:label>{{ $t('Shipping from address: city') }}:</template>
                    <slot name="shipping_from_city" />
                </fig-label-value>

                <fig-label-value>
                    <template v-slot:label>{{ $t('Shipping from address: state') }}:</template>
                    <slot name="shipping_from_state" />
                </fig-label-value>

                <fig-label-value>
                    <template v-slot:label>{{ $t('Shipping from address: postal code') }}:</template>
                    <slot name="shipping_from_postalCode" />
                </fig-label-value>

                <fig-label-value>
                    <template v-slot:label>{{ $t('Shipping from address: phone') }}:</template>
                    <slot name="shipping_from_phone" />
                </fig-label-value>
            </fig-label-value-group>
        </fig-spec>

        <fig-spec>
            <label slot="label">&nbsp;</label>
            <slot name="button" />
        </fig-spec>
    </fig-spec-layout>
</template>
