<script>
import isObject from 'lodash.isobject';
import cloneDeep from 'lodash.clonedeep';
import ImageManager from '@/components/product/ImageManager';
import storage_mixin from '@/mixins/storage_mixin'; // TODO: not needed?
import ColorSwatchTable from '@/components/product/colorSwatch/ColorSwatchTable';
import { FigFormRadio } from '@notoursllc/figleaf';

export default {
    name: 'VariantExhibitForm',

    components: {
        ImageManager,
        ColorSwatchTable,
        FigFormRadio
    },

    mixins: [
        storage_mixin
    ],

    props: {
        variant: {
            type: Object,
            default: () => {
                return {};
            }
        }
    },

    data: function() {
        return {
            exhibitType: 'IMAGE',
            selectedImages: [],
            selectedColors: [],
            imageManagerMaxImages: this.$config.SKU_IMAGE_MANAGER_MAX_IMAGES || 6,
            loadingImages: false
        };
    },

    watch: {
        variant: {
            handler(newVal) {
                if(isObject(newVal)) {
                    this.exhibitType = newVal.exhibitType;

                    const exhibits = Array.isArray(newVal.exhibits) ? cloneDeep(newVal.exhibits) : [];
                    this.selectedImages = newVal.exhibitType === 'IMAGE' ? exhibits : [];
                    this.selectedColors = newVal.exhibitType === 'SWATCH' ? exhibits : [];
                }
                else {
                    this.exhibitType = 'IMAGE';
                    this.selectedImages = [];
                    this.selectedColors = [];
                }
            },
            immediate: true
        },

        selectedColors: {
            handler(newVal) {
                this.emitInput();
            },
            deep: true
        },

        selectedImages: {
            handler(newVal) {
                this.emitInput();
            },
            deep: true
        }
    },

    methods: {
        emitInput() {
            const data = {
                exhibitType: this.exhibitType,
                exhibits: this.exhibitType === 'IMAGE' ? [ ...this.selectedImages ] : [ ...this.selectedColors ]
            };

            this.$emit('input', data);
        },

        async onDeleteImage(id) {
            try {
                this.loadingImages = true;
                await this.$api.productSkus.deleteImage(id); //TODO

                this.$successToast({
                    title: this.$t('Success'),
                    text: this.$t('Image deleted successfully')
                });

                this.emitInput();
            }
            catch(e) {
                this.$errorToast({
                    title: this.$t('Error'),
                    text: e.message
                });
            }

            this.loadingImages = false;
        },

        onColorSwatchChange(data) {
            this.selectedColors = data;
        }
    }
};
</script>


<template>
    <div>
        <div class="mb-5">
            <div class="inline mr-3">
                <fig-form-radio
                    v-model="exhibitType"
                    @input="emitInput"
                    name="exhibitType"
                    checked-value="IMAGE">{{ $t('Images') }}</fig-form-radio>
            </div>

            <div class="inline">
                <fig-form-radio
                    v-model="exhibitType"
                    @input="emitInput"
                    name="exhibitType"
                    checked-value="SWATCH">{{ $t('Color swatches') }}</fig-form-radio>
            </div>
        </div>

        <div>
            <image-manager
                v-show="exhibitType === 'IMAGE'"
                v-model="selectedImages"
                @delete="onDeleteImage"
                :max-num-images="parseInt(imageManagerMaxImages, 10)" />
        </div>

        <!-- color swatches -->
        <div v-show="exhibitType === 'SWATCH'">
            <color-swatch-table
                :value="selectedColors"
                @input="onColorSwatchChange" />
        </div>
    </div>
</template>
