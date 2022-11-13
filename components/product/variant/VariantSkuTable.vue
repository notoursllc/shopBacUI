<script>
import Vue from 'vue';
import isObject from 'lodash.isobject';
import draggable from 'vuedraggable';
import SizeSelect from '@/components/product/size/SizeSelect';
import {
    FigFormCheckbox,
    FigButton,
    FigFormInputNumber,
    FigFormInputMoney,
    FigFormInputToggle,
    FigFormInput,
    FigFormSelectNative,
    FigIcon,
    FigTableSimple,
    FigTooltip,
    FigTh,
    FigTd,
    FigTrNoResults,
    FigPopConfirm,
    FigPopover
} from '@notoursllc/figleaf';


export default Vue.extend({
    name: 'VariantSkuTable',

    components: {
        draggable,
        SizeSelect,
        FigFormCheckbox,
        FigButton,
        FigFormInputNumber,
        FigFormInputMoney,
        FigFormInputToggle,
        FigFormInput,
        FigFormSelectNative,
        FigIcon,
        FigTableSimple,
        FigTooltip,
        FigTh,
        FigTd,
        FigTrNoResults,
        FigPopConfirm,
        FigPopover
    },

    props: {
        variant: {
            type: Object,
            default: () => {
                return {};
            }
        }
    },

    data: function() {
        return {
            skuLabelType: 'size',
            skus: Array.isArray(this.variant.skus) ? this.variant.skus : [],
            showBulkEdit: false,
            showBulkEditInputs: {},
            bulkEdit: {},
            whenOutOfStockOptions: [
                { label: this.$t('Continue selling'), value: true },
                { label: this.$t('Hide'), value: false }
            ]
        };
    },

    watch: {
        skus: {
            handler(newVal) {
                this.emitInput();
            },
            deep: true
        },

        variant: {
            handler(newVal) {
                if(isObject(newVal)) {
                    this.skus = newVal.skus;
                    this.skuLabelType = newVal.sku_label_type;
                }
                else {
                    this.skus = [];
                }
            },
            immediate: true
        }
    },

    methods: {
        emitInput() {
            const cleanSizes = [];

            if(Array.isArray(this.skus)) {
                this.skus.forEach((sku) => {
                    const copy = {...sku};
                    cleanSizes.push(copy);
                });
            }

            this.$emit('input', cleanSizes);
        },

        async deleteSku(index) {
            await this.$api.product.variant.sku.delete(this.skus[index].id);
            this.skus.splice(index, 1);
        },

        addSize() {
            this.skus.splice(this.skus.length, 1, {
                ordinal: this.skus.length,
                label: null,
                base_price: null,
                visible_if_no_inventory: true,
                compare_at_price: null,
                cost_price: null,
                weight_oz: null,
                inventory_count: 0,
                track_inventory_count: true,
                sku: null,
                barcode: null,
                customs_country_of_origin: null
            });
        },

        onLabelInputTypeChange(val) {
            this.$emit('skuLabelType', val);
        }
    }
});
</script>


