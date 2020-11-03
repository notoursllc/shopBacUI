<script>
import isObject from 'lodash.isobject';
import storage_mixin from '@/mixins/storage_mixin'; // TODO: not needed?
import InputMoney from '@/components/InputMoney';
import TextCard from '@/components/TextCard';
import CountrySelect from '@/components/CountrySelect';
import ImageManager from '@/components/product/ImageManager';
import PricingForm from '@/components/product/PricingForm';
import ColorExpressionForm from '@/components/product/color/ColorExpressionForm';
import SizeChooserForm from '@/components/product/size/SizeChooserForm';
import AccentMessageWizard from '@/components/product/accentMessage/AccentMessageWizard';
import DataTableWizard from '@/components/product/dataTable/DataTableWizard';
import NumberInput from '@/components/NumberInput';
import AppOverlay from '@/components/AppOverlay';


export default {
    name: 'ColorUpsertForm',

    components: {
        InputMoney,
        TextCard,
        CountrySelect,
        ImageManager,
        PricingForm,
        ColorExpressionForm,
        SizeChooserForm,
        AccentMessageWizard,
        DataTableWizard,
        NumberInput,
        AppOverlay
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
            // required: true
        }
    },

    data: function() {
        return {
            model: {},
            imageManagerMaxImages: this.$config.SKU_IMAGE_MANAGER_MAX_IMAGES || 6,
            loadingImages: false,
            skuVariantTypes: []
        };
    },

    computed: {
    },

    watch: {
        value: {
            handler(newVal) {
                this.model = isObject(newVal) ? Object.assign({}, newVal) : {};

                if(!Array.isArray(this.model.images)) {
                    this.model.images = [];
                }
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

        // onDataTableWizardChange(obj) {
        //     // console.log("ON DT WIZARD CHANGE", obj);
        //     this.sku.data_table = obj.data_table;
        //     this.sku.data_table_name = obj.data_table_name;
        // },

        onAccentWizardChange(obj) {
            // console.log("ON ACCENT WIZARD CHAGGE", obj)
            this.model.accent_message_id = obj.accent_message_id;
            this.model.accent_message_begin = obj.accent_message_begin;
            this.model.accent_message_end = obj.accent_message_end;
        },



        onClickDone() {
            // this.$emit('input', {
            //     ...this.value
            // });

            // this.$emit('done');
        },

        onClickCancel() {
            this.$emit('done');
        },

        onPricingFormInput(obj) {
            if(isObject(obj)) {
                for(const key in obj) {
                    this.$set(this.model, key, obj[key]);
                }
            }
        }
    }
};
</script>


<template>
    <div>

        <!-- general info -->
        <text-card class="mbxl">
            <template v-slot:header>{{ $t('General Info') }}</template>

            <b-container>
                <!-- published -->
                <b-form-group
                    label-for="color_published">
                    <b-form-checkbox
                        v-model="model.published"
                        id="color_published">{{ $t('Published') }}</b-form-checkbox>
                </b-form-group>

                <!-- color name -->
                <b-form-group
                    :label="$t('Color Name')"
                    label-for="color_name">
                    <b-form-input
                        v-model="model.label"
                        id="color_name" />
                </b-form-group>
            </b-container>
        </text-card>


        <!-- Color expression -->
        <text-card class="mbxl">
            <template v-slot:header>{{ $t('Display color using...') }}</template>

            <b-container>
                <color-expression-form :color-model="model" />
            </b-container>
        </text-card>


        <!-- Sizes -->
        <text-card class="mbxl">
            <template v-slot:header>{{ $t('Sizes') }}</template>

            <b-container>
                <size-chooser-form />
                <!-- <color-expression-form :color-model="model" /> -->
            </b-container>
        </text-card>


        <!-- pricing -->
        <text-card class="mbxl">
            <template v-slot:header>{{ $t('Pricing') }}</template>

            <b-container>
                <pricing-form
                    :data="model"
                    @input="onPricingFormInput" />
            </b-container>
        </text-card>

        <!-- Images -->
        <!-- <text-card class="mbxl">
            <template v-slot:header>{{ $t('Images') }}</template>
            <template v-slot:headerSub>{{ $t('You can add up to num images', {number: imageManagerMaxImages}) }}</template>

            <b-container>
                <app-overlay :show="loadingImages">
                    <image-manager
                        v-model="model.images"
                        @delete="onDeleteImage"
                        :max-num-images="parseInt(imageManagerMaxImages, 10)" />
                </app-overlay>
            </b-container>
        </text-card> -->


        <!-- accent message -->
        <text-card class="mbxl">
            <template v-slot:header>{{ $t('Accent Message') }}</template>
            <template v-slot:headerSub>{{ $t('accent_message_description') }}</template>

            <b-container>
                <accent-message-wizard
                    :model="model"
                    @input="onAccentWizardChange" />
            </b-container>
        </text-card>


        <!-- data table -->
        <!-- <text-card class="mbxl">
            <template v-slot:header>{{ $t('Data table') }}</template>
            <template v-slot:headerSub>{{ $t('data_table_subheader') }}</template>

            <b-container>
                <data-table-wizard
                    :sku="sku"
                    @input="onDataTableWizardChange" />
            </b-container>
        </text-card> -->


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
@import "~assets/css/components/_formRow.scss";

.input-number {
    width: 150px;
}
</style>
