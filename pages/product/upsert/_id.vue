<script>
import Vue from 'vue';
import { required } from 'vuelidate/lib/validators';
import product_mixin from '@/mixins/product_mixin';
import shipping_mixin from '@/mixins/shipping_mixin';

import MasterTypeSelect from '@/components/MasterTypeSelect';
import MetaDataBuilder from '@/components/MetaDataBuilder';
import SeoPreview from '@/components/product/SeoPreview';
import VariantTable from '@/components/product/variant/VariantTable';

import {
    FigFormCheckbox,
    FigFormGroup,
    FigFormInput,
    FigFormInputNumber,
    FigFormTextarea,
    FigSelectCountry,
    FigButton,
    FigFormInputEndcapper,
    FigOverlay,
    FigTextCard,
    FigIconLabel
} from '@notoursllc/figleaf';


const urlValidator = (value) => {
    const val = value || '';

    // https://stackoverflow.com/a/1547940
    return val.match(/^[A-Za-z0-9\-._~:?#\[\]@!$&'()*+,;=]+$/g) !== null;
};


export default Vue.extend({
    components: {
        MasterTypeSelect,
        MetaDataBuilder,
        SeoPreview,
        VariantTable,
        FigFormCheckbox,
        FigFormGroup,
        FigFormInput,
        FigFormInputNumber,
        FigFormTextarea,
        FigSelectCountry,
        FigButton,
        FigFormInputEndcapper,
        FigOverlay,
        FigTextCard,
        FigIconLabel
    },

    mixins: [
        product_mixin,
        shipping_mixin
    ],

    data() {
        return {
            loading: false,
            product: {
                variants: [],
                published: true,
                shippable: true
            },
            productHasMetaData: false,
            domainName: this.$config.DOMAIN_NAME,
            css: {
                cellOneThird: 'my-3 px-3 w-full lg:w-1/2 xl:w-1/3',
                cellOneHalf: 'my-3 px-3 w-full lg:w-1/2'
            }
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
                this.$store.dispatch('ui/title', this.$t('Add product'));
            }
        }
        catch(e) {
            this.$figleaf.errorToast({
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
                this.$figleaf.errorToast({
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

                this.$figleaf.successToast({
                    title: p.id ? this.$t('Product updated successfully') : this.$t('Product added successfully'),
                    text: p.title
                });

                this.goToProductList();
            }
            catch(e) {
                this.$figleaf.errorToast({
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


        <!-- row -->
        <div class="flex flex-wrap -mx-3 overflow-hidden">

            <!-- ORGANIZATION CARD -->
            <div :class="css.cellOneThird">
                <fig-text-card>
                    <div slot="header-left">{{ $t('Organization') }}</div>

                    <!-- product type -->
                    <div>
                        <fig-form-group class="mb-2">
                            <label slot="label" for="product_type">{{ $t('Product type') }}</label>
                            <master-type-select
                                v-model="product.type"
                                object="product_type"
                                id="product_type" />
                        </fig-form-group>
                    </div>

                    <!-- sub-type -->
                    <div>
                        <fig-form-group class="mb-2">
                            <label slot="label" for="product_sub_type">{{ $t('Product sub-type') }}</label>
                            <master-type-select
                                v-model="product.sub_type"
                                object="product_sub_type"
                                id="product_sub_type" />
                        </fig-form-group>
                    </div>

                    <!-- sales channel -->
                    <div>
                        <fig-form-group class="mb-2">
                            <label slot="label" for="product_sales_channel_type">{{ $t('Sales channel') }}</label>
                            <master-type-select
                                v-model="product.sales_channel_type"
                                object="product_sales_channel_type"
                                id="product_sales_channel_type" />
                        </fig-form-group>
                    </div>

                    <!-- vendor -->
                    <div>
                        <fig-form-group class="mb-2">
                            <label slot="label" for="product_vendor_type">{{ $t('Vendor') }}</label>
                            <master-type-select
                                v-model="product.vendor_type"
                                object="product_vendor_type"
                                :multiple="false"
                                id="product_vendor_type" />
                        </fig-form-group>
                    </div>
                </fig-text-card>
            </div>

            <!-- STYLE CARD-->
            <div :class="css.cellOneThird">
                <fig-text-card>
                    <div slot="header-left">{{ $t('Style') }}</div>

                    <!-- gender -->
                    <div>
                        <fig-form-group class="mb-2">
                            <label slot="label" for="product_gender_type">{{ $t('Gender') }}</label>
                            <master-type-select
                                v-model="product.gender_type"
                                object="product_gender_type"
                                id="product_gender_type" />
                        </fig-form-group>
                    </div>

                    <!-- fit -->
                    <div>
                        <fig-form-group class="mb-2">
                            <label slot="label" for="product_fit_type">{{ $t('Fit') }}</label>
                            <master-type-select
                                v-model="product.fit_type"
                                object="product_fit_type"
                                id="product_fit_type" />
                        </fig-form-group>
                    </div>

                    <!-- sleeve -->
                    <div>
                        <fig-form-group class="mb-2">
                            <label slot="label" for="product_sleeve_length_type">{{ $t('Sleeve') }}</label>
                            <master-type-select
                                v-model="product.sleeve_length_type"
                                object="product_sleeve_length_type"
                                id="product_sleeve_length_type" />
                        </fig-form-group>
                    </div>

                    <!-- feature -->
                    <div>
                        <fig-form-group class="mb-2">
                            <label slot="label" for="product_feature_type">{{ $t('Feature') }}</label>
                            <master-type-select
                                v-model="product.feature_type"
                                object="product_feature_type"
                                id="product_feature_type" />
                        </fig-form-group>
                    </div>
                </fig-text-card>
            </div>

            <!-- DETAILS CARD -->
            <div :class="css.cellOneThird">
                <!-- Details -->
                <fig-text-card>
                    <div slot="header-left">{{ $t('Details') }}</div>

                    <!-- page title -->
                    <div>
                        <fig-form-group class="mb-2">
                            <label slot="label" for="product_title">{{ $t('Title') }}</label>
                            <fig-form-input
                                v-model="product.title"
                                maxlength="70"
                                id="product_title" />
                        </fig-form-group>
                    </div>

                    <!-- caption -->
                    <div>
                        <fig-form-group class="mb-2">
                            <label slot="label" for="product_caption">{{ $t('Caption') }}</label>
                            <fig-form-input
                                v-model="product.caption"
                                maxlength="70"
                                id="product_caption" />
                        </fig-form-group>
                    </div>

                    <!-- description -->
                    <div>
                        <fig-form-group class="mb-2">
                            <label slot="label" for="product_description">{{ $t('Description') }}</label>
                            <fig-form-textarea
                                v-model="product.description"
                                :rows="2"
                                maxlength="320"
                                id="product_description" />
                        </fig-form-group>
                    </div>
                </fig-text-card>
            </div>
        </div>


        <!-- VARIANTS CARD -->
        <fig-text-card class="my-3">
            <div slot="header-left">{{ $t('Variants') }}</div>

            <div class="container mx-auto">
                <variant-table
                    :value="product.variants"
                    @change="colors => this.$set(product, 'variants', colors)" />
            </div>
        </fig-text-card>


        <div class="flex flex-wrap -mx-3 overflow-hidden">
            <div :class="css.cellOneHalf">
                <!-- SHIPPING CARD -->
                <fig-text-card>
                    <div slot="header-left">{{ $t('Shipping') }}</div>

                    <!-- is shippable (a physical product) -->
                    <div class="mb-3">
                        <fig-form-checkbox
                            v-model="product.shippable">{{ $t('This is a physical product') }}</fig-form-checkbox>
                    </div>

                    <div v-if="!product.shippable" class="text-sm">
                        {{ $t('shippable_off_desc') }}
                    </div>
                    <template v-else>
                        <hr>

                        <div class="text-base font-semibold mb-3">{{ $t('CUSTOMS INFORMATION') }}:</div>
                        <div class="px-4">
                            <!-- country of origin -->
                            <div class="mb-2">
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
                            <div>
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
                </fig-text-card>
            </div>

            <!-- PACKAGING CARD -->
            <div :class="css.cellOneHalf">
                <fig-text-card class="mb-5">
                    <div slot="header-left">{{ $t('Packaging') }}</div>

                    <!-- Ship alone -->
                    <div class="mb-5">
                        <fig-form-checkbox
                            v-model="product.ship_alone">{{ $t('ship_alone_description') }}</fig-form-checkbox>
                    </div>

                    <!-- Packing length -->
                    <div class="mb-2">
                        <fig-form-group>
                            <label slot="label" for="packing_length_cm">{{ $t('Packing length (cm)') }}</label>
                            <fig-form-input-number
                                v-model="product.packing_length_cm"
                                :step="1"
                                :min="0"
                                controls-right
                                size="md"
                                id="packing_length_cm" />
                        </fig-form-group>
                    </div>

                    <!-- Packing width -->
                    <div class="mb-2">
                        <fig-form-group>
                            <label slot="label" for="packing_width_cm">{{ $t('Packing width (cm)') }}</label>
                            <fig-form-input-number
                                v-model="product.packing_width_cm"
                                :step="1"
                                :min="0"
                                controls-right
                                size="md"
                                id="packing_width_cm" />
                        </fig-form-group>
                    </div>

                    <!-- Packing width -->
                    <div>
                        <fig-form-group>
                            <label slot="label" for="packing_height_cm">{{ $t('Packing height (cm)') }}</label>
                            <fig-form-input-number
                                v-model="product.packing_height_cm"
                                :step="1"
                                :min="0"
                                controls-right
                                size="md"
                                id="packing_height_cm" />
                        </fig-form-group>
                    </div>
                </fig-text-card>
            </div>
        </div>

        <div class="flex flex-wrap -mx-3 overflow-hidden">
            <!-- SEO CARD -->
            <div :class="css.cellOneHalf">
                <fig-text-card class="mb-5">
                    <div slot="header-left">{{ $t('Search engine listing') }}</div>

                    <!-- page title -->
                    <div>
                        <fig-form-group class="mb-2 block">
                            <label slot="label" for="product_seo_page_title">{{ $t('Page title') }}</label>
                            <fig-form-input
                                v-model="product.seo_page_title"
                                maxlength="70"
                                id="product_seo_page_title" />
                        </fig-form-group>
                    </div>

                    <!-- description -->
                    <div>
                        <fig-form-group class="mb-2 block">
                            <label slot="label" for="product_seo_page_desc">{{ $t('Description') }}</label>
                            <fig-form-textarea
                                v-model="product.seo_page_desc"
                                :rows="2"
                                maxlength="320"
                                id="product_seo_page_desc" />
                        </fig-form-group>
                    </div>

                    <!-- URI -->
                    <div>
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
                    </div>

                    <div class="mt-3 p-2 rounded bg-blue-100" v-show="product.seo_page_title">
                        <div class="text-xs text-gray-700 mb-1">{{ $t('Preview') }}:</div>
                        <seo-preview
                            :title="product.seo_page_title"
                            :description="product.seo_page_desc"
                            :uri="product.seo_uri" />
                    </div>
                </fig-text-card>
            </div>

            <!-- METADATA CARD -->
            <div :class="css.cellOneHalf">
                <fig-text-card class="mb-5">
                    <div slot="header-left">{{ $t('Metadata') }}</div>

                    <div class="container mx-auto">
                        <div class="pb-3">
                            <fig-form-checkbox
                                v-model="productHasMetaData">{{ $t('Metadata_description') }}</fig-form-checkbox>
                        </div>

                        <meta-data-builder
                            v-if="productHasMetaData"
                            v-model="product.metadata" />
                    </div>
                </fig-text-card>
            </div>
        </div>


        <div class="pt-4">
            <div class="flex items-center justify-center">
                <fig-button
                    variant="primary"
                    size="lg"
                    @click="onSaveClick"
                    :disabled="$v.product.$invalid">{{ $t('Save') }}</fig-button>
            </div>

            <div class="pt-2 text-danger flex justify-center" v-show="$v.product.$invalid">
                <fig-icon-label>
                    <fig-icon slot="left" icon="alert-circle" variant="danger" />
                    {{ $t('Please fix the errors above before saving') }}
                </fig-icon-label>
            </div>
        </div>
    </fig-overlay>
</template>
