<script>
import isObject from 'lodash.isobject';
import storage_mixin from '@/mixins/storage_mixin'; // TODO: not needed?
import TextCard from '@/components/TextCard';
import PricingForm from '@/components/product/PricingForm';
import ColorExpressionForm from '@/components/product/color/ColorExpressionForm';
import AccentMessageWizard from '@/components/product/accentMessage/AccentMessageWizard';
import SizeUpsertWizard from '@/components/product/size/SizeUpsertWizard';

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
        ColorExpressionForm,
        AccentMessageWizard,
        SizeUpsertWizard,
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
        color: {
            type: Object,
            default: () => {
                return {};
            }
        }
    },

    data: function() {
        return {
            upsertColor: {
                skus: [
                    { label: null }
                ]
            },
            imageManagerMaxImages: this.$config.SKU_IMAGE_MANAGER_MAX_IMAGES || 6,
            loadingImages: false
        };
    },

    watch: {
        color: {
            handler(newVal) {
                if(isObject(newVal)) {
                    this.upsertColor = Object.assign({}, newVal);
                    return;
                }

                this.upsertColor = {
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
                this.$successToast(this.$t('Image deleted successfully'));
            }
            catch(e) {
                this.$errorToast(e.message);
            }

            this.loadingImages = false;
        },

        onAccentWizardChange(obj) {
            this.$set(this.upsertColor, 'accent_message_id', obj.accent_message_id);
            this.$set(this.upsertColor, 'accent_message_begin', obj.accent_message_begin);
            this.$set(this.upsertColor, 'accent_message_end', obj.accent_message_end);
        },

        onClickDone() {
            this.$emit('done', {
                ...this.upsertColor
            });
        },

        onClickCancel() {
            this.$emit('cancel');
        },

        onPricingFormInput(obj) {
            if(isObject(obj)) {
                for(const key in obj) {
                    this.$set(this.upsertColor, key, obj[key]);
                }
            }
        },

        onColorExpressionFormInput(data) {
            if(isObject(data)) {
                this.$set(this.upsertColor, 'exhibitType', data.exhibitType);
                this.$set(this.upsertColor, 'exhibits', [ ...data.exhibits ]);
            }
        }
    }
};
</script>


<template>
    <div>
        <!-- General info -->
        <text-card class="mb-5">
            <template v-slot:header>{{ $t('Color info') }}</template>

            <!-- published -->
            <div class="container mx-auto">
                <div class="mb-3">
                    <fig-form-checkbox
                        v-model="upsertColor.published">{{ $t('Published') }}</fig-form-checkbox>
                </div>

                <!-- color name -->
                <fig-form-group>
                    <label slot="label" for="color_name">{{ $t('Color name') }}</label>
                    <fig-form-input
                        v-model="upsertColor.label"
                        id="color_name" />
                </fig-form-group>
            </div>
        </text-card>


        <!-- Color expression -->
        <text-card class="mb-5">
            <template v-slot:header>{{ $t('Display color using...') }}</template>

            <div class="container mx-auto">
                <color-expression-form
                    :color-model="upsertColor"
                    @input="onColorExpressionFormInput" />
            </div>
        </text-card>


        <!-- Sizes -->
        <text-card class="mb-5">
            <template v-slot:header>{{ $t('Sizes') }}</template>

            <div class="container mx-auto">
                <size-upsert-wizard
                    v-model="upsertColor.skus" />
            </div>
        </text-card>


        <!-- pricing -->
        <text-card class="mb-5">
            <template v-slot:header>{{ $t('Pricing') }}</template>

            <div class="container mx-auto">
                <pricing-form
                    :data="upsertColor"
                    @input="onPricingFormInput" />
            </div>
        </text-card>


        <!-- accent message -->
        <text-card class="mb-5">
            <template v-slot:header>{{ $t('Accent Message') }}</template>
            <template v-slot:headerSub>{{ $t('accent_message_description') }}</template>

            <div class="container mx-auto">
                <accent-message-wizard
                    :model="upsertColor"
                    @input="onAccentWizardChange" />
            </div>
        </text-card>


        <!-- shipping -->
        <text-card class="mb-5">
            <template v-slot:header>{{ $t('Shipping') }}</template>

            <div class="container mx-auto">
                <!-- requires shipping -->
                <div class="mb-3">
                    <fig-form-checkbox
                        v-model="upsertColor.requires_shipping">{{ $t('This is a physical product') }}</fig-form-checkbox>
                </div>

                <template v-if="!upsertColor.requires_shipping">
                    {{ $t('requires_shipping_off_desc') }}
                </template>
                <template v-else>
                    <hr />

                    <div class="flex">
                        <fig-form-group v-if="upsertColor.requires_shipping">
                            <label slot="label" for="sku_weight_oz">{{ $t('Weight (oz)') }}</label>
                            <fig-form-input-number
                                v-model="upsertColor.weight_oz"
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

                    <div class="flex flex-wrap -mx-2 overflow-hidden">
                        <!-- country of origin -->
                        <div class="my-2 px-2 w-full overflow-hidden xl:w-1/2">
                            <fig-form-group>
                                <label slot="label" for="sku_customs_country_of_origin">{{ $t('Country of origin') }}</label>
                                <fig-form-select-country
                                    v-model="upsertColor.customs_country_of_origin"
                                    id="sku_customs_country_of_origin" />

                                <div slot="description">
                                    {{ $t('customs_country_of_origin_desc') }}
                                </div>
                            </fig-form-group>
                        </div>

                        <!-- HS code -->
                        <div class="my-2 px-2 w-full overflow-hidden xl:w-1/2">
                            <fig-form-group>
                                <label slot="label" for="sku_customs_harmonized_system_code">{{ $t('HS (Harmonized System) code') }}</label>
                                <fig-form-input
                                    v-model="upsertColor.customs_harmonized_system_code"
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


        <div class="tac">
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
