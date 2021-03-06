<script>
import product_mixin from '@/mixins/product_mixin';
import shopping_cart_mixin from '@/mixins/shopping_cart_mixin';

import {
    FigFormInputNumber
} from '@notoursllc/figleaf';

export default {
    name: 'CartItem',

    components: {
        ProductPrice: () => import('@/components/product/ProductPrice'),
        ProductDetailsLayout: () => import('@/components/product/ProductDetailsLayout'),
        ProductImageCarousel: () => import('@/components/product/ProductImageCarousel'),
        ProductQuantityWarning: () => import('@/components/product/ProductQuantityWarning'),
        FigFormInputNumber
    },

    mixins: [
        product_mixin,
        shopping_cart_mixin
    ],

    props: {
        data: {
            type: Object,
            default: null
        },

        editMode: {
            type: Boolean,
            default: false
        },

        showPriceStrikethrough: {
            type: Boolean,
            default: true
        },

        showQuantityWarning: {
            type: Boolean,
            default: true
        }
    },

    data() {
        return {
            showConfirmDeleteModal: false,
            showDialog: false
        };
    },

    methods: {
        getProductQuantityMaxValue(selectedSize, product) {
            return this.getInventoryCountForSize(selectedSize, product);
        },

        async updateCartItemQuantity() {
            const updateConfig = {
                id: this.data.id,
                qty: this.data.qty
            };

            try {
                const loadingInstance = this.$loadingService({ target: `#cartItem${this.data.id}` });


                const response = await this.$api.cart.updateItemQty(updateConfig);

                this.setCartAndTokenStateFromResponse(response);
                this.$emit('updated');
                loadingInstance.close();
            }
            catch(err) {
                this.$figleaf.errorToast({
                    title: this.$t('Error'),
                    text: err.message
                });

                this.$bugsnag.notify(err, {
                    request: {
                        updateItemQty: updateConfig
                    }
                });
            }
        },

        async removeItem() {
            try {
                const loadingInstance = this.$loadingService({ target: `#cartItem${this.data.id}` });
                const response = await this.$api.cart.deleteItem(this.data.id);

                this.setCartAndTokenStateFromResponse(response);
                this.$emit('updated');
                loadingInstance.close();
            }
            catch(err) {
                this.$figleaf.errorToast({
                    title: this.$t('Error'),
                    text: err.message
                });

                this.$bugsnag.notify(err, {
                    request: { deleteItem: { id: this.data.id } }
                });
            }
        },

        onConfirmDelete() {
            this.showConfirmDeleteModal = false;
            this.removeItem()
        },

        onConfirmDeleteCancel() {
            this.showConfirmDeleteModal = false;
        },

        showProductDetailsDialog() {
            this.showDialog = true;
        }
    }
}
</script>


