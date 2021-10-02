<script>
import {
    FigTableSimple,
    FigTh,
    FigTd,
    FigTrNoResults,
    FigMoney,
    FigLabelValueGroup,
    FigLabelValue,
    FigButton,
    FigDataToggler,
    FigFormCheckbox,
    FigPopConfirm,
    FigFormSelectNative
} from '@notoursllc/figleaf';

export default {
    components: {
        FigTableSimple,
        FigTh,
        FigTd,
        FigTrNoResults,
        FigMoney,
        FigLabelValueGroup,
        FigLabelValue,
        FigButton,
        FigDataToggler,
        FigFormCheckbox,
        FigPopConfirm,
        FigFormSelectNative
    },

    props: {
        cart: {
            type: Object,
            required: true
        }
    },

    data() {
        return {
            showDetailsInRow: {},
            selectedItems: []
        };
    },

    computed: {
        totalRefundAmount() {
            let total = 0;

            this.selectedItems.forEach((item) => {
                const price = this.getDisplayPrice(item);
                total += (price * item.qtyToRefund);
            });

            return total;
        }
    },

    methods: {
        getProductImage(cartItem) {
            return (cartItem.product_variant && Array.isArray(cartItem.product_variant.images))
                ? cartItem.product_variant.images[0].third_party_id
                : null;
        },

        getMasterTypeName(object, value) {
            if(Array.isArray(this.$store.state.masterTypes[object])) {
                for(let i=0; i<this.$store.state.masterTypes[object].length; i++) {
                    if(this.$store.state.masterTypes[object][i].value === value) {
                        return this.$store.state.masterTypes[object][i].name;
                    }
                }
            }
            return null;
        },

        toggleShowMore(index) {
            this.$set(
                this.showDetailsInRow,
                index,
                !this.showDetailsInRow[index]
            );
        },

        getDisplayPrice(cartItem) {
            return cartItem.product_variant_sku.display_price !== null
                ? cartItem.product_variant_sku.display_price
                : cartItem.product_variant.display_price;
        },

        onConfirmRefundItems(selectedItems) {
            console.log("SELETED ITESM", [...selectedItems]);

            // TODO: send API request
        },

        onItemSelected(selectedItems) {
            this.selectedItems = [...selectedItems];
            console.log("ON CHANGE", this.selectedItems);
        },

        getRefundQtyOptions(qtyPurchased) {
            const options = [];

            for(let i=parseInt(qtyPurchased); i>0; i--) {
                options.push(
                    { label: i, value: i }
                );
            }

            return options;
        },

        onCartItemCheckboxClick(cartItem, isChecked) {
            cartItem.qtyToRefund = isChecked ? 1 : null;
        }
    }
};
</script>