<template>
    <div>
        <div id="header-container" class="flex items-center justify-end pb-4">
            <fig-button
                variant="primary"
                size="sm"
                @click="addSize"
                icon="plus"
                class="mr-2">{{ $t('Add SKU') }}</fig-button>
        </div>

        <fig-table-simple
            striped
            hover>
            <template slot="head">
                <tr>
                    <fig-th v-if="skus && skus.length > 1" class="handle-cell align-top"></fig-th>
                    <fig-th>
                        <div class="flex items-center">
                            {{ $t('Label') }}
                            <fig-popover placement="bottom">
                                <fig-button
                                    slot="toggler"
                                    icon="adjustments"
                                    variant="plain"
                                    size="sm"
                                    class="ml-2" />

                                <div>{{ $t('Input type') }}</div>
                                <fig-form-select-native
                                    v-model="skuLabelType"
                                    :options="[
                                        { label: $t('size'), value: 'size' },
                                        { label: $t('text'), value: 'text' }
                                    ]"
                                    size="sm"
                                    class="w-full"
                                    @input="onLabelInputTypeChange" />
                            </fig-popover>
                        </div>
                    </fig-th>
                    <fig-th>{{ $t('Inventory') }}</fig-th>
                    <fig-th>{{ $t('SKU') }}</fig-th>
                    <fig-th>{{ $t('Barcode') }}</fig-th>
                    <fig-th>{{ $t('Price') }}</fig-th>
                    <fig-th>{{ $t('Sale price') }}</fig-th>
                    <fig-th>{{ $t('Is on sale') }}</fig-th>
                    <fig-th>{{ $t('Compare at') }}</fig-th>
                    <fig-th>{{ $t('Cost') }}</fig-th>
                    <fig-th>
                        {{ $t('Weight (oz)') }}
                        <fig-tooltip placement="top">
                            <fig-icon
                                slot="toggler"
                                class="ml-1 cursor-pointer"
                                icon="info-circle"
                                width="16"
                                height="16" />
                            {{ $t('Used to calculate shipping rates at checkout and label prices during fulfillment.') }}
                        </fig-tooltip>
                    </fig-th>
                    <!-- <fig-th class="text-center">{{ $t('Track inventory') }}</fig-th> -->
                    <fig-th class="text-center">{{ $t('Hide when out of stock') }}</fig-th>
                    <fig-th></fig-th>
                </tr>
            </template>

            <draggable
                v-model="skus"
                ghost-class="ghost"
                handle=".handle"
                tag="tbody">
                <tr
                    v-for="(sku, index) in skus"
                    :key="index">
                    <!-- handle -->
                    <fig-td v-if="skus.length > 1">
                        <i class="handle">
                            <fig-icon icon="dots-vertical-double" />
                        </i>
                    </fig-td>

                    <!-- size -->
                    <fig-td class="font-semibold">
                        <size-select
                            v-if="skuLabelType === 'size' || !skuLabelType"
                            v-model="sku.label"
                            size="sm"
                            append-to-body
                            clearable
                            style="min-width:75px" />

                        <fig-form-input
                            v-else
                            v-model="sku.label" />
                    </fig-td>

                    <!-- inventory -->
                    <fig-td class="text-sm text-right">
                        <fig-form-input-number
                            v-model="sku.inventory_count"
                            controls-right
                            :min="0"
                            size="sm" />
                    </fig-td>

                    <!-- SKU -->
                    <fig-td class="text-sm">
                        <fig-form-input
                            v-model="sku.sku"
                            id="size_sku"
                            size="sm" />
                    </fig-td>

                    <!-- Barcode -->
                    <fig-td class="text-sm">
                        <fig-form-input
                            v-model="sku.barcode"
                            size="sm"
                            id="size_barcode" />
                    </fig-td>

                    <!-- Price -->
                    <fig-td class="text-sm text-right">
                        <fig-form-input-money
                            v-model="sku.base_price"
                            size="sm" />
                    </fig-td>

                    <!-- Sale price -->
                    <fig-td class="text-sm text-right">
                        <fig-form-input-money
                            v-model="sku.sale_price"
                            size="sm" />
                    </fig-td>

                    <!-- Is on sale -->
                    <fig-td class="text-center">
                        <fig-form-checkbox
                            v-model="sku.is_on_sale" />
                    </fig-td>

                    <!-- Compare at -->
                    <fig-td class="text-sm text-right">
                        <fig-form-input-money
                            v-model="sku.compare_at_price"
                            size="sm"
                            id="size_price_compare_at" />
                    </fig-td>

                    <!-- Cost -->
                    <fig-td class="text-sm text-right">
                        <fig-form-input-money
                            v-model="sku.cost_price"
                            size="sm"
                            id="size_price_cost" />
                    </fig-td>

                    <!-- Weight -->
                    <fig-td class="text-sm text-right">
                        <fig-form-input-number
                            v-model="sku.weight_oz"
                            :step=".01"
                            :min="0"
                            controls-right
                            size="sm"
                            id="size_weight" />
                    </fig-td>

                    <!-- Track inventory -->
                    <!-- <fig-td class="text-center">
                        <fig-form-checkbox
                            v-model="sku.track_inventory_count" />
                    </fig-td> -->

                    <!-- Hide when out of stock -->
                    <fig-td class="text-center">
                        <fig-form-checkbox
                            v-model="sku.visible_if_no_inventory" />
                    </fig-td>

                    <fig-td>
                        <fig-pop-confirm @confirm="deleteSku(index)">
                            <div class="text-center" style="min-width:125px">{{ $t('Delete this SKU?') }}</div>
                            <fig-button
                                slot="reference"
                                variant="ghost"
                                size="sm"
                                icon="trash" />
                        </fig-pop-confirm>
                    </fig-td>
                </tr>

                <fig-tr-no-results v-if="!skus || !skus.length" :colspan="13" />
            </draggable>
        </fig-table-simple>
    </div>
</template>


<style lang="postcss">
.handle {
    cursor: grab !important;
}
</style>
