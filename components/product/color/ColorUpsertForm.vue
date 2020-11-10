<script>
import isObject from 'lodash.isobject';
import storage_mixin from '@/mixins/storage_mixin'; // TODO: not needed?
import TextCard from '@/components/TextCard';
import PricingForm from '@/components/product/PricingForm';
import ColorExpressionForm from '@/components/product/color/ColorExpressionForm';
import AccentMessageWizard from '@/components/product/accentMessage/AccentMessageWizard';
import SizeUpsertTable from '@/components/product/size/SizeUpsertTable';
import NumberInput from '@/components/NumberInput';
import CountrySelect from '@/components/CountrySelect';


export default {
    name: 'ColorUpsertForm',

    components: {
        TextCard,
        PricingForm,
        ColorExpressionForm,
        AccentMessageWizard,
        SizeUpsertTable,
        NumberInput,
        CountrySelect
    },

    mixins: [
        storage_mixin
    ],

    props: {
        id: {
            type: String,
            default: null
        }
    },

    data: function() {
        return {
            color: {
                sizes: [
                    { label: null }
                ]
            },
            imageManagerMaxImages: this.$config.SKU_IMAGE_MANAGER_MAX_IMAGES || 6,
            loadingImages: false,
            skuVariantTypes: []
        };
    },

    computed: {
    },

    watch: {
        id: {
            handler(newVal) {
                if(newVal) {
                    this.color = {}; // TODO: fetch color data
                    return;
                }

                this.color = {
                    sizes: [
                        { label: null }
                    ]
                };
            },
            immediate: true
        }
    },

    created() {

    },

    methods: {
        async onDeleteImage(id) {
            try {
                this.loadingImages = true;
                await this.$api.productSkus.deleteImage(id); //TODO
                this.$successToast(this.$t('Image deleted successfully'));
            }
            catch(e) {
                this.$errorToast(e.message);
            }

            this.loadingImages = false;
        },

        onAccentWizardChange(obj) {
            // console.log("ON ACCENT WIZARD CHAGGE", obj)
            this.color.accent_message_id = obj.accent_message_id;
            this.color.accent_message_begin = obj.accent_message_begin;
            this.color.accent_message_end = obj.accent_message_end;
        },

        onClickDone() {
            this.$emit('done', {
                ...this.color
            });
        },

        onClickCancel() {
            this.$emit('cancel');
        },

        onPricingFormInput(obj) {
            if(isObject(obj)) {
                for(const key in obj) {
                    this.$set(this.color, key, obj[key]);
                }
            }
        }
    }
};
</script>


<template>
    <div>

        color: {{ color }}

        <!-- Color expression -->
        <text-card class="mb-3">
            <template v-slot:header>{{ $t('Display color using...') }}</template>
            <color-expression-form
                :color-model="color" />
        </text-card>


        <!-- Sizes -->
        <text-card class="mb-3">
            <template v-slot:header>{{ $t('Sizes') }}</template>
            <size-upsert-table
                v-model="color.sizes" />
        </text-card>


        <!-- pricing -->
        <text-card class="mb-3">
            <template v-slot:header>{{ $t('Pricing') }}</template>
            <pricing-form
                :data="color"
                @input="onPricingFormInput" />
        </text-card>


        <!-- accent message -->
        <text-card class="mbxl">
            <template v-slot:header>{{ $t('Accent Message') }}</template>
            <template v-slot:headerSub>{{ $t('accent_message_description') }}</template>
            <accent-message-wizard
                :model="color"
                @input="onAccentWizardChange" />
        </text-card>


        <!-- shipping -->
        <text-card class="mbxl">
            <div slot="header">{{ $t('Shipping') }}</div>

            <!-- requires shipping -->
            <b-form-group>
                <b-form-checkbox
                    v-model="color.requires_shipping">{{ $t('This is a physical product') }}</b-form-checkbox>
            </b-form-group>

            <template v-if="!color.requires_shipping">
                {{ $t('requires_shipping_off_desc') }}
            </template>
            <template v-else>
                <hr />

                <b-row>
                    <b-col lg="12">
                        <template v-if="color.requires_shipping">
                            <b-form-group
                                :label="$t('Weight (oz)')"
                                label-for="sku_weight_oz"
                                :description="$t('Used to calculate shipping rates at checkout and label prices during fulfillment.')">
                                <number-input
                                    v-model="color.weight_oz"
                                    :step=".01"
                                    :min="0"
                                    class="input-number"
                                    id="sku_weight_oz" />
                            </b-form-group>
                        </template>

                    </b-col>
                </b-row>

                <hr />

                <h4>{{ $t('CUSTOMS INFORMATION') }}</h4>

                <b-row>
                    <b-col sm="12" lg="6">
                        <!-- country of origin -->
                        <b-form-group
                            :label="$t('Country of origin')"
                            label-for="sku_customs_country_of_origin"
                            :description="$t('customs_country_of_origin_desc')">
                            <country-select
                                v-model="color.customs_country_of_origin"
                                id="sku_customs_country_of_origin" />
                        </b-form-group>
                    </b-col>

                    <b-col sm="12" lg="6">
                        <!-- HS code -->
                        <b-form-group
                            :label="$t('HS (Harmonized System) code')"
                            label-for="sku_customs_harmonized_system_code"
                            :description="$t('customs_hs_code_desc')">
                            <b-form-input
                                v-model="color.customs_harmonized_system_code"
                                id="sku_customs_harmonized_system_code" />
                        </b-form-group>
                    </b-col>
                </b-row>
            </template>
        </text-card>


        <div class="tac">
            <b-button
                variant="primary"
                @click="onClickDone">{{ $t('Done') }}</b-button>

            <b-button
                variant="light"
                @click="onClickCancel"
                class="ml-3">{{ $t('Cancel') }}</b-button>
        </div>
    </div>
</template>


<style lang="scss">

</style>
