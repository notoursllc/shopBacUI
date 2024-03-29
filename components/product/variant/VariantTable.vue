<script>
import isObject from 'lodash.isobject';
import draggable from 'vuedraggable';
import VariantForm from '@/components/product/variant/VariantForm';
import BooleanTag from '@/components/BooleanTag';
import ColorSwatch from '@/components/product/colorSwatch/ColorSwatch';
import product_mixin from '@/mixins/product_mixin';

import {
    FigButton,
    FigModal,
    FigTableSimple,
    FigTh,
    FigTd,
    FigTag,
    FigOperationsDropdown,
    FigMoney,
    FigNuxtImgBunny
} from '@notoursllc/figleaf';

export default {
    name: 'ColorTable',

    components: {
        draggable,
        VariantForm,
        BooleanTag,
        ColorSwatch,
        FigButton,
        FigModal,
        FigTableSimple,
        FigTh,
        FigTd,
        FigTag,
        FigOperationsDropdown,
        FigMoney,
        FigNuxtImgBunny
    },

    mixins: [
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
                ? this.$t('Edit variant: {variant}', {variant: this.variants[this.visibleColorIndex].label})
                : this.$t('Add a new Variant');
        }

        /*
        * This computed property is needed so the array of skus in each variant
        * is reactive, allowing for the display of sizes for each variant
        */
        // variantSizes() {
        //     const allSizes = [];

        //     this.variants.forEach((obj) => {
        //         if(Array.isArray(obj.skus)) {
        //             const skuSizes = [];

        //             obj.skus.forEach((sku) => {
        //                 if(sku.label) {
        //                     skuSizes.push(sku.label);
        //                 }
        //             });

        //             allSizes.push(skuSizes);
        //         }
        //     });

        //     return allSizes;
        // }
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

        async onDeleteClick(index) {
            try {
                const variantToDelete = this.variants[index];

                const confirmed = await this.$showConfirm(
                    this.$t('delete_name?', {name: variantToDelete.label}),
                    'warning'
                );

                if(!confirmed) {
                    return;
                }

                // Only delete the variants that are persisted in the DB (which have an id)
                if(variantToDelete.id) {
                    await this.$api.product.variant.delete(variantToDelete.id);
                }

                this.variants.splice(index, 1);
                this.emitChange();

                if(variantToDelete.id) {
                    this.$figleaf.successToast({
                        title: this.$t('Success'),
                        text: this.$t('Variant deleted successfully')
                    });
                }
            }
            catch(err) {
                this.$figleaf.errorToast({
                    title: this.$t('Error'),
                    text: err.message
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
        },

        getVariantImages(index) {
            return Array.isArray(this.variants[index].images) ? this.variants[index].images.map(obj => obj.url) : [];
        },

        getVariantSwatches(index) {
            const variant = this.variants[index];
            const swatches = [];

            if(Array.isArray(variant.swatches)) {
                variant.swatches.forEach((obj) => {
                    if(obj.swatch) {
                        swatches.push(obj);
                    }
                });
            }

            return swatches;
        },

        getVariantLabels(index) {
            const variant = this.variants[index];
            const sizes = [];

            if(Array.isArray(variant.skus)) {
                variant.skus.forEach((sku) => {
                    if(sku.label) {
                        sizes.push(sku.label);
                    }
                });
            }

            return sizes;
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
                    <fig-th>{{ $t('Label') }}</fig-th>
                    <fig-th>{{ $t('SKU labels') }}</fig-th>
                    <fig-th>{{ $t('Photos') }}</fig-th>
                    <fig-th>{{ $t('Swatch') }}</fig-th>
                    <fig-th sortable prop="published">{{ $t('Published') }}</fig-th>
                    <fig-th class="w-6"></fig-th>
                </tr>
            </template>

            <draggable
                v-model="variants"
                handle=".handle"
                @update="setColorOrdinals"
                ghost-class="ghost"
                tag="tbody">
                <tr v-for="(variant, idx) in variants" :key="idx">
                    <!-- drag handle -->
                    <fig-td v-show="canShowGrabHandles">
                        <fig-icon
                            icon="dots-vertical-double"
                            class="handle cursor-grab" />
                    </fig-td>

                    <!-- Label -->
                    <fig-td>
                        {{ variant.label }}
                    </fig-td>

                    <!-- SKU labels -->
                    <fig-td>
                        <span v-for="(label, labelIndex) in getVariantLabels(idx)" :key="labelIndex">
                            <fig-tag
                                variant="light"
                                class="mr-1 mb-1">{{ label }}</fig-tag>
                        </span>
                    </fig-td>

                    <!-- Photos -->
                    <fig-td>
                        <div class="flex items-center">
                            <div
                                v-for="(id, objIndex) in getVariantImages(idx)"
                                :key="objIndex"
                                class="mr-2">
                                <fig-nuxt-img-bunny
                                    v-if="id"
                                    :src="id"
                                    preset="prodthumbxs"
                                    loading="lazy"
                                    class="shadow variant-thumb"
                                    :class="{'featured-thumb': objIndex === 0}" />
                            </div>
                        </div>
                    </fig-td>

                    <!-- Swatch -->
                    <fig-td>
                        <div class="flex items-center justify-center">
                            <color-swatch
                                :swatches="getVariantSwatches(idx)"
                                :tooltip="true" />
                        </div>
                    </fig-td>

                    <!-- Published -->
                    <fig-td>
                        <boolean-tag :value="variant.published" />
                    </fig-td>

                    <!-- Actions -->
                    <fig-td class="text-center">
                        <fig-operations-dropdown
                            :show-view="false"
                            @edit="showModal(idx)"
                            @delete="onDeleteClick(idx)"
                            class="ml-1" />
                    </fig-td>
                </tr>
            </draggable>
        </fig-table-simple>


        <div class="pt-4">
            <fig-button
                variant="plain"
                size="sm"
                @click="addEmptyColor"
                icon="plus">{{ $t('Add variant') }}</fig-button>
        </div>


        <!-- variant upsert form -->
        <fig-modal
            ref="color_upsert_form_modal"
            size="full">
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
