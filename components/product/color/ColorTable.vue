<script>
import isObject from 'lodash.isobject';
import draggable from 'vuedraggable';
import PopConfirm from '@/components/PopConfirm';
import ColorUpsertForm from '@/components/product/color/ColorUpsertForm';
import storage_mixin from '@/mixins/storage_mixin';
import product_mixin from '@/mixins/product_mixin';


export default {
    name: 'ColorTable',

    components: {
        draggable,
        PopConfirm,
        ColorUpsertForm
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
            this.$bvModal.show('color_upsert_form_modal');
        },

        hideColorUpsertModal() {
            this.$bvModal.hide('color_upsert_form_modal');
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
    <div style="overflow-x:auto;">
        <b-table-simple
            hover
            small
            responsive
            table-class="bread-table"
            v-if="colorList.length">
            <b-thead>
                <b-tr>
                    <b-th v-if="canShowGrabHandles" class="vabtm width50"></b-th>
                    <b-th class="width50">{{ $t('Published') }}</b-th>
                    <b-th>{{ $t('Color name') }}</b-th>
                    <b-th>{{ $t('Price') }}</b-th>
                    <b-th>{{ $t('Sizes') }}</b-th>
                    <b-th>{{ $t('Images') }}</b-th>
                    <b-th></b-th>
                </b-tr>
            </b-thead>

            <draggable
                v-model="colorList"
                handle=".handle"
                @update="setColorOrdinals"
                ghost-class="ghost"
                tag="b-tbody">
                <b-tr v-for="(color, idx) in colorList" :key="idx">
                    <!-- drag handle -->
                    <b-td v-show="canShowGrabHandles">
                        <fig-icon
                            icon="dots-vertical-double"
                            class="handle cursorGrab" />
                    </b-td>

                    <!-- Published -->
                    <b-td class="text-center">
                        {{ color.published }}
                    </b-td>

                    <!-- Color name -->
                    <b-td>
                        {{ color.label }}
                    </b-td>

                    <!-- Price -->
                    <b-td>
                        {{ color.base_price }}
                    </b-td>

                    <!-- Sizes -->
                    <b-td>

                    </b-td>

                    <!-- Images -->
                    <b-td>
                        <!-- <span
                            v-for="(result, index) in getVariantThumbs(color)"
                            :key="index"
                            class="variant-thumb">
                            <figure
                                :style="`background-image:url(${result.url});`"
                                class="shadow"
                                :class="{'featured-thumb': result.is_featured}"></figure>
                        </span> -->
                    </b-td>

                    <b-td class="text-right">
                        <b-button
                            variant="outline-secondary"
                            class="mr-1"
                            @click="onEditBtnClick(idx)">{{ $t('Edit') }}</b-button>

                        <pop-confirm @onConfirm="deleteColor(idx)">
                            {{ $t('Delete this row?') }}

                            <b-button
                                slot="reference"
                                variant="outline-secondary"
                                class="border-dashed-2">
                                <fig-icon icon="trash" stroke-width="1px" />
                            </b-button>
                        </pop-confirm>
                    </b-td>
                </b-tr>
            </draggable>
        </b-table-simple>


        <div>
            <b-button
                variant="primary"
                size="sm"
                @click="addEmptyColor">
                <fig-icon icon="plus" /> {{ $t('Add Color') }}
            </b-button>
        </div>


        <!-- color upsert form -->
        <b-modal
            id="color_upsert_form_modal"
            size="xl"
            hide-footer
            :title="modalTitle">
            <color-upsert-form
                :color="colorList[visibleColorIndex]"
                @done="onColorUpsertDone"
                @cancel="onColorUpsertCancel" />
        </b-modal>

    </div>
</template>


<style lang="scss">
// @import "~assets/css/components/_table.scss";
// @import "~assets/css/components/_formRow.scss";
// @import "~assets/css/components/_mixins.scss";


.dropdown {
  position: relative;
  height: 0;
  overflow: hidden;
  transition: height 350ms;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 1rem;
    background-image: linear-gradient(to top, white, rgba(white, 0));
  }

  &-enter,
  &-leave-to { opacity: 0 }

  &-leave,
  &-enter-to { opacity: 1 }

  &-enter-active,
  &-leave-active {
    position: absolute;
    width: 100%;
    transition: opacity 200ms ease-in-out;
  }

  &-enter-active { transition-delay: 100ms }
}
</style>
