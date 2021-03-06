<script>
import isObject from 'lodash.isobject';
import storage_mixin from '@/mixins/storage_mixin'; // TODO: not needed?
import ImageManager from '@/components/product/ImageManager';
import ColorSwatchTable from '@/components/product/colorSwatch/ColorSwatchTable';
import AccentMessageWizard from '@/components/product/accentMessage/AccentMessageWizard';
import VariantSkuTable from '@/components/product/variant/VariantSkuTable';
import MasterTypeSelect from '@/components/MasterTypeSelect';

import {
    FigButton,
    FigFormCheckbox,
    FigFormInput,
    FigFormGroup,
    FigSelectCountry,
    FigCol,
    FigRow,
    FigTextCard
} from '@notoursllc/figleaf';


export default {
    name: 'ColorUpsertForm',

    components: {
        ImageManager,
        ColorSwatchTable,
        AccentMessageWizard,
        VariantSkuTable,
        MasterTypeSelect,
        FigButton,
        FigFormCheckbox,
        FigFormInput,
        FigFormGroup,
        FigSelectCountry,
        FigCol,
        FigRow,
        FigTextCard
    },

    mixins: [
        storage_mixin
    ],

    props: {
        value: {
            type: Object,
            default: () => {
                return {};
            }
        }
    },

    data: function() {
        return {
            variant: {
                published: true,
                skus: [
                    { label: null }
                ]
            },
            imageManagerMaxImages: this.$config.SKU_IMAGE_MANAGER_MAX_IMAGES || 6,
            loadingImages: false
        };
    },

    watch: {
        value: {
            handler(newVal) {
                if(isObject(newVal)) {
                    this.variant = Object.assign({ published: true }, newVal);
                    return;
                }

                this.variant = {
                    published: true,
                    skus: [
                        { label: null }
                    ]
                };
            },
            immediate: true
        }
    },

    methods: {
        async onDeleteImage(media_id) {
            try {
                this.loadingImages = true;
                await this.$api.products.variants.deleteImage(
                    this.variant.id,
                    media_id
                );

                this.$figleaf.successToast({
                    title: this.$t('Success'),
                    text: this.$t('Image deleted successfully')
                });
            }
            catch(e) {
                this.$figleaf.errorToast({
                    title: this.$t('Error'),
                    text: e.message
                });
            }

            this.loadingImages = false;
        },

        onAccentWizardChange(obj) {
            this.$set(this.variant, 'accent_message_id', obj.accent_message_id);
            this.$set(this.variant, 'accent_message_begin', obj.accent_message_begin);
            this.$set(this.variant, 'accent_message_end', obj.accent_message_end);
        },

        onClickDone() {
            this.$emit('done', {
                ...this.variant
            });
        },

        onClickCancel() {
            this.$emit('cancel');
        },

        onVariantDefaultsChange(obj) {
            if(isObject(obj)) {
                for(const key in obj) {
                    this.$set(this.variant, key, obj[key]);
                }
            }
        },

        onSkusChange(skus) {
            this.$set(this.variant, 'skus', Array.isArray(skus) ? skus : []);
        },

        onColorSwatchChange(data) {
            this.variant.swatches = data;
        }
    }
};
</script>


<template>
    <div>

        <!-- General info -->
        <fig-text-card class="mb-5">
            <div class="mb-2">
                <!-- published -->
                <fig-form-checkbox
                    v-model="variant.published">{{ $t('Published') }}</fig-form-checkbox>
            </div>

            <div>
                <!-- is taxable -->
                <fig-form-checkbox
                    v-model="variant.is_taxable">{{ $t('Charge tax on this item') }}</fig-form-checkbox>
            </div>
        </fig-text-card>

        <!-- Color info -->
        <fig-text-card class="mb-5">
            <div slot="header-left">{{ $t('Color info') }}</div>

            <div class="container mx-auto">
                <fig-row sm="1/2" md="1/3" lg="1/4" xl="1/5" default="full" default-gap="1" sm-gap="2" key="org">

                    <!-- color name -->
                    <fig-col>
                        <fig-form-group>
                            <label slot="label" for="variant_name">{{ $t('Color name') }}</label>
                            <fig-form-input
                                v-model="variant.label"
                                id="variant_name" />
                        </fig-form-group>
                    </fig-col>

                    <!-- basic color type -->
                    <fig-col>
                        <fig-form-group class="mb-2">
                            <label slot="label" for="product_basic_color_type">{{ $t('Basic color') }}</label>
                            <master-type-select
                                v-model="variant.basic_color_type"
                                object="product_basic_color_type"
                                id="product_basic_color_type" />
                            <template slot="description">{{ $t('Used for product searches') }}</template>
                        </fig-form-group>
                    </fig-col>
                </fig-row>
            </div>
        </fig-text-card>


        <!-- Color images -->
        <fig-text-card class="mb-5">
            <div slot="header-left">{{ $t('Color images') }}</div>
            <div class="container mx-auto">
                <image-manager
                    v-model="variant.images"
                    @delete="onDeleteImage"
                    :max-num-images="parseInt(imageManagerMaxImages, 10)" />
            </div>
        </fig-text-card>


        <!-- Color swatches -->
        <fig-text-card class="mb-5">
            <div slot="header-left">
                {{ $t('Color swatches') }}
                <div class="fs12">({{ $t('optional') }})</div>
            </div>

            <div class="container mx-auto">
                <color-swatch-table
                    :value="variant.swatches"
                    @input="onColorSwatchChange" />
            </div>
        </fig-text-card>


        <!-- Sizes -->
        <fig-text-card class="mb-5">
            <div slot="header-left">{{ $t('Sizes') }}</div>
            <div class="container mx-auto">
                <variant-sku-table
                    :variant="variant"
                    @input="onSkusChange"
                    @defaults="onVariantDefaultsChange" />
            </div>
        </fig-text-card>


        <!-- accent message -->
        <fig-text-card class="mb-5">
            <div slot="header-left">
                {{ $t('Accent Message') }}
                <div class="fs12">({{ $t('accent_message_description') }})</div>
            </div>

            <div class="container mx-auto">
                <accent-message-wizard
                    :model="variant"
                    @input="onAccentWizardChange" />
            </div>
        </fig-text-card>


        <!-- shipping -->
        <fig-text-card class="mb-5">
            <div slot="header">{{ $t('Shipping') }}</div>

            <div class="container mx-auto">
                <h4>{{ $t('CUSTOMS INFORMATION') }}</h4>

                <div class="flex flex-wrap -mx-2">
                    <!-- country of origin -->
                    <div class="my-2 px-2 w-full xl:w-1/2">
                        <fig-form-group>
                            <label slot="label" for="sku_customs_country_of_origin">{{ $t('Country of origin') }}</label>
                            <fig-select-country
                                v-model="variant.customs_country_of_origin"
                                id="sku_customs_country_of_origin" />

                            <div slot="description">
                                {{ $t('customs_country_of_origin_desc') }}
                            </div>
                        </fig-form-group>
                    </div>
                </div>
            </div>
        </fig-text-card>


        <div class="flex items-center justify-center">
            <fig-button
                variant="primary"
                @click="onClickDone">{{ $t('Done') }}</fig-button>

            <fig-button
                variant="plain"
                @click="onClickCancel"
                class="ml-3">{{ $t('Cancel') }}</fig-button>
        </div>
    </div>
</template>
