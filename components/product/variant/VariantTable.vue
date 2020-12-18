<script>
import isObject from 'lodash.isobject';
import draggable from 'vuedraggable';
import PopConfirm from '@/components/PopConfirm';
import VariantForm from '@/components/product/variant/VariantForm';
import BooleanTag from '@/components/BooleanTag';
import ColorSwatch from '@/components/product/colorSwatch/ColorSwatch';
import Money from '@/components/Money';
import storage_mixin from '@/mixins/storage_mixin';
import product_mixin from '@/mixins/product_mixin';

import {
    FigButton,
    FigModal,
    FigTableSimple,
    FigTh,
    FigTd,
    FigBadge
} from '@notoursllc/figleaf';

export default {
    name: 'ColorTable',

    components: {
        draggable,
        PopConfirm,
        VariantForm,
        BooleanTag,
        ColorSwatch,
        Money,
        FigButton,
        FigModal,
        FigTableSimple,
        FigTh,
        FigTd,
        FigBadge
    },

    mixins: [
        storage_mixin,
        product_mixin
    ],

    props: {
        value: {
            type: Array,
            default: function() {
                return [];
            }
        }
    },

    data: function() {
        return {
            variants: [],
            visibleColorIndex: null
        };
    },

    computed: {
        canShowGrabHandles() {
            return Array.isArray(this.variants) && this.variants.length > 1;
        },

        modalTitle() {
            return isObject(this.variants[this.visibleColorIndex]) && this.variants[this.visibleColorIndex].label
                ? this.$t('Edit color: {color}', {color: this.variants[this.visibleColorIndex].label})
                : this.$t('Add a new Color');
        },

        /*
        * This computed property is needed so the array of skus in each variant
        * is reactive, allowing for the display of sizes for each variant
        */
        variantSizes() {
            const allSizes = [];

            this.variants.forEach((obj) => {
                if(Array.isArray(obj.skus)) {
                    const skuSizes = [];

                    obj.skus.forEach((sku) => {
                        if(sku.label) {
                            skuSizes.push(sku.label);
                        }
                    });

                    allSizes.push(skuSizes);
                }
            });

            return allSizes;
        },

        variantColors() {
            const all = [];

            this.variants.forEach((obj) => {
                if(Array.isArray(obj.exhibits)) {
                    const swatches = [];

                    obj.exhibits.forEach((obj) => {
                        if(obj.swatch) {
                            swatches.push(obj);
                        }
                    });

                    all.push(swatches);
                }
            });

            return all;
        },

        variantImages() {
            const all = [];

            this.variants.forEach((obj) => {
                if(Array.isArray(obj.exhibits)) {
                    const images = [];

                    obj.exhibits.forEach((obj) => {
                        if(obj.media) {
                            images.push({
                                url: obj.media.url,
                                alt_text: obj.alt_text
                            });
                        }
                    });

                    all.push(images);
                }
            });

            return all;
        }
    },

    watch: {
        value: {
            handler: function(newVal) {
                this.variants = newVal || [];
            },
            immediate: true
        }
    },

    methods: {
        showModal(index) {
            this.visibleColorIndex = index;
            this.$refs.color_upsert_form_modal.show();
        },

        hideModal() {
            this.$refs.color_upsert_form_modal.hide();
        },

        addEmptyColor() {
            this.showModal(null);
        },

        setColorOrdinals() {
            this.variants.forEach((obj, index) => {
                obj.ordinal = index;
            });
            this.emitChange();
        },

        async deleteVariant(index) {
            try {
                const variant = this.variants[index];

                // Only delete the variants that are persisted in the DB (which have an id)
                if(variant.id) {
                    await this.$api.products.variants.delete(variant.id);
                }

                this.variants.splice(index, 1);
                this.emitChange();

                if(variant.id) {
                    this.$successToast({
                        title: this.$t('Success'),
                        text: this.$t('Color deleted successfully')
                    });
                }
            }
            catch(e) {
                this.$errorToast({
                    title: this.$t('Error'),
                    text: e.message
                });
            }
        },

        onUpsertDone(colorData) {
            const variantsIndex = this.visibleColorIndex === null ? this.variants.length : this.visibleColorIndex;
            this.$set(this.variants, variantsIndex, colorData);
            this.emitChange();
            this.hideModal();
        },

        onUpsertCancel() {
            this.visibleColorIndex = null;
            this.hideModal();
        },

        emitChange() {
            this.$emit('change', [
                ...this.variants
            ]);
        }
    }
};
</script>


