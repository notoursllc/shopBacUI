<script>
import isObject from 'lodash.isobject';
import cloneDeep from 'lodash.clonedeep';
import ImageManager from '@/components/product/ImageManager';
import AppOverlay from '@/components/AppOverlay';
import storage_mixin from '@/mixins/storage_mixin'; // TODO: not needed?
import draggable from 'vuedraggable';
import PopConfirm from '@/components/PopConfirm';

import {
    FigButton
} from '@notoursllc/figleaf';

export default {
    name: 'ColorExpressionForm',

    components: {
        ImageManager,
        AppOverlay,
        draggable,
        PopConfirm,
        FigButton
    },

    mixins: [
        storage_mixin
    ],

    props: {
        colorModel: {
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
        colorModel: {
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
                this.$successToast(this.$t('Image deleted successfully'));
                this.emitInput();
            }
            catch(e) {
                this.$errorToast(e.message);
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
        }
    }
};
</script>


<template>
    <div>
        <b-form-group>
            <div class="d-inline-block mr-3">
                <b-form-radio
                    v-model="exhibitType"
                    @input="emitInput"
                    name="exhibitType"
                    value="IMAGE">{{ $t('Images') }}</b-form-radio>
            </div>

            <div class="d-inline-block">
                <b-form-radio
                    v-model="exhibitType"
                    @input="emitInput"
                    name="exhibitType"
                    value="SWATCH">{{ $t('Color swatches') }}</b-form-radio>
            </div>
        </b-form-group>

        <!--  image manager -->
        <div>
            <app-overlay :show="loadingImages">
                <image-manager
                    v-show="exhibitType === 'IMAGE'"
                    v-model="selectedImages"
                    @delete="onDeleteImage"
                    :max-num-images="parseInt(imageManagerMaxImages, 10)" />
            </app-overlay>
        </div>

        <!-- color swatches -->
        <div v-show="exhibitType === 'SWATCH'">
            <b-table-simple
                hover
                small
                responsive
                table-class="bread-table"
                v-if="selectedColors.length">
                <b-thead>
                    <b-tr>
                        <b-th v-if="selectedColors.length > 1" class="width50"></b-th>
                        <b-th class="swatchCell">{{ $t('Color') }}</b-th>
                        <b-th>{{ $t('Label') }}</b-th>
                        <b-th class="width100"></b-th>
                    </b-tr>
                </b-thead>

                <draggable
                    v-model="selectedColors"
                    ghost-class="ghost"
                    handle=".handle"
                    tag="b-tbody">

                    <template v-for="(obj, index) in selectedColors">
                        <b-tr :key="index">
                            <!-- handle -->
                            <b-td v-if="selectedColors.length > 1" class="vam">
                                <i class="handle">
                                    <fig-icon icon="dots-vertical-double" />
                                </i>
                            </b-td>

                            <!-- color -->
                            <b-td>
                                <b-form-input
                                    type="color"
                                    v-model="obj.swatch" />
                            </b-td>

                            <!-- label -->
                            <b-td class="vam">
                                <b-form-input
                                    v-model="obj.label"
                                    class="widthAll"
                                    :placeholder="$t('example: Black')" />
                            </b-td>

                            <!-- actions -->
                            <b-td class="text-center vam">
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
                            </b-td>
                        </b-tr>
                    </template>

                </draggable>
            </b-table-simple>

            <div class="pt-2">
                <fig-button
                    variant="primary"
                    size="sm"
                    @click="addColorRow"
                    icon="plus"
                    :disabled="numRemainingColors <= 0">{{ $t('Add swatch') }}</fig-button>

                <div class="text-muted fs14 pt-2">{{ $t('You can add up to {number} swatches', {number: maxSelectedColors} ) }}</div>
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
