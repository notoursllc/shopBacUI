<script>
import isObject from 'lodash.isobject';
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
                is_taxable: true,
                skus: [
                    { label: null }
                ]
            },
            imageManagerMaxImages: this.$config.SKU_IMAGE_MANAGER_MAX_IMAGES || 6,
            loadingImages: false,
            css: {
                cellOneFourth: 'mb-2 px-2 w-full md:w-1/2 xl:w-1/4',
                cellOneThird: 'mb-2 px-2 w-full lg:w-1/2 xl:w-1/3',
                cellOneHalf: 'mb-2 px-2 w-full lg:w-1/2'
            }
        };
    },

    watch: {
        value: {
            handler(newVal) {
                if(isObject(newVal)) {
                    this.variant = Object.assign(
                        {
                            published: true,
                            is_taxable: true
                        },
                        newVal
                    );
                    return;
                }

                this.variant = {
                    published: true,
                    is_taxable: true,
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
                await this.$api.product.variant.deleteImage(
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





        <!-- Variant images -->
        <fig-text-card class="mb-6" variant="white">
            <template v-slot:header-left>
                <div class="text-lg font-bold">{{ $t('Variant images') }}</div>
            </template>

            <image-manager
                v-model="variant.images"
                @delete="onDeleteImage"
                :max-num-images="parseInt(imageManagerMaxImages, 10)" />
        </fig-text-card>


        <!-- Color swatches -->
        <fig-text-card class="mb-6" variant="white">
            <template v-slot:header-left>
                <div class="text-lg font-bold">{{ $t('Color swatches') }}</div>
                <div class="text-sm">&nbsp;&nbsp;({{ $t('optional') }})</div>
            </template>

            <color-swatch-table
                :value="variant.swatches"
                @input="onColorSwatchChange" />
        </fig-text-card>


        <!-- Color info -->
        <fig-text-card class="mb-6" variant="white">
            <template v-slot:header-left>
                <div class="text-lg font-bold">{{ $t('Color info') }}</div>
            </template>

            <div class="flex flex-wrap -mx-2">
                <!-- color name -->
                <fig-form-group :class="css.cellOneThird">
                    <label slot="label" for="variant_name">{{ $t('Color name') }}</label>
                    <fig-form-input
                        v-model="variant.label"
                        id="variant_name" />
                </fig-form-group>

                <!-- basic color type -->
                <fig-form-group :class="css.cellOneThird">
                    <label slot="label" for="product_basic_color_type">{{ $t('Basic color') }}</label>
                    <master-type-select
                        v-model="variant.basic_color_type"
                        object="product_basic_color_type"
                        id="product_basic_color_type" />
                    <template slot="description">{{ $t('Used for product searches') }}</template>
                </fig-form-group>
            </div>
        </fig-text-card>


        <!-- Sizes -->
        <fig-text-card class="mb-6" variant="white">
            <template v-slot:header-left>
                <div class="text-lg font-bold">{{ $t('Sizes') }}</div>
            </template>

            <variant-sku-table
                :variant="variant"
                @input="onSkusChange"
                @defaults="onVariantDefaultsChange" />
        </fig-text-card>


        <!-- accent message -->
        <fig-text-card class="mb-6" variant="white">
            <template v-slot:header-left>
                <div class="text-lg font-bold">{{ $t('Accent Message') }}</div>
                <div class="test-sm">&nbsp;&nbsp;({{ $t('accent_message_description') }})</div>
            </template>

            <accent-message-wizard
                :model="variant"
                @input="onAccentWizardChange" />
        </fig-text-card>


        <!-- shipping -->
        <fig-text-card class="mb-6" variant="white">
            <template v-slot:header-left>
                <div class="text-lg font-bold">{{ $t('Shipping') }}</div>
            </template>

            <h4>{{ $t('CUSTOMS INFORMATION') }}</h4>

            <div class="flex flex-wrap -mx-2">
                <!-- country of origin -->
                <fig-form-group :class="css.cellOneThird">
                    <label slot="label" for="sku_customs_country_of_origin">{{ $t('Country of origin') }}</label>
                    <fig-select-country
                        v-model="variant.customs_country_of_origin"
                        id="sku_customs_country_of_origin" />

                    <div slot="description">
                        {{ $t('customs_country_of_origin_desc') }}
                    </div>
                </fig-form-group>
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
