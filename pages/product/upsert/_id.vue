<script>
import { required } from 'vuelidate/lib/validators';
import cloneDeep from 'lodash.clonedeep';
import product_mixin from '@/mixins/product_mixin';
import shipping_mixin from '@/mixins/shipping_mixin';

import MasterTypeSelect from '@/components/MasterTypeSelect';
import TextCard from '@/components/TextCard';
import MetaDataBuilder from '@/components/MetaDataBuilder';
// ImageManager: () => import('@/components/product/ImageManager'),
import SeoPreview from '@/components/product/SeoPreview';
import SkuManager from '@/components/product/sku/SkuManager';
import ColorTable from '@/components/product/color/ColorTable';
import AppOverlay from '@/components/AppOverlay';
import AppMessage from '@/components/AppMessage';
import AccentMessageWizard from '@/components/product/accentMessage/AccentMessageWizard';

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
        SkuManager,
        ColorTable,
        AppOverlay,
        AppMessage,
        AccentMessageWizard
    },

    mixins: [
        product_mixin,
        shipping_mixin
    ],

    data() {
        return {
            loading: false,
            loadingProductImages: false,
            product: {
                attributes: [],
                skus: [],
                images: []
            },
            productHasMetaData: false,
            domainName: this.$config.DOMAIN_NAME,
            imageManagerMaxImages: this.$config.IMAGE_MANAGER_MAX_IMAGES || 8,
            imageManagerMaxFeaturedImages: this.$config.IMAGE_MANAGER_MAX_FEATURED_IMAGES || 3,
            videoPlayerModal: {
                isActive: false,
                videoId: null,
                player: null
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
                // setting some defaults:
                this.product.published = true;
            }
        }
        catch(e) {
            this.$errorToast(e.message);
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

                this.productHasMetaData = product.metadata ? true : false;

                if(!Array.isArray(product.images)) {
                    product.images = [];
                }

                this.product = product;
            }
            catch(e) {
                this.$errorToast(e.message);
            }

            this.loading = false;
        },


        async onDeleteProductImage(id) {
            try {
                this.loadingProductImages = true;
                await this.$api.products.deleteImage(id);
                this.$successToast(this.$t('Image deleted successfully'));
            }
            catch(e) {
                this.$errorToast(e.message);
            }

            this.loadingProductImages = false;
        },


        async saveSkus(productId) {
            try {
                const product = cloneDeep(this.product);
                const p = await this.$api.products.upsert(product);

                if(!p) {
                    throw new Error('Error updating product');
                }

                await this.saveImages(p.id);
                await this.saveSkus(p.id);

                const title = p.id ? 'Product updated successfully' : 'Product added successfully';
                this.$successToast(`${title}: ${p.title}`);
                this.goToProductList();
            }
            catch(e) {
                this.$errorToast(e.message);
            }
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
        },


        playVideo(url) {
            const id = this.$youtube.getIdFromURL(url);
            if(id) {
                this.videoPlayerModal.videoId = id;
                this.videoPlayerModal.isActive = true;
            }
            else {
                this.videoPlayerModal.isActive = false;
            }
        },


        modalClosed() {
            if(this.videoPlayerModal.player) {
                this.videoPlayerModal.player.stopVideo();
            }
        },


        videoPlaying(player) {
            this.videoPlayerModal.player = player;
        }
    }
};
</script>


