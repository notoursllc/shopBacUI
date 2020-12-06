<script>
import { required } from 'vuelidate/lib/validators';
import product_mixin from '@/mixins/product_mixin';
import shipping_mixin from '@/mixins/shipping_mixin';

import MasterTypeSelect from '@/components/MasterTypeSelect';
import TextCard from '@/components/TextCard';
import MetaDataBuilder from '@/components/MetaDataBuilder';
// ImageManager: () => import('@/components/product/ImageManager'),
import SeoPreview from '@/components/product/SeoPreview';
import ColorTable from '@/components/product/color/ColorTable';
import AppMessage from '@/components/AppMessage';

import {
    FigFormCheckbox,
    FigFormGroup,
    FigFormInput,
    FigFormTextarea,
    FigButton,
    FigFormInputEndcapper,
    FigOverlay
} from '@notoursllc/figleaf';


const urlValidator = (value) => {
    const val = value || '';

    // https://stackoverflow.com/a/1547940
    return val.match(/^[A-Za-z0-9\-._~:?#\[\]@!$&'()*+,;=]+$/g) !== null;
};


export default {
    components: {
        MasterTypeSelect,
        TextCard,
        MetaDataBuilder,
        SeoPreview,
        ColorTable,
        AppMessage,
        FigFormCheckbox,
        FigFormGroup,
        FigFormInput,
        FigFormTextarea,
        FigButton,
        FigFormInputEndcapper,
        FigOverlay
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

    async mounted() {
        try {
            if(this.$route.params.id) {
                this.fetchProduct();
            }
            else {
                // setting some defaults:
                this.product.published = true;
            }
        }
        catch(e) {
            this.$errorToast(e.message);
        }

        const msg = this.$createElement(
            'div',
            {
                // class: 'border border-gray-500'
            },
            'vnode message that is a bit long lets sere what happens here'
        );

        // this.$showConfirm(
        //     msg,
        //     {
        //         title: 'Test title'
        //     },
        //     'warning'
        // )
        // .then((confirmed) => {
        //     console.log("promise resolved", confirmed);
        // });

        // const confirmed = await this.$showConfirm(
        //     msg,
        //     {
        //         title: 'Test title'
        //     },
        //     'warning'
        // );
        // console.log("promise resolved", confirmed);

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
            }
            catch(e) {
                this.$errorToast(e.message);
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

                const title = p.id ? this.$t('Product updated successfully') : this.$t('Product added successfully');
                this.$successToast(`${title}: ${p.title}`);
                this.goToProductList();
            }
            catch(e) {
                this.$errorToast(e.message);
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
};
</script>


<template>
    <fig-overlay :show="loading">

        <div class="tar mbm" v-if="product.id">
            <fig-button
                variant="plain"
                @click="goToStore(product.seo_uri)"
                icon="new-window">{{ $t('View product in store') }}</fig-button>
        </div>

        <!-- published-->
        <div class="mbl">
            <fig-form-checkbox
                v-model="product.published">{{ $t('This product is available for purchase') }}</fig-form-checkbox>
        </div>


        <!-- Organization -->
        <text-card class="mbl">
            <div slot="header">{{ $t('Organization') }}</div>

            <div class="container mx-auto">
                <div class="flex flex-wrap -mx-3 overflow-hidden">
                    <!-- type -->
                    <div class="my-3 px-3 w-full overflow-hidden sm:w-1/2 md:w-1/3 xl:w-1/4">
                        <fig-form-group class="mb-2">
                            <label slot="label" for="product_type">{{ $t('Product type') }}</label>
                            <master-type-select
                                v-model="product.type"
                                object="product_type"
                                id="product_type" />
                        </fig-form-group>
                    </div>

                    <!-- sub-type -->
                    <div class="my-3 px-3 w-full overflow-hidden sm:w-1/2 md:w-1/3 xl:w-1/4">
                        <fig-form-group class="mb-2">
                            <label slot="label" for="product_sub_type">{{ $t('Product sub-type') }}</label>
                            <master-type-select
                                v-model="product.sub_type"
                                object="product_sub_type"
                                id="product_sub_type" />
                        </fig-form-group>
                    </div>

                    <!-- fit type -->
                    <div class="my-3 px-3 w-full overflow-hidden sm:w-1/2 md:w-1/3 xl:w-1/4">
                        <fig-form-group class="mb-2">
                            <label slot="label" for="product_fit_type">{{ $t('Fit type') }}</label>
                            <master-type-select
                                v-model="product.fit_type"
                                object="product_fit_type"
                                id="product_fit_type" />
                        </fig-form-group>
                    </div>

                    <!-- sales channel -->
                    <div class="my-3 px-3 w-full overflow-hidden sm:w-1/2 md:w-1/3 xl:w-1/4">
                        <fig-form-group class="mb-2">
                            <label slot="label" for="product_sales_channel_type">{{ $t('Sales channel') }}</label>
                            <master-type-select
                                v-model="product.sales_channel_type"
                                object="product_sales_channel_type"
                                id="product_sales_channel_type" />
                        </fig-form-group>
                    </div>

                    <!-- vendor -->
                    <div class="my-3 px-3 w-full overflow-hidden sm:w-1/2 md:w-1/3 xl:w-1/4">
                        <fig-form-group class="mb-2">
                            <label slot="label" for="product_vendor_type">{{ $t('Vendor') }}</label>
                            <master-type-select
                                v-model="product.vendor_type"
                                object="product_vendor_type"
                                :multiple="false"
                                id="product_vendor_type" />
                        </fig-form-group>
                    </div>
                </div>
            </div>
        </text-card>


        <!-- Details -->
        <text-card class="mbl">
            <div slot="header">{{ $t('Details') }}</div>

            <div class="container mx-auto">
                <div>
                    <!-- page title -->
                    <fig-form-group class="mb-2">
                        <label slot="label" for="product_title">{{ $t('Title') }}</label>
                        <fig-form-input
                            v-model="product.title"
                            maxlength="70"
                            id="product_title" />
                    </fig-form-group>
                </div>

                <div>
                    <!-- caption -->
                    <fig-form-group class="mb-2">
                        <label slot="label" for="product_caption">{{ $t('Caption') }}</label>
                        <fig-form-input
                            v-model="product.caption"
                            maxlength="70"
                            id="product_caption" />
                    </fig-form-group>
                </div>

                <div>
                    <!-- description -->
                    <fig-form-group class="mb-2">
                        <label slot="label" for="product_description">{{ $t('Description') }}</label>
                        <fig-form-textarea
                            v-model="product.description"
                            :rows="2"
                            maxlength="320"
                            id="product_description" />
                    </fig-form-group>
                </div>
            </div>
        </text-card>


        <text-card class="mbl">
            <template v-slot:header>{{ $t('Colors') }}</template>

            <div class="container mx-auto">
                <color-table
                    :colors="product.variants"
                    @change="colors => this.$set(product, 'variants', colors)" />
            </div>
        </text-card>


        <!-- SEO -->
        <text-card class="mbl">
            <div slot="header">{{ $t('Search engine listing') }}</div>

            <div class="container mx-auto">
                <!-- page title -->
                <fig-form-group class="mb-2 block">
                    <label slot="label" for="product_seo_page_title">{{ $t('Page title') }}</label>
                    <fig-form-input
                        v-model="product.seo_page_title"
                        maxlength="70"
                        id="product_seo_page_title" />
                </fig-form-group>

                <!-- description -->
                <fig-form-group class="mb-2 block">
                    <label slot="label" for="product_seo_page_desc">{{ $t('Description') }}</label>
                    <fig-form-textarea
                        v-model="product.seo_page_desc"
                        :rows="2"
                        maxlength="320"
                        id="product_seo_page_desc" />
                </fig-form-group>

                <!-- URI -->
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

            <div class="pvl" v-show="product.seo_page_title">
                <div class="fs11 colorGray mbs">Preview:</div>
                <seo-preview
                    :title="product.seo_page_title"
                    :description="product.seo_page_desc"
                    :uri="product.seo_uri" />
            </div>
        </text-card>


        <!-- Metadata -->
        <text-card class="mbl">
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
                <div class="inlineBlock">
                    <app-message>
                        <fig-icon slot="icon" icon="alert-circle" variant="danger" />
                        {{ $t('Please fix the errors above before saving') }}
                    </app-message>
                </div>
            </div>
        </div>
    </fig-overlay>
</template>
