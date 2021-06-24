<script>
import Vue from 'vue';
import { required } from 'vuelidate/lib/validators';
import product_mixin from '@/mixins/product_mixin';
import shipping_mixin from '@/mixins/shipping_mixin';

import MasterTypeSelect from '@/components/MasterTypeSelect';
import TextCard from '@/components/TextCard';
import MetaDataBuilder from '@/components/MetaDataBuilder';
import SeoPreview from '@/components/product/SeoPreview';
import VariantTable from '@/components/product/variant/VariantTable';
import AppMessage from '@/components/AppMessage';

import {
    FigFormCheckbox,
    FigFormGroup,
    FigFormInput,
    FigFormTextarea,
    FigSelectCountry,
    FigButton,
    FigFormInputEndcapper,
    FigOverlay,
    FigCol,
    FigRow
} from '@notoursllc/figleaf';


const urlValidator = (value) => {
    const val = value || '';

    // https://stackoverflow.com/a/1547940
    return val.match(/^[A-Za-z0-9\-._~:?#\[\]@!$&'()*+,;=]+$/g) !== null;
};


export default Vue.extend({
    components: {
        MasterTypeSelect,
        TextCard,
        MetaDataBuilder,
        SeoPreview,
        VariantTable,
        AppMessage,
        FigFormCheckbox,
        FigFormGroup,
        FigFormInput,
        FigFormTextarea,
        FigSelectCountry,
        FigButton,
        FigFormInputEndcapper,
        FigOverlay,
        FigCol,
        FigRow
    },

    mixins: [
        product_mixin,
        shipping_mixin
    ],

    data() {
        return {
            loading: false,
            product: {
                variants: []
            },
            productHasMetaData: false,
            domainName: this.$config.DOMAIN_NAME
        };
    },

    computed: {
        seoUrlValidationErrorMessage() {
            if(!this.$v.product.seo_uri.required) {
                return this.$t('Required');
            }
            if(!this.$v.product.seo_uri.urlValidator) {
                return this.$t(
                    'Valid characters: _chars_',
                    { chars: this.$t('any alphanumeric character, plus _chars_', {chars: '?#[]@!$&\'()*+,;:=-._~'}) }
                );
            }
            return '';
        }
    },

    validations: {
        product: {
            seo_uri: {
                required,
                urlValidator
            }
        }
    },

    mounted() {
        try {
            if(this.$route.params.id) {
                this.fetchProduct();
            }
            else {
                // setting some defaults:
                this.product.published = true;
                this.$store.dispatch('ui/title', this.$t('Add product'));
            }
        }
        catch(e) {
            this.$errorToast({
                title: this.$t('Error'),
                text: e.message
            });
        }
    },

    methods: {
        async fetchProduct() {
            const id = this.$route.params.id;
            this.loading = true;

            try {
                const product = await this.$api.products.get(id, { viewAllRelated: true });

                if(!product) {
                    throw new Error(this.$t('Product not found'));
                }

                this.productHasMetaData = !!product.metadata;
                this.product = product;
                this.$store.dispatch('ui/title', this.$t('Product: {name}', { name: product.title }));
            }
            catch(e) {
                this.$errorToast({
                    title: this.$t('Error'),
                    text: e.message
                });
            }

            this.loading = false;
        },

        async onSaveClick() {
            try {
                this.loading = true;

                const p = await this.$api.products.upsert(this.product);

                if(!p) {
                    throw new Error('Error updating product');
                }

                this.$successToast({
                    title: p.id ? this.$t('Product updated successfully') : this.$t('Product added successfully'),
                    text: p.title
                });

                this.goToProductList();
            }
            catch(e) {
                this.$errorToast({
                    title: this.$t('Error'),
                    text: e.message
                });
            }

            this.loading = false;
        },


        // TODO: product model still needs accent_message attributes added to it
        onAccentWizardChange(obj) {
            // console.log("ON ACCENT WIZARD CHAGGE", obj)
            this.product.accent_message_id = obj.accent_message_id;
            this.product.accent_message_begin = obj.accent_message_begin;
            this.product.accent_message_end = obj.accent_message_end;
        },


        goToStore(seoUri) {
            const routeData = this.$router.resolve({
                name: 'p-seouri',
                params: { seouri: seoUri }
            });

            // this opens the page in a new tab
            window.open(routeData.href, '_blank');
        }
    }
});
</script>


<template>
    <fig-overlay :show="loading">

        <div class="flex justify-end mb-3" v-if="product.id">
            <fig-button
                variant="plain"
                @click="goToStore(product.seo_uri)"
                icon="new-window">{{ $t('View product in store') }}</fig-button>
        </div>

        <!-- published-->
        <div class="mb-5">
            <fig-form-checkbox
                v-model="product.published">{{ $t('This product is available for purchase') }}</fig-form-checkbox>
        </div>


        <!-- Organization -->
        <text-card class="mb-5">
            <div slot="header">{{ $t('Organization') }}</div>

            <div class="container mx-auto">
                <fig-row sm="1/2" md="1/3" lg="1/4" xl="1/5" default="full" default-gap="1" sm-gap="2" key="org">
                    <!-- type -->
                    <fig-col>
                        <fig-form-group class="mb-2">
                            <label slot="label" for="product_type">{{ $t('Product type') }}</label>
                            <master-type-select
                                v-model="product.type"
                                object="product_type"
                                id="product_type" />
                        </fig-form-group>
                    </fig-col>

                    <!-- sub-type -->
                    <fig-col>
                        <fig-form-group class="mb-2">
                            <label slot="label" for="product_sub_type">{{ $t('Product sub-type') }}</label>
                            <master-type-select
                                v-model="product.sub_type"
                                object="product_sub_type"
                                id="product_sub_type" />
                        </fig-form-group>
                    </fig-col>

                    <!-- sales channel -->
                    <fig-col>
                        <fig-form-group class="mb-2">
                            <label slot="label" for="product_sales_channel_type">{{ $t('Sales channel') }}</label>
                            <master-type-select
                                v-model="product.sales_channel_type"
                                object="product_sales_channel_type"
                                id="product_sales_channel_type" />
                        </fig-form-group>
                    </fig-col>

                    <!-- vendor -->
                    <fig-col>
                        <fig-form-group class="mb-2">
                            <label slot="label" for="product_vendor_type">{{ $t('Vendor') }}</label>
                            <master-type-select
                                v-model="product.vendor_type"
                                object="product_vendor_type"
                                :multiple="false"
                                id="product_vendor_type" />
                        </fig-form-group>
                    </fig-col>
                </fig-row>
            </div>
        </text-card>


        <!-- Style -->
        <text-card class="mb-5">
            <div slot="header">{{ $t('Style') }}</div>

            <div class="container mx-auto">
                <fig-row sm="1/2" md="1/3" lg="1/4" xl="1/5" default="full" default-gap="1" sm-gap="2" key="org">
                    <!-- gender -->
                    <fig-col>
                        <fig-form-group class="mb-2">
                            <label slot="label" for="product_gender_type">{{ $t('Gender') }}</label>
                            <master-type-select
                                v-model="product.gender_type"
                                object="product_gender_type"
                                id="product_gender_type" />
                        </fig-form-group>
                    </fig-col>

                    <!-- fit -->
                    <fig-col>
                        <fig-form-group class="mb-2">
                            <label slot="label" for="product_fit_type">{{ $t('Fit') }}</label>
                            <master-type-select
                                v-model="product.fit_type"
                                object="product_fit_type"
                                id="product_fit_type" />
                        </fig-form-group>
                    </fig-col>

                    <!-- sleeve -->
                    <fig-col>
                        <fig-form-group class="mb-2">
                            <label slot="label" for="product_sleeve_length_type">{{ $t('Sleeve') }}</label>
                            <master-type-select
                                v-model="product.sleeve_length_type"
                                object="product_sleeve_length_type"
                                id="product_sleeve_length_type" />
                        </fig-form-group>
                    </fig-col>

                    <!-- feature -->
                    <fig-col>
                        <fig-form-group class="mb-2">
                            <label slot="label" for="product_feature_type">{{ $t('Feature') }}</label>
                            <master-type-select
                                v-model="product.feature_type"
                                object="product_feature_type"
                                id="product_feature_type" />
                        </fig-form-group>
                    </fig-col>
                </fig-row>
            </div>
        </text-card>


        <!-- Details -->
        <text-card class="mb-5">
            <div slot="header">{{ $t('Details') }}</div>

            <div class="container mx-auto">
                <fig-row sm="1/3" md="1/3" default="full" default-gap="1" sm-gap="2" key="details">
                    <fig-col>
                        <!-- page title -->
                        <fig-form-group class="mb-2">
                            <label slot="label" for="product_title">{{ $t('Title') }}</label>
                            <fig-form-input
                                v-model="product.title"
                                maxlength="70"
                                id="product_title" />
                        </fig-form-group>
                    </fig-col>

                    <fig-col>
                        <!-- caption -->
                        <fig-form-group class="mb-2">
                            <label slot="label" for="product_caption">{{ $t('Caption') }}</label>
                            <fig-form-input
                                v-model="product.caption"
                                maxlength="70"
                                id="product_caption" />
                        </fig-form-group>
                    </fig-col>

                    <fig-col>
                        <!-- description -->
                        <fig-form-group class="mb-2">
                            <label slot="label" for="product_description">{{ $t('Description') }}</label>
                            <fig-form-textarea
                                v-model="product.description"
                                :rows="2"
                                maxlength="320"
                                id="product_description" />
                        </fig-form-group>
                    </fig-col>
                </fig-row>
            </div>
        </text-card>


        <!-- Colors -->
        <text-card class="mb-5">
            <div slot="header">{{ $t('Colors') }}</div>

            <div class="container mx-auto">
                <variant-table
                    :value="product.variants"
                    @change="colors => this.$set(product, 'variants', colors)" />
            </div>
        </text-card>


        <!-- shipping -->
        <text-card class="mb-5">
            <div slot="header">{{ $t('Shipping') }}</div>

            <div class="container mx-auto">
                <!-- requires shipping -->
                <div class="mb-3">
                    <fig-form-checkbox
                        v-model="product.requires_shipping">{{ $t('This is a physical product') }}</fig-form-checkbox>
                </div>

                <template v-if="!product.requires_shipping">
                    {{ $t('requires_shipping_off_desc') }}
                </template>
                <template v-else>
                    <hr />

                    <h4>{{ $t('CUSTOMS INFORMATION') }}</h4>

                    <div class="flex flex-wrap -mx-2">
                        <!-- country of origin -->
                        <div class="my-2 px-2 w-full xl:w-1/2">
                            <fig-form-group>
                                <label slot="label" for="product_customs_country_of_origin">{{ $t('Country of origin') }}</label>
                                <fig-select-country
                                    v-model="product.customs_country_of_origin"
                                    id="product_customs_country_of_origin" />

                                <div slot="description">
                                    {{ $t('customs_country_of_origin_desc') }}
                                </div>
                            </fig-form-group>
                        </div>

                        <!-- HS code -->
                        <div class="my-2 px-2 w-full xl:w-1/2">
                            <fig-form-group>
                                <label slot="label" for="product_customs_harmonized_system_code">{{ $t('HS (Harmonized System) code') }}</label>
                                <fig-form-input
                                    v-model="product.customs_harmonized_system_code"
                                    id="product_customs_harmonized_system_code" />

                                <div slot="description">
                                    {{ $t('customs_hs_code_desc') }}
                                </div>
                            </fig-form-group>
                        </div>
                    </div>
                </template>
            </div>
        </text-card>


        <!-- SEO -->
        <text-card class="mb-5">
            <div slot="header">{{ $t('Search engine listing') }}</div>

            <div class="container mx-auto">
                <fig-row md="1/2" default="full" default-gap="1" sm-gap="2" key="seo">
                    <!-- page title -->
                    <fig-col>
                        <fig-form-group class="mb-2 block">
                            <label slot="label" for="product_seo_page_title">{{ $t('Page title') }}</label>
                            <fig-form-input
                                v-model="product.seo_page_title"
                                maxlength="70"
                                id="product_seo_page_title" />
                        </fig-form-group>
                    </fig-col>

                    <!-- description -->
                    <fig-col>
                        <fig-form-group class="mb-2 block">
                            <label slot="label" for="product_seo_page_desc">{{ $t('Description') }}</label>
                            <fig-form-textarea
                                v-model="product.seo_page_desc"
                                :rows="2"
                                maxlength="320"
                                id="product_seo_page_desc" />
                        </fig-form-group>
                    </fig-col>

                    <!-- URI -->
                    <fig-col>
                        <fig-form-group class="mb-2 block">
                            <label slot="label" for="product_seo_uri">{{ $t('URL and handle') }}</label>

                            <fig-form-input-endcapper>
                                <template slot="prefix">{{ `https://${domainName}/p/` }}</template>
                                <fig-form-input
                                    v-model="product.seo_uri"
                                    maxlength="50"
                                    :state="!$v.product.seo_uri.$invalid ? null : false"
                                    square-left
                                    id="product_seo_uri" />
                            </fig-form-input-endcapper>

                            <div
                                v-if="$v.product.seo_uri.$invalid"
                                slot="error">{{ seoUrlValidationErrorMessage }}</div>
                        </fig-form-group>
                    </fig-col>
                </fig-row>


                <div class="py-5" v-show="product.seo_page_title">
                    <div class="text-xs text-gray-700 mb-1">{{ $t('Preview') }}:</div>
                    <seo-preview
                        :title="product.seo_page_title"
                        :description="product.seo_page_desc"
                        :uri="product.seo_uri" />
                </div>
            </div>
        </text-card>


        <!-- Metadata -->
        <text-card class="mb-5">
            <div slot="header">{{ $t('Metadata') }}</div>

            <div class="container mx-auto">
                <div class="pb-3">
                    <fig-form-checkbox
                        v-model="productHasMetaData">{{ $t('Metadata_description') }}</fig-form-checkbox>
                </div>

                <meta-data-builder
                    v-if="productHasMetaData"
                    v-model="product.metadata" />
            </div>
        </text-card>


        <div class="pt-4 text-center">
            <fig-button
                variant="primary"
                size="lg"
                @click="onSaveClick"
                :disabled="$v.product.$invalid">{{ $t('Save') }}</fig-button>

            <div class="pt-2 text-danger" v-show="$v.product.$invalid">
                <div class="inline-block">
                    <app-message>
                        <fig-icon slot="icon" icon="alert-circle" variant="danger" />
                        {{ $t('Please fix the errors above before saving') }}
                    </app-message>
                </div>
            </div>
        </div>
    </fig-overlay>
</template>