<template>
    <div>
        <fig-table-simple
            striped
            hover
            v-if="variants.length">
            <template slot="head">
                <tr>
                    <fig-th v-if="canShowGrabHandles" class="w-12"></fig-th>
                    <fig-th>{{ $t('Color name') }}</fig-th>
                    <fig-th sortable prop="base_price">{{ $t('Price') }}</fig-th>
                    <fig-th>{{ $t('Sizes') }}</fig-th>
                    <fig-th>{{ $t('Images / Colors') }}</fig-th>
                    <fig-th sortable prop="published">{{ $t('Published') }}</fig-th>
                    <fig-th></fig-th>
                </tr>
            </template>

            <draggable
                v-model="variants"
                handle=".handle"
                @update="setColorOrdinals"
                ghost-class="ghost"
                tag="tbody">
                <tr v-for="(color, idx) in variants" :key="idx">
                    <!-- drag handle -->
                    <fig-td v-show="canShowGrabHandles">
                        <fig-icon
                            icon="dots-vertical-double"
                            class="handle cursor-grab" />
                    </fig-td>

                    <!-- Color name -->
                    <fig-td>
                        {{ color.label }}
                    </fig-td>

                    <!-- Price -->
                    <fig-td>
                        <money :cents="color.base_price" />
                    </fig-td>

                    <!-- Sizes -->
                    <fig-td>
                        <span v-for="(label, labelIndex) in variantSizes[idx]" :key="labelIndex">
                            <fig-badge
                                variant="light"
                                class="mr-1 mb-1">{{ label }}</fig-badge>
                        </span>
                    </fig-td>

                    <!-- Images / color swatches -->
                    <fig-td>
                        <div class="flex items-center">
                            <!-- swatches -->
                            <div
                                v-for="(obj, objIndex) in variantColors[idx]"
                                :key="objIndex"
                                class="mr-2">
                                <color-swatch
                                    :hex="obj.swatch"
                                    :label="obj.label"
                                    size="md"
                                    class="align-bottom"
                                    tooltip />
                            </div>

                            <!-- images -->
                            <div
                                v-for="(obj, objIndex) in variantImages[idx]"
                                :key="objIndex"
                                class="mr-2">
                                <figure
                                    :style="`background-image:url(${obj.url});`"
                                    class="shadow variant-thumb"
                                    :class="{'featured-thumb': objIndex === 0}"></figure>
                            </div>
                        </div>
                    </fig-td>

                    <!-- Published -->
                    <fig-td>
                        <boolean-tag :value="color.published" />
                    </fig-td>

                    <fig-td class="text-right">
                        <fig-button
                            variant="plain"
                            class="mr-1"
                            @click="showModal(idx)">{{ $t('Edit') }}</fig-button>

                        <pop-confirm @onConfirm="deleteVariant(idx)" class="align-bottom">
                            {{ $t('Delete this row?') }}

                            <fig-button
                                slot="reference"
                                variant="plain"
                                dotted
                                icon="trash" />
                        </pop-confirm>
                    </fig-td>
                </tr>
            </draggable>
        </fig-table-simple>


        <div class="pt-4">
            <fig-button
                variant="primary"
                size="sm"
                @click="addEmptyColor"
                icon="plus">{{ $t('Add Color') }}</fig-button>
        </div>


        <!-- color upsert form -->
        <fig-modal
            ref="color_upsert_form_modal"
            size="xl">
            <div slot="header">{{ modalTitle }}</div>

            <variant-form
                :value="variants[visibleColorIndex]"
                @done="onUpsertDone"
                @cancel="onUpsertCancel" />
        </fig-modal>

    </div>
</template>


<style scoped>
.variant-thumb {
    width: 40px;
    height: 40px;
    @apply bg-cover bg-no-repeat;
}
</style>