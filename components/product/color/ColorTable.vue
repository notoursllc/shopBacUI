<script>
import draggable from 'vuedraggable';
import PopConfirm from '@/components/PopConfirm';
import InputMoney from '@/components/InputMoney';
import ColorUpsertForm from '@/components/product/color/ColorUpsertForm';

import TextCard from '@/components/TextCard';
import PricingForm from '@/components/product/PricingForm';
import ColorExpressionForm from '@/components/product/color/ColorExpressionForm';
import SizeChooserForm from '@/components/product/size/SizeChooserForm';

import storage_mixin from '@/mixins/storage_mixin';
import product_mixin from '@/mixins/product_mixin';

export default {
    name: 'ColorTable',

    components: {
        draggable,
        PopConfirm,
        InputMoney,
        ColorUpsertForm,

        TextCard,
        PricingForm,
        ColorExpressionForm,
        SizeChooserForm
    },

    mixins: [
        storage_mixin,
        product_mixin
    ],

    props: {
        // product: {
        //     type: Object,
        //     default: function() {
        //         return {};
        //     }
        // }
    },

    data: function() {
        return {
            // define the product here for development only
            product: {
                id: 'foo',
                colors: []
            },
            visibleDetailsRow: null,

            upsertingColor: null
        };
    },

    computed: {
        canShowGrabHandles() {
            return Array.isArray(this.product.colors) && this.product.colors.length > 1;
        }
    },

    created() {
        this.init();
    },

    methods: {
        init() {
            if(Array.isArray(this.product.colors) && !this.product.colors.length) {
                this.addEmptyColor();
            }
        },

        addEmptyColor() {
            this.upsertingColor = {};
            this.$bvModal.show('color_upsert_form_modal');
            // this.product.colors.push({
            //     published: true,
            //     label: null,
            //     product_id: this.product.id,
            //     ordinal: this.product.colors.length,
            // });

            // this.visibleDetailsRow = null;
        },

        setColorOrdinals() {
            this.product.colors.forEach((obj, index) => {
                obj.ordinal = index;
            });
        },

        onClickMoreColorBtn(index) {
            // const sku = this.product.skus[index];

            // this.skuDialog.sku = sku;
            // this.skuDialog.action = 'append';

            // this.$bvModal.show('color_upsert_form_modal');

            this.visibleDetailsRow = this.visibleDetailsRow === index ? null : index;
        },

        async deleteColor(index) {
            try {
                const color = this.product.colors[index];

                // Only delete the skus that are persisted in the DB (which have an id)
                if(color.id) {
                    await this.$api.productColors.delete(color.id); // TODO
                }

                this.product.colors.splice(index, 1);

                this.init();

                if(color.id) {
                    this.$successToast(this.$t('Color deleted successfully'));
                }
            }
            catch(e) {
                this.$errorToast(e.message);
            }
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
            table-class="bread-table">
            <b-thead>
                <b-tr>
                    <b-th v-if="canShowGrabHandles" class="vabtm width50"></b-th>
                    <b-th class="width50">{{ $t('Published') }}</b-th>
                    <b-th>{{ $t('Color Name') }}</b-th>
                    <b-th>{{ $t('Price') }}</b-th>
                    <b-th>{{ $t('Sizes') }}</b-th>
                    <b-th>{{ $t('Images') }}</b-th>
                    <b-th></b-th>
                </b-tr>
            </b-thead>

            <draggable
                v-model="product.colors"
                handle=".handle"
                @update="setColorOrdinals"
                ghost-class="ghost"
                tag="b-tbody">
                <template v-for="(color, idx) in product.colors">
                    <b-tr
                        :key="idx"
                        :class="{'visible-details': visibleDetailsRow === idx}">
                        <!-- drag handle -->
                        <b-td v-show="canShowGrabHandles">
                            <fig-icon
                                icon="dots-vertical-double"
                                class="handle cursorGrab" />
                        </b-td>

                        <!-- Published -->
                        <b-td class="text-center">
                            <b-form-checkbox
                                v-model="color.published" />
                        </b-td>

                        <!-- Color name -->
                        <b-td>
                            <b-form-input
                                v-model="color.label" />
                        </b-td>

                        <!-- Price -->
                        <b-td>
                            <input-money
                                v-model="color.base_price" />
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
                                @click="onClickMoreColorBtn(idx)"
                                class="mrs">{{ $t('more') }}</b-button>

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

                    <!-- more details row -->
                    <transition name="dropdown" :key="`${idx}_details`">
                        <b-tr
                            :class="{'visible-details': visibleDetailsRow === idx}"
                            v-if="visibleDetailsRow === idx">
                            <b-td colspan="7" class="p-3">
                                <!-- <color-upsert-form /> -->

                                <!-- Color expression -->
                                <text-card class="mb-3">
                                    <template v-slot:header>{{ $t('Display color using...') }}</template>
                                    <color-expression-form :color-model="product" />
                                </text-card>

                                <!-- Sizes -->
                                <text-card class="mb-3">
                                    <template v-slot:header>{{ $t('Sizes') }}</template>
                                    color.sizes {{ color.sizes }}
                                    <size-chooser-form
                                        v-model="color.sizes" />
                                </text-card>

                                <!-- pricing -->
                                <text-card class="mb-3">
                                    <template v-slot:header>{{ $t('Pricing') }}</template>
                                    <pricing-form
                                        :data="product" />
                                    <!-- <pricing-form
                                        :data="model"
                                        @input="onPricingFormInput" /> -->
                                </text-card>

                            </b-td>
                        </b-tr>
                    </transition>
                </template>
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
        <b-modal id="color_upsert_form_modal" size="xl" hide-footer>
            <!-- <color-upsert-form
                :sku="skuDialog.sku"
                :product-attributes="product.attributes"
                @done="onSkuUpsertDone" /> -->
            <color-upsert-form
                :id="upsertingColor.id"
                @done="onSkuUpsertDone"/>
        </b-modal>

    </div>
</template>


<style lang="scss">
// @import "~assets/css/components/_table.scss";
// @import "~assets/css/components/_formRow.scss";
// @import "~assets/css/components/_mixins.scss";

.visible-details > td {
    border-top: 0 !important;
    background-color: #f2fdec;
}

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
