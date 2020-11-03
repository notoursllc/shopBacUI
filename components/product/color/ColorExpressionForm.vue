<script>
import isObject from 'lodash.isobject';
import ImageManager from '@/components/product/ImageManager';
import AppOverlay from '@/components/AppOverlay';
import storage_mixin from '@/mixins/storage_mixin'; // TODO: not needed?
import draggable from 'vuedraggable';
import PopConfirm from '@/components/PopConfirm';


export default {
    name: 'ColorExpressionForm',

    components: {
        ImageManager,
        AppOverlay,
        draggable,
        PopConfirm
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
            selectedColors: [],
            form: {
                expressAs: 'IMAGE',
                images: []
            },
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
                this.form = isObject(newVal) ? Object.assign({}, newVal) : {};

                if(!Array.isArray(this.form.images)) {
                    this.form.images = [];
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

        setSelectedColorOrdinals() {
            this.selectedColors.forEach((obj, index) => {
                obj.ordinal = index;
            });
        },

        onDeleteColor(index) {
            this.selectedColors.splice(index, 1);

            if(this.selectedColors.length) {
                this.setSelectedColorOrdinals();
            }
        },

        addColorRow() {
            this.selectedColors.push({
                ordinal: this.selectedColors.length,
                label: null,
                swatch: '#000000'
            });
        }
    }
};
</script>


<template>
    <div>
        <b-form-group>
            <div class="d-inline-block mr-3">
                <b-form-radio
                    v-model="form.expressAs"
                    name="expressAs"
                    value="IMAGE">{{ $t('Images') }}</b-form-radio>
            </div>

            <div class="d-inline-block">
                <b-form-radio
                    v-model="form.expressAs"
                    name="expressAs"
                    value="SWATCH">{{ $t('Color swatches') }}</b-form-radio>
            </div>
        </b-form-group>

        <!--  image manager -->
        <div>
            <app-overlay :show="loadingImages">
                <image-manager
                    v-show="form.expressAs === 'IMAGE'"
                    v-model="form.images"
                    @delete="onDeleteImage"
                    :max-num-images="parseInt(imageManagerMaxImages, 10)" />
            </app-overlay>

            <!-- <color-swatch-form
                v-show="form.expressAs === 'SWATCH'"
                :color-model="selectedColors"
                :max-num-swatches="parseInt(maxSelectedColors, 10)"
                @input="(swatches) => { $set(form, 'swatches', swatches) }" /> -->
        </div>

        <!-- color swatches -->
        <div v-show="form.expressAs === 'SWATCH'">
            <b-table-simple
                hover
                small
                responsive
                table-class="bread-table"
                v-if="selectedColors.length">
                <b-thead>
                    <b-tr>
                        <b-th v-if="maxSelectedColors.length > 1" class="width50"></b-th>
                        <b-th class="swatchCell">{{ $t('Color') }}</b-th>
                        <b-th>{{ $t('Label') }}</b-th>
                        <b-th class="width100"></b-th>
                    </b-tr>
                </b-thead>

                <draggable
                    v-model="selectedColors"
                    ghost-class="ghost"
                    handle=".handle"
                    @update="setSelectedColorOrdinals"
                    tag="b-tbody">

                    <template v-for="(obj, index) in selectedColors">
                        <b-tr :key="index">
                            <!-- handle -->
                            <b-td v-if="maxSelectedColors.length > 1" class="vam">
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

                                    <b-button
                                        slot="reference"
                                        variant="outline-secondary"
                                        class="mls border-dashed-2">
                                        <fig-icon icon="trash" stroke-width="1px" width="18" height="18" />
                                    </b-button>
                                </pop-confirm>
                            </b-td>
                        </b-tr>
                    </template>

                </draggable>
            </b-table-simple>

            <div class="pt-2">
                <b-button
                    variant="primary"
                    size="sm"
                    @click="addColorRow"
                    :disabled="numRemainingColors <= 0">
                    <fig-icon icon="plus" /> {{ $t('Add Color') }}
                </b-button>

                <div class="text-muted fs14 pt-2">{{ $t('You can add up to num colors', {number: maxSelectedColors} ) }}</div>
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
