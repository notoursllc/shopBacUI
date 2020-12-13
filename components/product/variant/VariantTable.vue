<script>
import isObject from 'lodash.isobject';
import draggable from 'vuedraggable';
import PopConfirm from '@/components/PopConfirm';
import VariantForm from '@/components/product/variant/VariantForm';
import storage_mixin from '@/mixins/storage_mixin';
import product_mixin from '@/mixins/product_mixin';

import {
    FigButton,
    FigModal,
    FigTableSimple,
    FigTh,
    FigTd
} from '@notoursllc/figleaf';

export default {
    name: 'ColorTable',

    components: {
        draggable,
        PopConfirm,
        VariantForm,
        FigButton,
        FigModal,
        FigTableSimple,
        FigTh,
        FigTd
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
                ? this.$t('Edit color: _color_', {color: this.variants[this.visibleColorIndex].label})
                : this.$t('Add a new Color');
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
            this.$set(this.variants, this.visibleColorIndex, colorData);
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
                    <fig-th sortable prop="published">{{ $t('Published') }}</fig-th>
                    <fig-th>{{ $t('Color name') }}</fig-th>
                    <fig-th sortable prop="base_price">{{ $t('Price') }}</fig-th>
                    <fig-th>{{ $t('Sizes') }}</fig-th>
                    <fig-th>{{ $t('Images') }}</fig-th>
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

                    <!-- Published -->
                    <fig-td>
                        {{ color.published }}
                    </fig-td>

                    <!-- Color name -->
                    <fig-td>
                        {{ color.label }}
                    </fig-td>

                    <!-- Price -->
                    <fig-td>
                        {{ color.base_price }}
                    </fig-td>

                    <!-- Sizes -->
                    <fig-td>

                    </fig-td>

                    <!-- Images -->
                    <fig-td>
                        <!-- <span
                            v-for="(result, index) in getVariantThumbs(color)"
                            :key="index"
                            class="variant-thumb">
                            <figure
                                :style="`background-image:url(${result.url});`"
                                class="shadow"
                                :class="{'featured-thumb': result.is_featured}"></figure>
                        </span> -->
                    </fig-td>

                    <fig-td class="text-right">
                        <fig-button
                            variant="plain"
                            class="mr-1"
                            @click="showModal(idx)">{{ $t('Edit') }}</fig-button>

                        <pop-confirm @onConfirm="deleteVariant(idx)">
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