<template>
    <fig-data-toggler
        :items="cart.cart_items"
        v-slot:default="slotProps"
        @changed="onItemSelected">

        <fig-table-simple
            striped
            hover
            :cell-padding="1">
            <template slot="head">
                <tr>
                    <fig-th class="w-16">
                        <div class="text-center">
                            <fig-form-checkbox
                                inline
                                @input="(isChecked) => slotProps.toggleAll(isChecked)"
                                v-model="slotProps.allAreSelected" />
                        </div>
                    </fig-th>
                    <fig-th>{{ $t('Image') }}</fig-th>
                    <fig-th>{{ $t('Qty purchased') }}</fig-th>
                    <fig-th>{{ $t('Qty to refund') }}</fig-th>
                    <fig-th>{{ $t('Price (ea.)') }}</fig-th>
                    <fig-th>{{ $t('Title') }}</fig-th>
                    <fig-th>{{ $t('Size') }}</fig-th>
                    <fig-th>{{ $t('SKU') }}</fig-th>
                    <fig-th>{{ $t('Product sub-type') }}</fig-th>
                    <fig-th>{{ $t('Gender') }}</fig-th>
                    <fig-th></fig-th>
                </tr>
            </template>

            <tr
                v-for="(cartItem, idx) in cart.cart_items"
                :key="idx"
                :class="{'bg-red-100': slotProps.selectedItems.has(cartItem)}">
                <!-- checkbox -->
                <fig-td class="text-center">
                    <fig-form-checkbox
                        inline
                        @input="(isChecked) => { slotProps.toggleOne(cartItem, isChecked); onCartItemCheckboxClick(cartItem, isChecked) }"
                        :value="slotProps.selectedItems.has(cartItem)" />
                </fig-td>

                <!-- image -->
                <fig-td>
                    <nuxt-img
                        v-if="getProductImage(cartItem)"
                        provider="cloudflare"
                        :src="getProductImage(cartItem)"
                        preset="prod_thumb"
                        loading="lazy"
                        width="75"
                        height="75"
                        class="shadow" />
                </fig-td>

                <!-- qty purchased -->
                <fig-td>
                    {{ $n(cartItem.qty) }}
                </fig-td>

                <!-- qty to refund -->
                <fig-td>
                    <fig-form-select-native
                        v-model="cartItem.qtyToRefund"
                        :options="getRefundQtyOptions(cartItem.qty)" />
                </fig-td>

                <!-- Price -->
                <fig-td>
                    <fig-money :cents="getDisplayPrice(cartItem)" />
                </fig-td>

                <!-- title -->
                <fig-td>
                    {{ cartItem.product.title }}
                </fig-td>

                <!-- Size -->
                <fig-td>
                    {{ cartItem.product_variant_sku.label }}
                </fig-td>

                <!-- SKU -->
                <fig-td>
                    {{ cartItem.product_variant_sku.sku }}
                </fig-td>

                <!-- Product sub-type -->
                <fig-td>
                    {{ getMasterTypeName('product_sub_type', cartItem.product.sub_type) }}
                </fig-td>

                <!-- Gender -->
                <fig-td>
                    {{ getMasterTypeName('product_gender_type', cartItem.product.gender_type) }}
                </fig-td>

                <!-- more... -->
                <fig-td>
                    <fig-button
                        size="sm"
                        @click="toggleShowMore(idx)">{{ $t(showDetailsInRow[idx] ? 'hide more' : 'show more') }}</fig-button>

                    <fig-label-value-group
                        class="mt-2"
                        density="sm"
                        block
                        v-show="showDetailsInRow[idx]">

                        <!-- product type -->
                        <fig-label-value>
                            <template v-slot:label>{{ $t('Product type') }}:</template>
                            {{ getMasterTypeName('product_type', cartItem.product.type) }}
                        </fig-label-value>

                        <!-- fit -->
                        <fig-label-value>
                            <template v-slot:label>{{ $t('Fit') }}:</template>
                            {{ getMasterTypeName('product_fit_type', cartItem.product.fit_type) }}
                        </fig-label-value>

                        <!-- sleeve -->
                        <fig-label-value>
                            <template v-slot:label>{{ $t('Sleeve') }}:</template>
                            {{ getMasterTypeName('product_sleeve_length_type', cartItem.product.sleeve_length_type) }}
                        </fig-label-value>
                    </fig-label-value-group>
                </fig-td>
            </tr>

            <fig-tr-no-results v-if="!cart.cart_items.length" colspan="9" />
        </fig-table-simple>

        <div class="mt-6" v-if="totalRefundAmount">
            <div class="text-red-700">{{ $t('Refund amount') }}: <fig-money :cents="totalRefundAmount" /></div>
        </div>

        <div class="mt-6">
            <fig-pop-confirm
                @confirm="onConfirmRefundItems(slotProps.selectedItems)"
                :disabled="!slotProps.numberSelected">
                {{ $t('Refund the selected items?') }} (<fig-money :cents="totalRefundAmount" />)

                <fig-button
                    slot="reference"
                    variant="danger"
                    :disabled="!slotProps.numberSelected">{{ $t('Process refund') }}</fig-button>
            </fig-pop-confirm>
        </div>
    </fig-data-toggler>
</template>
