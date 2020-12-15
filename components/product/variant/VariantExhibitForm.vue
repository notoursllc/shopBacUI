<script>
import isObject from 'lodash.isobject';
import cloneDeep from 'lodash.clonedeep';
import ImageManager from '@/components/product/ImageManager';
import storage_mixin from '@/mixins/storage_mixin'; // TODO: not needed?
import draggable from 'vuedraggable';
import PopConfirm from '@/components/PopConfirm';
import ColorSwatchInput from '@/components/product/ColorSwatchInput';

import {
    FigButton,
    FigFormInput,
    FigFormRadio,
    FigOverlay,
    FigTableSimple,
    FigTh,
    FigTd
} from '@notoursllc/figleaf';

export default {
    name: 'VariantExhibitForm',

    components: {
        ImageManager,
        draggable,
        PopConfirm,
        ColorSwatchInput,
        FigButton,
        FigFormInput,
        FigFormRadio,
        FigOverlay,
        FigTableSimple,
        FigTh,
        FigTd
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
            maxSelectedColors: this.$config.COLOR_SWATCH_MAX_SWATCHES || 3,
            loadingImages: false
        };
    },

    computed: {
        numRemainingColors() {
            return this.maxSelectedColors - this.selectedColors.length;
        }
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

        onDeleteColor(index) {
            this.selectedColors.splice(index, 1);
            this.emitInput();
        },

        addColorRow() {
            this.selectedColors.push({
                label: null,
                swatch: '#000000'
            });
            this.emitInput();
        },

        onColorSwatchChange(index, data) {
            this.$set(this.selectedColors[index], 'swatch', data.hex);
            this.$set(this.selectedColors[index], 'label', data.label);
        },

        async onSaveSwatchToPreDefined(index) {
            try {
                const data = this.selectedColors[index];
                const response = await this.$api.productColorSwatches.upsert({
                    hex: data.swatch,
                    label: data.label
                });

                if(!response) {
                    throw new Error(this.$t('Error adding swatch'));
                }

                this.$successToast({
                    title: this.$t('Success'),
                    text: this.$t('Swatch added successfully: {hex}', {hex: data.swatch})
                });
            }
            catch(e) {
                this.$errorToast({
                    title: this.$t('Error'),
                    text: e.message
                });
            }
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

        <!--  image manager -->
        <div>
            <!-- <fig-overlay :show="loadingImages"> -->
            <image-manager
                v-show="exhibitType === 'IMAGE'"
                v-model="selectedImages"
                @delete="onDeleteImage"
                :max-num-images="parseInt(imageManagerMaxImages, 10)" />
        </div>

        <!-- color swatches -->
        <div v-show="exhibitType === 'SWATCH'">
            {{ selectedColors }}
            <fig-table-simple
                striped
                hover
                v-if="selectedColors.length">
                <template slot="head">
                    <tr>
                        <fig-th v-if="selectedColors.length > 1" class="w-14"></fig-th>
                        <fig-th class="swatchCell">{{ $t('Color') }}</fig-th>
                        <fig-th>{{ $t('Label') }}</fig-th>
                        <fig-th class="w-24"></fig-th>
                    </tr>
                </template>

                <draggable
                    v-model="selectedColors"
                    ghost-class="ghost"
                    handle=".handle"
                    tag="tbody">

                    <template v-for="(obj, index) in selectedColors">
                        <tr :key="index">
                            <!-- handle -->
                            <fig-td v-if="selectedColors.length > 1" class="align-middle">
                                <i class="handle">
                                    <fig-icon icon="dots-vertical-double" />
                                </i>
                            </fig-td>

                            <!-- color -->
                            <fig-td>
                                <color-swatch-input
                                    :value="obj.swatch"
                                    @input="(data) => onColorSwatchChange(index, data)" />
                            </fig-td>

                            <!-- label -->
                            <fig-td class="align-middle">
                                <fig-form-input
                                    v-model="obj.label"
                                    class="w-full"
                                    :placeholder="$t('example: Black')" />
                            </fig-td>

                            <!-- actions -->
                            <fig-td class="text-center align-middle">
                                <div class="flex items-center">
                                    <pop-confirm
                                        @onConfirm="onDeleteColor(index)">
                                        {{ $t('Delete this item?') }}

                                        <fig-button
                                            slot="reference"
                                            variant="plain"
                                            dotted
                                            class="ml-2"
                                            icon="trash" />
                                    </pop-confirm>

                                    <pop-confirm
                                        @onConfirm="onSaveSwatchToPreDefined(index)">
                                        {{ $t('Save to your pre-defined color swatches?') }}

                                        <fig-button
                                            v-if="obj.label && obj.swatch"
                                            slot="reference"
                                            variant="plain"
                                            dotted
                                            class="ml-2"
                                            icon="floppy" />
                                    </pop-confirm>
                                </div>
                            </fig-td>
                        </tr>
                    </template>

                </draggable>
            </fig-table-simple>

            <div class="pt-2">
                <fig-button
                    variant="primary"
                    size="sm"
                    @click="addColorRow"
                    icon="plus"
                    :disabled="numRemainingColors <= 0">{{ $t('Add swatch') }}</fig-button>

                <div class="text-muted text-sm pt-2">{{ $t('You can add up to {number} swatches', {number: maxSelectedColors} ) }}</div>
            </div>
        </div>
    </div>
</template>


<style lang="scss">
.handle {
    cursor: grab;
}

.swatchCell {
    width: 125px;
}
</style>
