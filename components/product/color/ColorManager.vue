<script>
import draggable from 'vuedraggable';
import PopConfirm from '@/components/PopConfirm';
import NumberInput from '@/components/NumberInput';
import InputMoney from '@/components/InputMoney';
import ColorUpsertForm from '@/components/product/color/ColorUpsertForm';
import storage_mixin from '@/mixins/storage_mixin';
import product_mixin from '@/mixins/product_mixin';

export default {
    name: 'ProductColorManager',

    components: {
        draggable,
        PopConfirm,
        NumberInput,
        InputMoney,
        ColorUpsertForm
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
            }
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
            this.product.colors.push({
                published: true,
                label: null,
                product_id: this.product.id,
                ordinal: this.product.colors.length,
            });
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

            this.$bvModal.show('color_upsert_form_modal');
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
        <table class="bv-table mb-4">
            <thead>
                <tr>
                    <th v-show="canShowGrabHandles" class="vabtm width50"></th>
                    <th class="vabtm width50">{{ $t('Published') }}</th>
                    <th class="vabtm">{{ $t('Color Name') }}</th>
                    <th class="vabtm">{{ $t('Price') }}</th>
                    <th class="vabtm">{{ $t('Sizes') }}</th>
                    <th class="vabtm">{{ $t('Images') }}</th>
                    <th class="vabtm"></th>
                </tr>
            </thead>

            <draggable
                v-model="product.colors"
                handle=".handle"
                @update="setColorOrdinals"
                ghost-class="ghost"
                tag="tbody">
                <template v-for="(obj, idx) in product.colors">
                    <tr :key="idx">
                        <!-- drag handle -->
                        <td v-show="canShowGrabHandles">
                            <fig-icon
                                icon="dots-vertical-double"
                                class="handle cursorGrab" />
                        </td>

                        <!-- Published -->
                        <td class="text-center">
                            <b-form-checkbox
                                v-model="obj.published" />
                        </td>

                        <!-- Label -->
                        <td>
                            <b-form-input
                                v-model="obj.label" />
                        </td>

                        <!-- Price -->
                        <td>
                            <input-money
                                v-model="obj.base_price" />
                        </td>

                        <!-- Qty -->
                        <td>
                            <!-- <number-input
                                v-model="obj.inventory_count"
                                :min="0" /> -->
                        </td>

                        <!-- Images -->
                        <!-- <td>
                            <span
                                v-for="(result, index) in getVariantThumbs(obj)"
                                :key="index"
                                class="variant-thumb">
                                <figure
                                    :style="`background-image:url(${result.url});`"
                                    class="shadow"
                                    :class="{'featured-thumb': result.is_featured}"></figure>
                            </span>
                        </td> -->

                        <td class="text-right">
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
                        </td>
                    </tr>

                    <tr :key="`${idx}_details`">
                        <td colspan="7">row details</td>
                    </tr>
                </template>
            </draggable>
        </table>


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
            <color-upsert-form />
        </b-modal>

    </div>
</template>


<style lang="scss">
// @import "~assets/css/components/_table.scss";
// @import "~assets/css/components/_formRow.scss";
// @import "~assets/css/components/_mixins.scss";


</style>