<template>
    <div>
        <article class="cartItem is-flexbox" :id="'cartItem' + data.id">
            <!-- pic -->
            <div class="picCell">
                <figure
                    class="cartItemPic"
                    :style="'background-image:url(' + featuredProductPic(data.product) + ');'"></figure>
            </div>

            <div class="content-cell">
                <div class="cart-item-header">
                    <!-- title -->
                    <el-tooltip
                        effect="light"
                        :content="$t('Product quick view')"
                        placement="top-start">
                        <a class="underlineDotted" @click="showProductDetailsDialog()">{{ data.product.title }}</a>
                    </el-tooltip>
                </div>

                <div class="cart-item-footer">
                    <!-- Variants -->

                     <!-- size -->
                    <div class="cart-item-footer-cell">
                        <label>{{ $t('Size') }}:</label>
                        <span>{{ $t(data.variants.size) }}</span>
                    </div>

                    <!-- Price -->
                    <div class="cart-item-footer-cell">
                        <label>{{ $t('Price') }}:</label>
                        <span>
                            <!-- price -->
                            <product-price
                                :product="data.product"
                                :show-strikethrough="showPriceStrikethrough"
                                :stacked="false" />
                        </span>
                    </div>

                    <!-- Quantity -->
                    <div class="cart-item-footer-cell">
                        <label>
                            {{ $t('Quantity') }}:
                            <span class="text-xs" v-if="showQuantityWarning"><product-quantity-warning :max="getProductQuantityMaxValue(data.variants.size, data.product)" /></span>
                        </label>
                        <span>
                            <template v-if="editMode">
                                <fig-form-input-number
                                    v-model="data.qty"
                                    :max="getProductQuantityMaxValue(data.variants.size, data.product)"
                                    size="mini"
                                    @input="updateCartItemQuantity"
                                    class="qty" />
                            </template>
                            <template v-else>
                                {{ data.qty }}
                            </template>
                        </span>
                    </div>
                </div>
            </div>

            <!-- delete button -->
            <div class="deleteButton" v-if="editMode">
                <el-popover
                    v-model="showConfirmDeleteModal"
                    width="200"
                    trigger="click"
                    placement="bottom-start">
                    <div class="text-center">{{ $t('Remove this item?') }}</div>
                    <div class="text-center mt-3">
                        <el-button
                            type="primary"
                            size="mini"
                            @click="onConfirmDelete">{{ $t('CONFIRM') }}</el-button>

                        <el-button
                            size="mini"
                            type="text"
                            @click="onConfirmDeleteCancel">{{ $t('cancel') }}</el-button>
                    </div>

                    <span class="cursor-pointer" slot="reference">
                        <el-tooltip
                            effect="light"
                            :content="$t('Remove item from cart')"
                            placement="top-start">
                            <fig-icon icon="trash" />
                        </el-tooltip>
                    </span>
                </el-popover>
            </div>
        </article>


        <el-dialog
            :visible.sync="showDialog"
            custom-class="productDialog"
            width="95%"
            top="5vh">

            <product-details-layout>
                <!-- pics -->
                <template slot="pics">
                    <product-image-carousel :product="data.product" />
                </template>

                <template slot="info">
                    <!-- title -->
                    <div class="text-xl pb-3">{{ data.product.title }}</div>

                    <!-- description -->
                    <div class="pb-5 text-base break-normal">{{ data.product.description_long }}</div>

                    <!-- price -->
                    <div class="text-xl">
                        <product-price :product="data.product" />
                    </div>

                    <hr/>

                    <div class="table">
                        <!-- size -->
                        <div class="formRow">
                            <label class="whitespace-nowrap font-semibold">{{ $t('Size') }}:</label>
                            <span>{{ $t(data.variants.size) }}</span>
                        </div>

                        <!-- quantity -->
                        <div class="formRow">
                            <label class="whitespace-nowrap font-semibold">{{ $t('Quantity') }}:</label>
                            <span>{{ data.qty }}</span>
                        </div>
                    </div>
                </template>
            </product-details-layout>
        </el-dialog>
    </div>
</template>

<style lang="scss">
    @import "~assets/css/components/_variables.scss";
    @import "~assets/css/components/_mixins.scss";
    @import "~assets/css/components/_formRow.scss";

    .is-flexbox {
        @include flexbox();
        @include flex-wrap(nowrap);
        @include flex-direction(row);
        @include align-content(stretch);
    }

    .cartItem {
        margin-bottom: 20px;
        background-color: #fff;
        @include box-shadow(0px, 1px, 2px, rgba(0,0,0,.1));
        transition: background-color .5s linear;
        position: relative;
        @include flexbox();
        @include flex-direction(row);

        .content-cell {
            @include flex-grow(1);
            @include flexbox();
            @include flex-direction(column);

            .cart-item-header {
                padding: 10px 20px !important;
                @include flex-grow(1);
            }

            .cart-item-footer {
                padding: 0;
                background: #f9f9f9;
                padding: 3px 0;

                @include flexbox();
                @include flex-wrap(nowrap);
                @include flex-direction(row);
            }

            .cart-item-footer-cell {
                display: inline-block;
                vertical-align: top;
                padding: 0 10px;
                @include flex-grow(1);
                text-align: center;

                >label,
                >span {
                    display: block;
                }

                >label {
                    font-size: 14px;
                    line-height: 25px;
                    font-weight: 300;
                }

                >span {
                    font-size: 15px;
                    font-weight: 500;
                    text-align: center;
                }

                .qty {
                    width: 130px;
                }
            }
        }

        .picCell {
            width: 128px;
            min-height: 128px;
            position: relative;
        }

        .cartItemPic {
            position: absolute;
            width: 100%;
            height: 100%;
            background-size: cover;
            background-position: center;
        }

        .deleteButton {
            position: absolute;
            top: -5px;
            right: -5px;
            width: 20px;
            height: 20px;
        }
    }

    @media #{$medium-and-up} {
        .productDialog {
            max-width: 1000px;
        }
    }
</style>
