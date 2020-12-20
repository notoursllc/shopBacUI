<script>
import isObject from 'lodash.isobject';
import storage_mixin from '@/mixins/storage_mixin'; // TODO: not needed?
import TextCard from '@/components/TextCard';
import PricingForm from '@/components/product/PricingForm';
import ImageManager from '@/components/product/ImageManager';
import ColorSwatchTable from '@/components/product/colorSwatch/ColorSwatchTable';
import AccentMessageWizard from '@/components/product/accentMessage/AccentMessageWizard';
import SkuManager from '@/components/product/size/SkuManager';

import {
    FigButton,
    FigFormCheckbox,
    FigFormInput,
    FigFormGroup,
    FigFormInputNumber,
    FigFormSelectCountry
} from '@notoursllc/figleaf';


export default {
    name: 'ColorUpsertForm',

    components: {
        TextCard,
        PricingForm,
        ImageManager,
        ColorSwatchTable,
        AccentMessageWizard,
        SkuManager,
        FigButton,
        FigFormCheckbox,
        FigFormInput,
        FigFormGroup,
        FigFormInputNumber,
        FigFormSelectCountry
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
                    this.variant = Object.assign({}, newVal);
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
        async onDeleteImage(id) {
            try {
                this.loadingImages = true;
                await this.$api.productSkus.deleteImage(id); // TODO

                this.$successToast({
                    title: this.$t('Success'),
                    text: this.$t('Image deleted successfully')
                });
            }
            catch(e) {
                this.$errorToast({
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

        onPricingFormInput(obj) {
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
        <text-card class="mb-5">
            <div slot="header">{{ $t('Color info') }}</div>

            <!-- published -->
            <div class="container mx-auto">
                <div class="mb-3">
                    <fig-form-checkbox
                        v-model="variant.published">{{ $t('Published') }}</fig-form-checkbox>
                </div>

                <!-- color name -->
                <fig-form-group>
                    <label slot="label" for="variant_name">{{ $t('Color name') }}</label>
                    <fig-form-input
                        v-model="variant.label"
                        id="variant_name" />
                </fig-form-group>
            </div>
        </text-card>


        <!-- Color images -->
        <text-card class="mb-5">
            <div slot="header">{{ $t('Color images') }}</div>
            <div class="container mx-auto">
                <image-manager
                    v-model="variant.images"
                    @delete="onDeleteImage"
                    :max-num-images="parseInt(imageManagerMaxImages, 10)" />
            </div>
        </text-card>


        <!-- Color swatches -->
        <text-card class="mb-5">
            <div slot="header">{{ $t('Color swatches') }}</div>
            <div slot="headerSub">({{ $t('optional') }})</div>
            <div class="container mx-auto">
                <color-swatch-table
                    :value="variant.swatches"
                    @input="onColorSwatchChange" />
            </div>
        </text-card>


        <!-- Sizes -->
        <text-card class="mb-5">
            <div slot="header">{{ $t('Sizes') }}</div>

            <div class="container mx-auto">
                <sku-manager
                    :value="variant.skus"
                    @input="onSkusChange" />
            </div>
        </text-card>


        <!-- pricing -->
        <text-card class="mb-5">
            <div slot="header">{{ $t('Pricing') }}</div>

            <div class="container mx-auto">
                <pricing-form
                    :data="variant"
                    @input="onPricingFormInput" />
            </div>
        </text-card>


        <!-- accent message -->
        <text-card class="mb-5">
            <div slot="header">{{ $t('Accent Message') }}</div>
            <template v-slot:headerSub>{{ $t('accent_message_description') }}</template>

            <div class="container mx-auto">
                <accent-message-wizard
                    :model="variant"
                    @input="onAccentWizardChange" />
            </div>
        </text-card>


        <!-- shipping -->
        <text-card class="mb-5">
            <div slot="header">{{ $t('Shipping') }}</div>

            <div class="container mx-auto">
                <!-- requires shipping -->
                <div class="mb-3">
                    <fig-form-checkbox
                        v-model="variant.requires_shipping">{{ $t('This is a physical product') }}</fig-form-checkbox>
                </div>

                <template v-if="!variant.requires_shipping">
                    {{ $t('requires_shipping_off_desc') }}
                </template>
                <template v-else>
                    <hr />

                    <div class="flex">
                        <fig-form-group v-if="variant.requires_shipping">
                            <label slot="label" for="sku_weight_oz">{{ $t('Weight (oz)') }}</label>
                            <fig-form-input-number
                                v-model="variant.weight_oz"
                                :step=".01"
                                :min="0"
                                id="sku_weight_oz" />

                            <div slot="description">
                                {{ $t('Used to calculate shipping rates at checkout and label prices during fulfillment.') }}
                            </div>
                        </fig-form-group>
                    </div>

                    <hr />

                    <h4>{{ $t('CUSTOMS INFORMATION') }}</h4>

                    <div class="flex flex-wrap -mx-2">
                        <!-- country of origin -->
                        <div class="my-2 px-2 w-full xl:w-1/2">
                            <fig-form-group>
                                <label slot="label" for="sku_customs_country_of_origin">{{ $t('Country of origin') }}</label>
                                <fig-form-select-country
                                    v-model="variant.customs_country_of_origin"
                                    id="sku_customs_country_of_origin" />

                                <div slot="description">
                                    {{ $t('customs_country_of_origin_desc') }}
                                </div>
                            </fig-form-group>
                        </div>

                        <!-- HS code -->
                        <div class="my-2 px-2 w-full xl:w-1/2">
                            <fig-form-group>
                                <label slot="label" for="sku_customs_harmonized_system_code">{{ $t('HS (Harmonized System) code') }}</label>
                                <fig-form-input
                                    v-model="variant.customs_harmonized_system_code"
                                    id="sku_customs_harmonized_system_code" />

                                <div slot="description">
                                    {{ $t('customs_hs_code_desc') }}
                                </div>
                            </fig-form-group>
                        </div>
                    </div>
                </template>
            </div>
        </text-card>


        <div class="text-center">
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
