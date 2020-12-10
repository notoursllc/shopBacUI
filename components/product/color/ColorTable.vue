<script>
import isObject from 'lodash.isobject';
import draggable from 'vuedraggable';
import PopConfirm from '@/components/PopConfirm';
import ColorUpsertForm from '@/components/product/color/ColorUpsertForm';
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
        ColorUpsertForm,
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
        colors: {
            type: Array,
            default: function() {
                return [];
            }
        }
    },

    data: function() {
        return {
            colorList: [],
            visibleColorIndex: null
        };
    },

    computed: {
        canShowGrabHandles() {
            return Array.isArray(this.colorList) && this.colorList.length > 1;
        },

        modalTitle() {
            return isObject(this.colorList[this.visibleColorIndex]) && this.colorList[this.visibleColorIndex].label
                ? this.$t('Edit color: _color_', {color: this.colorList[this.visibleColorIndex].label})
                : this.$t('Add a new Color');
        }
    },

    watch: {
        colors: {
            handler: function(newVal) {
                this.colorList = newVal || [];
            },
            immediate: true
        }
    },

    methods: {
        showColorUpsertModal(index) {
            this.visibleColorIndex = index;
            this.$refs.color_upsert_form_modal.show();
        },

        hideColorUpsertModal() {
            this.$refs.color_upsert_form_modal.hide();
        },

        addEmptyColor() {
            this.colorList.push({
                published: true,
                label: null,
                ordinal: this.colorList.length
            });

            this.showColorUpsertModal(this.colorList.length - 1);
        },

        setColorOrdinals() {
            this.colorList.forEach((obj, index) => {
                obj.ordinal = index;
            });
            this.emitChange();
        },

        async deleteColor(index) {
            try {
                const color = this.colorList[index];

                // Only delete the skus that are persisted in the DB (which have an id)
                if(color.id) {
                    await this.$api.productColors.delete(color.id); // TODO
                }

                this.colorList.splice(index, 1);
                this.emitChange();

                if(color.id) {
                    this.$successToast(this.$t('Color deleted successfully'));
                }
            }
            catch(e) {
                this.$errorToast(e.message);
            }
        },

        onColorUpsertDone(colorData) {
            this.$set(this.colorList, this.visibleColorIndex, colorData);
            this.emitChange();
            this.hideColorUpsertModal();
        },

        onColorUpsertCancel() {
            this.hideColorUpsertModal();
        },

        onEditBtnClick(index) {
            this.showColorUpsertModal(index);
        },

        emitChange() {
            this.$emit('change', [
                ...this.colorList
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
            v-if="colorList.length">
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
                v-model="colorList"
                handle=".handle"
                @update="setColorOrdinals"
                ghost-class="ghost"
                tag="tbody">
                <tr v-for="(color, idx) in colorList" :key="idx">
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
                            @click="onEditBtnClick(idx)">{{ $t('Edit') }}</fig-button>

                        <pop-confirm @onConfirm="deleteColor(idx)">
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

            <color-upsert-form
                :color="colorList[visibleColorIndex]"
                @done="onColorUpsertDone"
                @cancel="onColorUpsertCancel" />
        </fig-modal>

    </div>
</template>