<template>
    <app-overlay :show="loading">

        <div class="tar mbm" v-if="product.id">
            <b-button
                variant="outline-secondary"
                @click="goToStore(product.seo_uri)">
                <fig-icon icon="new-window" stroke-width="1px" />&nbsp;{{ $t('View product in store') }}</b-button>
        </div>

        <!-- published-->
        <div class="mbl">
            <b-form-checkbox
                v-model="product.published">{{ $t('This product is available for purchase') }}</b-form-checkbox>
        </div>


        <!-- Organization -->
        <text-card class="mbl">
            <div slot="header">{{ $t('Organization') }}</div>

            <b-container>
                <b-row>
                    <!-- type -->
                    <b-col sm="12" md="4" lg="3">
                        <b-form-group
                            :label="$t('Product type')"
                            label-for="product_type">
                            <master-type-select
                                v-model="product.type"
                                object="product_type"
                                id="product_type" />
                        </b-form-group>
                    </b-col>

                    <!-- sub-type -->
                    <b-col sm="12" md="4" lg="3">
                        <b-form-group
                            :label="$t('Product sub-type')"
                            label-for="product_sub_type">
                            <master-type-select
                                v-model="product.sub_type"
                                object="product_sub_type"
                                id="product_sub_type" />
                        </b-form-group>
                    </b-col>

                    <!-- fit type -->
                    <b-col sm="12" md="4" lg="3">
                        <b-form-group
                            :label="$t('Fit type')"
                            label-for="product_fit_type">
                            <master-type-select
                                v-model="product.fit_type"
                                object="product_fit_type"
                                id="product_fit_type" />
                        </b-form-group>
                    </b-col>

                    <!-- sales channel -->
                    <b-col sm="12" md="4" lg="3">
                        <b-form-group
                            :label="$t('Sales channel')"
                            label-for="product_sales_channel_type">
                            <master-type-select
                                v-model="product.sales_channel_type"
                                object="product_sales_channel_type"
                                id="product_sales_channel_type" />
                        </b-form-group>
                    </b-col>

                    <!-- vendor -->
                    <b-col sm="12" md="4" lg="3">
                        <b-form-group
                            :label="$t('Vendor')"
                            label-for="product_vendor_type">
                            <master-type-select
                                v-model="product.vendor_type"
                                object="product_vendor_type"
                                :multiple="false"
                                id="product_vendor_type" />
                        </b-form-group>
                    </b-col>
                </b-row>
            </b-container>
        </text-card>


        <!-- Details -->
        <text-card class="mbl">
            <div slot="header">{{ $t('Details') }}</div>

            <b-container>
                <b-row>
                    <!-- page title -->
                    <b-col lg="12">
                        <b-form-group
                            :label="$t('Title')"
                            label-for="product_title">
                            <b-form-input
                                v-model="product.title"
                                maxlength="70"
                                id="product_title" />
                        </b-form-group>
                    </b-col>
                </b-row>

                <b-row>
                    <!-- caption -->
                    <b-col lg="12">
                        <b-form-group
                            :label="$t('Caption')"
                            label-for="product_caption">
                            <b-form-input
                                v-model="product.caption"
                                maxlength="70"
                                id="product_caption" />
                        </b-form-group>
                    </b-col>
                </b-row>

                <b-row>
                    <!-- description -->
                    <b-col lg="12">
                        <b-form-group
                            :label="$t('Description')"
                            label-for="product_description">
                            <b-form-textarea
                                v-model="product.description"
                                :rows="2"
                                maxlength="320"
                                id="product_description" />
                        </b-form-group>
                    </b-col>
                </b-row>
            </b-container>
        </text-card>


        <!-- Images
        <text-card class="mbl">
            <template v-slot:header>{{ $t('Featured images') }}</template>
            <template v-slot:headerSub>{{ $t('You can add up to num images', {number: imageManagerMaxFeaturedImages}) }}</template>

            <b-container>
                <app-overlay :show="loadingProductImages">
                    <image-manager
                        v-model="product.images"
                        :max-num-images="parseInt(imageManagerMaxFeaturedImages, 10)"
                        @delete="onDeleteProductImage" />
                </app-overlay>
            </b-container>
        </text-card>
        -->

        <text-card class="mbl">
            <template v-slot:header>{{ $t('Colors') }}</template>
            <color-table
                :product="product" />
        </text-card>


        <!-- accent message -->
        <text-card class="mbxl">
            <template v-slot:header>{{ $t('Accent Message') }}</template>
            <template v-slot:headerSub>{{ $t('accent_message_description') }}</template>
            <accent-message-wizard
                :model="product"
                @input="onAccentWizardChange" />
        </text-card>


        <!-- Variants / Options -->
        <text-card class="mbl">
            <div slot="header">{{ $t('Variants') }}</div>

            <sku-manager
                :product="product"
                :max-count="3"
                :attribute-suggestions="[
                    this.$t('Size'),
                    this.$t('Color'),
                    this.$t('Material')
                ]" />
        </text-card>


        <!-- SEO -->
        <text-card class="mbl">
            <div slot="header">{{ $t('Search engine listing') }}</div>

            <b-container>
                <b-row>
                    <!-- page title -->
                    <b-col lg="12">
                        <b-form-group
                            :label="$t('Page title')"
                            label-for="product_seo_page_title">
                            <b-form-input
                                v-model="product.seo_page_title"
                                maxlength="70"
                                id="product_seo_page_title" />
                        </b-form-group>
                    </b-col>
                </b-row>

                <b-row>
                    <!-- description -->
                    <b-col lg="12">
                        <b-form-group
                            :label="$t('Description')"
                            label-for="product_seo_page_desc">
                            <b-form-textarea
                                v-model="product.seo_page_desc"
                                :rows="2"
                                maxlength="320"
                                id="product_seo_page_desc" />
                        </b-form-group>
                    </b-col>
                </b-row>

                <b-row>
                    <!-- URI -->
                    <b-col lg="12">
                        <b-form-group
                            :label="$t('URL and handle')"
                            label-for="product_seo_uri"
                            :invalid-feedback="seoUrlValidationErrorMessage"
                            :state="$v.product.seo_uri.$anyError">
                            <b-input-group :prepend="`https://${domainName}/p/`">
                                <b-form-input
                                    v-model="product.seo_uri"
                                    maxlength="50"
                                    :state="!$v.product.seo_uri.$invalid ? null : false"
                                    id="product_seo_uri" />
                            </b-input-group>
                        </b-form-group>
                        {{ $v.product.seo_uri }}
                    </b-col>
                </b-row>
            </b-container>

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

            <b-container>
                <b-form-group>
                    <b-form-checkbox
                        v-model="productHasMetaData">{{ $t('Metadata_description') }}</b-form-checkbox>
                </b-form-group>

                <div v-if="productHasMetaData">
                    <meta-data-builder v-model="product.metadata" />
                </div>
            </b-container>
        </text-card>


        <div class="pt-4 text-center">
            <b-button
                variant="primary"
                size="lg"
                @click="onSaveClick"
                :disabled="$v.product.$invalid">{{ $t('Save') }}</b-button>

            <div class="pt-2 text-danger" v-show="$v.product.$invalid">
                <div class="inlineBlock">
                    <app-message>
                        <fig-icon slot="icon" icon="alert-circle" variant="danger" />
                        {{ $t('Please fix the errors above before saving') }}
                    </app-message>
                </div>
            </div>
        </div>
    </app-overlay>
</template>
