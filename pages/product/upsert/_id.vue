<script>
import Vue from 'vue';
import { required } from 'vuelidate/lib/validators';
import product_mixin from '@/mixins/product_mixin';
import shipping_mixin from '@/mixins/shipping_mixin';

import MasterTypeSelect from '@/components/MasterTypeSelect';
import ProductArtistSelect from '@/components/product/artist/ProductArtistSelect.vue';
import ProductTaxCodeSelect from '@/components/product/ProductTaxCodeSelect.vue';
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
    FigIconLabel,
    FigMetaDataBuilder
} from '@notoursllc/figleaf';


const urlValidator = (value) => {
    const val = value || '';

    // https://stackoverflow.com/a/1547940
    return val.match(/^[A-Za-z0-9\-._~:?#\[\]@!$&'()*+,;=]+$/g) !== null;
};


export default Vue.extend({
    components: {
        MasterTypeSelect,
        ProductArtistSelect,
        ProductTaxCodeSelect,
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
        FigIconLabel,
        FigMetaDataBuilder
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
                cellOneFourth: 'mb-2 px-2 w-full md:w-1/2 xl:w-1/4',
                cellOneThird: 'mb-2 px-2 w-full lg:w-1/2 xl:w-1/3',
                cellOneHalf: 'mb-2 px-2 w-full lg:w-1/2'
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
                const { data } = await this.$api.product.get(
                    id,
                    { _withRelated: '*' }
                );

                if(!data) {
                    throw new Error(this.$t('Product not found'));
                }

                this.productHasMetaData = !!data.metadata;
                this.product = data;
                this.$store.dispatch('ui/title', this.$t('Product: {name}', { name: data.title }));
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

                const { data } = await this.$api.product.upsert(this.product);

                if(!data) {
                    throw new Error('Error updating product');
                }

                this.$figleaf.successToast({
                    title: data.id ? this.$t('Product updated successfully') : this.$t('Product added successfully'),
                    text: data.title
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


        <!-- ORGANIZATION -->
        <fig-text-card class="mb-6" variant="white">
            <template v-slot:header-left>
                <div class="flex justify-center mr-2">
                    <fig-icon
                        icon="list-check"
                        width="26"
                        height="26"
                        :stroke-width="1" />
                    <div class="text-lg font-bold pl-2">{{ $t('Organization') }}</div>
                </div>
            </template>

            <div class="flex flex-wrap -mx-2">
                <fig-form-group :class="css.cellOneHalf">
                    <template v-slot:label>
                        <label for="product_type">{{ $t('Product type') }}</label>
                    </template>
                    <master-type-select
                        v-model="product.type"
                        object="product_type"
                        id="product_type" />
                </fig-form-group>

                <!-- sub-type -->
                <fig-form-group :class="css.cellOneHalf">
                    <template v-slot:label>
                        <label for="product_sub_type">{{ $t('Product sub-type') }}</label>
                    </template>
                    <master-type-select
                        v-model="product.sub_type"
                        object="product_sub_type"
                        id="product_sub_type" />
                </fig-form-group>

                <!-- sales channel -->
                <fig-form-group :class="css.cellOneHalf">
                    <template v-slot:label>
                        <label for="product_sales_channel_type">{{ $t('Sales channel') }}</label>
                    </template>
                    <master-type-select
                        v-model="product.sales_channel_type"
                        object="product_sales_channel_type"
                        id="product_sales_channel_type" />
                </fig-form-group>

                <!-- vendor -->
                <fig-form-group :class="css.cellOneHalf">
                    <template v-slot:label>
                        <label for="product_vendor_type">{{ $t('Vendor') }}</label>
                    </template>
                    <master-type-select
                        v-model="product.vendor_type"
                        object="product_vendor_type"
                        :multiple="false"
                        id="product_vendor_type" />
                </fig-form-group>
            </div>
        </fig-text-card>


        <!-- STYLE -->
        <fig-text-card class="mb-6" variant="white">
            <template v-slot:header-left>
                <div class="flex justify-center mr-2">
                    <fig-icon
                        icon="shirt"
                        width="26"
                        height="26"
                        :stroke-width="1" />
                    <div class="text-lg font-bold pl-2">{{ $t('Style') }}</div>
                </div>
            </template>

            <div class="flex flex-wrap -mx-2">
                <!-- gender -->
                <fig-form-group :class="css.cellOneHalf">
                    <template v-slot:label>
                        <label for="product_gender_type">{{ $t('Gender') }}</label>
                    </template>
                    <master-type-select
                        v-model="product.gender_type"
                        object="product_gender_type"
                        id="product_gender_type" />
                </fig-form-group>

                <!-- fit -->
                <fig-form-group :class="css.cellOneHalf">
                    <template v-slot:label>
                        <label for="product_fit_type">{{ $t('Fit') }}</label>
                    </template>
                    <master-type-select
                        v-model="product.fit_type"
                        object="product_fit_type"
                        id="product_fit_type" />
                </fig-form-group>

                <!-- sleeve -->
                <fig-form-group :class="css.cellOneHalf">
                    <template v-slot:label>
                        <label for="product_sleeve_length_type">{{ $t('Sleeve') }}</label>
                    </template>
                    <master-type-select
                        v-model="product.sleeve_length_type"
                        object="product_sleeve_length_type"
                        id="product_sleeve_length_type" />
                </fig-form-group>

                <!-- feature -->
                <fig-form-group :class="css.cellOneHalf">
                    <template v-slot:label>
                        <label for="product_feature_type">{{ $t('Feature') }}</label>
                    </template>
                    <master-type-select
                        v-model="product.feature_type"
                        object="product_feature_type"
                        id="product_feature_type" />
                </fig-form-group>
            </div>
        </fig-text-card>


        <!-- DETAILS -->
        <fig-text-card class="mb-6" variant="white">
            <template v-slot:header-left>
                <div class="flex justify-center mr-2">
                    <fig-icon
                        icon="tag"
                        width="26"
                        height="26"
                        :stroke-width="1" />
                    <div class="text-lg font-bold pl-2">{{ $t('Details') }}</div>
                </div>
            </template>

            <div class="flex flex-wrap -mx-2">
                <!-- page title -->
                <fig-form-group :class="css.cellOneHalf">
                    <template v-slot:label>
                        <label for="product_title">{{ $t('Title') }}</label>
                    </template>
                    <fig-form-input
                        v-model="product.title"
                        maxlength="70"
                        id="product_title" />
                </fig-form-group>

                <!-- caption -->
                <fig-form-group :class="css.cellOneHalf">
                    <template v-slot:label>
                        <label for="product_caption">{{ $t('Caption') }}</label>
                    </template>
                    <fig-form-input
                        v-model="product.caption"
                        maxlength="70"
                        id="product_caption" />
                </fig-form-group>

                <!-- description -->
                <fig-form-group :class="css.cellOneHalf">
                    <template v-slot:label>
                        <label for="product_description">{{ $t('Description') }}</label>
                    </template>
                    <fig-form-textarea
                        v-model="product.description"
                        :rows="2"
                        maxlength="320"
                        id="product_description" />
                </fig-form-group>
            </div>
        </fig-text-card>


        <!-- VARIANTS -->
        <fig-text-card class="mb-6" variant="white">
            <template v-slot:header-left>
                <div class="flex justify-center mr-2">
                    <fig-icon
                        icon="triangle-square-circle"
                        width="26"
                        height="26"
                        :stroke-width="1" />
                    <div class="text-lg font-bold pl-2">{{ $t('Variants') }}</div>
                </div>
            </template>

            <variant-table
                :value="product.variants"
                @change="colors => this.$set(product, 'variants', colors)" />
        </fig-text-card>


        <!-- SHIPPING -->
        <fig-text-card class="mb-6" variant="white">
            <template v-slot:header-left>
                <div class="flex justify-center mr-2">
                    <fig-icon
                        icon="truck"
                        width="26"
                        height="26"
                        :stroke-width="1" />
                    <div class="text-lg font-bold pl-2">{{ $t('Shipping') }}</div>
                </div>
            </template>

            <!-- is shippable (a physical product) -->
            <div class="mb-3">
                <fig-form-checkbox
                    v-model="product.shippable">{{ $t('This is a physical product') }}</fig-form-checkbox>
            </div>

            <div v-if="!product.shippable" class="text-sm">
                {{ $t('shippable_off_desc') }}
            </div>

            <div v-else class="px-4">
                <div class="font-semibold mb-2">{{ $t('CUSTOMS INFORMATION') }}:</div>
                <div class="flex flex-wrap -mx-2 md:-mx-3">
                    <!-- country of origin -->
                    <fig-form-group :class="css.cellOneHalf">
                        <template v-slot:label>
                            <label for="product_customs_country_of_origin">{{ $t('Country of origin') }}</label>
                        </template>
                        <fig-select-country
                            v-model="product.customs_country_of_origin"
                            id="product_customs_country_of_origin" />

                        <div slot="description">
                            {{ $t('customs_country_of_origin_desc') }}
                        </div>
                    </fig-form-group>

                    <!-- HS code -->
                    <fig-form-group :class="css.cellOneHalf">
                        <template v-slot:label>
                            <label for="product_customs_harmonized_system_code">{{ $t('HS (Harmonized System) code') }}</label>
                        </template>
                        <fig-form-input
                            v-model="product.customs_harmonized_system_code"
                            id="product_customs_harmonized_system_code" />

                        <div slot="description">
                            {{ $t('customs_hs_code_desc') }}
                        </div>
                    </fig-form-group>
                </div>
            </div>
        </fig-text-card>


        <!-- PACKAGING -->
        <fig-text-card class="mb-6" variant="white">
            <template v-slot:header-left>
                <div class="flex justify-center mr-2">
                    <fig-icon
                        icon="package"
                        width="26"
                        height="26"
                        :stroke-width="1" />
                    <div class="text-lg font-bold pl-2">{{ $t('Packaging') }}</div>
                </div>
            </template>

            <!-- Ship alone -->
            <div class="mb-5">
                <fig-form-checkbox
                    v-model="product.ship_alone">{{ $t('ship_alone_description') }}</fig-form-checkbox>
            </div>

            <div class="flex flex-wrap -mx-2">
                <!-- Packing length -->
                <fig-form-group :class="css.cellOneHalf">
                    <template v-slot:label>
                        <label for="packing_length_cm">{{ $t('Packing length (cm)') }}</label>
                    </template>
                    <fig-form-input-number
                        v-model="product.packing_length_cm"
                        :step="1"
                        :min="0"
                        controls-right
                        size="md"
                        id="packing_length_cm" />
                </fig-form-group>

                <!-- Packing width -->
                <fig-form-group :class="css.cellOneHalf">
                    <template v-slot:label>
                        <label for="packing_width_cm">{{ $t('Packing width (cm)') }}</label>
                    </template>
                    <fig-form-input-number
                        v-model="product.packing_width_cm"
                        :step="1"
                        :min="0"
                        controls-right
                        size="md"
                        id="packing_width_cm" />
                </fig-form-group>

                <!-- Packing width -->
                <fig-form-group :class="css.cellOneHalf">
                    <template v-slot:label>
                        <label for="packing_height_cm">{{ $t('Packing height (cm)') }}</label>
                    </template>
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


        <!-- TAX -->
        <fig-text-card class="mb-6" variant="white">
            <template v-slot:header-left>
                <div class="flex justify-center mr-2">
                    <fig-icon
                        icon="receipt-tax"
                        width="26"
                        height="26"
                        :stroke-width="1" />
                    <div class="text-lg font-bold pl-2">{{ $t('Tax') }}</div>
                </div>
            </template>

            <div class="flex flex-wrap -mx-2">
                <fig-form-group :class="css.cellOneHalf">
                    <template v-slot:label>
                        <label for="product_tax_code">{{ $t('Tax code') }}</label>
                    </template>
                    <product-tax-code-select
                        v-model="product.tax_code"
                        id="product_tax_code" />
                </fig-form-group>
            </div>
        </fig-text-card>

        <!-- ARTIST -->
        <fig-text-card class="mb-6" variant="white">
            <template v-slot:header-left>
                <div class="flex justify-center mr-2">
                    <fig-icon
                        icon="palette"
                        width="26"
                        height="26"
                        :stroke-width="1" />
                    <div class="text-lg font-bold pl-2">{{ $t('Artist/Photographer') }}</div>
                </div>
            </template>

            <div class="flex flex-wrap -mx-2">
                <fig-form-group :class="css.cellOneHalf">
                    <product-artist-select
                        v-model="product.product_artist_id" />
                </fig-form-group>
            </div>
        </fig-text-card>


        <!-- SEARCH ENGINE LISTING-->
        <fig-text-card class="mb-6" variant="white">
            <template v-slot:header-left>
                <div class="flex justify-center mr-2">
                    <fig-icon
                        icon="search"
                        width="26"
                        height="26"
                        :stroke-width="1" />
                    <div class="text-lg font-bold pl-2">{{ $t('Search engine listing') }}</div>
                </div>
            </template>

            <div class="flex flex-wrap -mx-2">
                <!-- page title -->
                <fig-form-group :class="css.cellOneHalf">
                    <template v-slot:label>
                        <label for="product_seo_page_title">{{ $t('Page title') }}</label>
                    </template>
                    <fig-form-input
                        v-model="product.seo_page_title"
                        maxlength="70"
                        id="product_seo_page_title" />
                </fig-form-group>

                <!-- URI -->
                <fig-form-group :class="css.cellOneHalf">
                    <template v-slot:label>
                        <label for="product_seo_uri">{{ $t('URL and handle') }}</label>
                    </template>
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

                <!-- description -->
                <fig-form-group :class="css.cellOneHalf">
                    <template v-slot:label>
                        <label for="product_seo_page_desc">{{ $t('Description') }}</label>
                    </template>
                    <fig-form-textarea
                        v-model="product.seo_page_desc"
                        :rows="2"
                        maxlength="320"
                        id="product_seo_page_desc" />
                </fig-form-group>

                <!-- preview -->
                <fig-form-group :class="css.cellOneHalf">
                    <template v-slot:label>
                        <label>{{ $t('Preview') }}</label>
                    </template>
                    <div class="py-2 px-4 rounded bg-blue-100" v-show="product.seo_page_title">
                        <seo-preview
                            :title="product.seo_page_title"
                            :description="product.seo_page_desc"
                            :uri="product.seo_uri" />
                    </div>
                </fig-form-group>
            </div>
        </fig-text-card>


        <!-- META DATA -->
        <fig-text-card class="mb-6" variant="white">
            <template v-slot:header-left>
                <div class="flex justify-center mr-2">
                    <fig-icon
                        icon="file-code"
                        width="26"
                        height="26"
                        :stroke-width="1" />
                    <div class="text-lg font-bold pl-2">{{ $t('Metadata') }}</div>
                </div>
            </template>

            <div class="pb-3">
                <fig-form-checkbox
                    v-model="productHasMetaData">{{ $t('Metadata_description') }}</fig-form-checkbox>
            </div>

            <fig-meta-data-builder
                v-if="productHasMetaData"
                v-model="product.metadata" />
        </fig-text-card>


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
