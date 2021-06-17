<script>
import Vue from 'vue';
import isObject from 'lodash.isobject';
import draggable from 'vuedraggable';
import SizeSelect from '@/components/product/size/SizeSelect';
import Money from '@/components/Money';
import {
    FigFormCheckbox,
    FigBooleanTag,
    FigButton,
    FigFormInputNumber,
    FigFormInputMoney,
    FigFormInputToggle,
    FigFormInput,
    FigIcon,
    FigTableSimple,
    FigTooltip,
    FigTh,
    FigTd,
    FigPopConfirm
} from '@notoursllc/figleaf';


export default Vue.extend({
    name: 'VariantSkuTable',

    components: {
        draggable,
        SizeSelect,
        Money,
        FigFormCheckbox,
        FigBooleanTag,
        FigButton,
        FigFormInputNumber,
        FigFormInputMoney,
        FigFormInputToggle,
        FigFormInput,
        FigIcon,
        FigTableSimple,
        FigTooltip,
        FigTh,
        FigTd,
        FigPopConfirm
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
            skus: Array.isArray(this.variant.skus) ? this.variant.skus : [],
            showBulkEdit: false,
            showBulkEditInputs: {},
            bulkEdit: {},
            whenOutOfStockOptions: [
                { label: this.$t('Continue selling'), value: true },
                { label: this.$t('Hide'), value: false }
            ],
            isDetailsView: false,
            defaults: {
                base_price: 0,
                sale_price: 0,
                compare_at_price: 0,
                cost_price: 0,
                weight_oz: 0
            }
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

                    // also set the defaults
                    for(const key in this.defaults) {
                        this.defaults[key] = newVal[key];
                    }
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

        emitDefaultsInput() {
            this.$emit('defaults', this.defaults);
        },

        removeRow(index) {
            this.skus.splice(index, 1);
        },

        addSize() {
            this.isDetailsView = false;

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

        onToggleChange(index, prop, val) {
            this.$set(this.skus[index], prop, !val ? null : '');
        },

        toggleDetailsView() {
            this.isDetailsView = !this.isDetailsView;
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
                class="mr-2">{{ $t('Add Size') }}</fig-button>

            <fig-button
                v-if="skus && skus.length"
                variant="plain"
                size="sm"
                @click="toggleDetailsView"
                :icon="isDetailsView ? 'edit' : 'columns'"
                class="mr-2">{{ isDetailsView ? $t('Show edit view') : $t('Show list view') }}</fig-button>
        </div>

        <fig-table-simple
            striped
            hover>
            <template slot="head">
                <tr>
                    <fig-th rowspan="2" v-if="skus && skus.length > 1" class="handle-cell align-top"></fig-th>
                    <fig-th rowspan="2">{{ $t('Size') }}</fig-th>
                    <fig-th rowspan="2">{{ $t('Inventory') }}</fig-th>
                    <fig-th rowspan="2">{{ $t('SKU') }}</fig-th>
                    <fig-th rowspan="2">{{ $t('Barcode') }}</fig-th>
                    <fig-th>{{ $t('Price') }}</fig-th>
                    <fig-th>{{ $t('Sale price') }}</fig-th>
                    <fig-th rowspan="2">{{ $t('Is on sale') }}</fig-th>
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
                    <fig-th rowspan="2" class="text-center">{{ $t('Track inventory') }}</fig-th>
                    <fig-th rowspan="2" class="text-center">{{ $t('Hide when out of stock') }}</fig-th>
                    <!-- <fig-th>{{ $t('Country of origin') }}</fig-th> -->
                    <fig-th rowspan="2"></fig-th>
                </tr>

                <tr>
                    <!-- price -->
                    <fig-th>
                        <div class="text-xs">{{ $t('default') }}:</div>
                        <money
                            v-if="isDetailsView"
                            :cents="defaults.base_price" />
                        <fig-form-input-money
                            v-else
                            v-model="defaults.base_price"
                            size="sm"
                            @input="emitDefaultsInput" />
                    </fig-th>

                    <!-- sale price -->
                    <fig-th>
                        <div class="text-xs">{{ $t('default') }}:</div>
                        <money
                            v-if="isDetailsView"
                            :cents="defaults.sale_price" />
                        <fig-form-input-money
                            v-else
                            v-model="defaults.sale_price"
                            size="sm"
                            @input="emitDefaultsInput" />
                    </fig-th>

                    <!-- compare at -->
                    <fig-th>
                        <div class="text-xs">{{ $t('default') }}:</div>
                        <money
                            v-if="isDetailsView"
                            :cents="defaults.compare_at_price" />
                        <fig-form-input-money
                            v-else
                            v-model="defaults.compare_at_price"
                            size="sm"
                            @input="emitDefaultsInput" />
                    </fig-th>

                    <!-- cost -->
                    <fig-th>
                        <div class="text-xs">{{ $t('default') }}:</div>
                        <money
                            v-if="isDetailsView"
                            :cents="defaults.cost_price" />
                        <fig-form-input-money
                            v-else
                            v-model="defaults.cost_price"
                            size="sm"
                            @input="emitDefaultsInput" />
                    </fig-th>

                    <!-- weight -->
                    <fig-th>
                        <div class="text-xs">{{ $t('default') }}:</div>
                        <template v-if="isDetailsView">{{ $n(defaults.weight_oz) }}</template>
                        <fig-form-input-number
                            v-else
                            v-model="defaults.weight_oz"
                            :step=".01"
                            :min="0"
                            controls-right
                            size="sm"
                            @input="emitDefaultsInput" />
                    </fig-th>
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
                    <fig-td v-if="skus.length > 1" class="align-top">
                        <i class="handle">
                            <fig-icon icon="dots-vertical-double" />
                        </i>
                    </fig-td>

                    <!-- size -->
                    <fig-td class="font-semibold align-top">
                        <template v-if="isDetailsView">{{ sku.label }}</template>
                        <size-select
                            v-else
                            v-model="sku.label"
                            size="sm"
                            append-to-body
                            style="min-width:75px" />
                    </fig-td>

                    <!-- inventory -->
                    <fig-td class="text-sm text-right align-top">
                        <template v-if="isDetailsView">{{ sku.inventory_count }}</template>
                        <fig-form-input-number
                            v-else
                            v-model="sku.inventory_count"
                            controls-right
                            :min="0"
                            size="sm" />
                    </fig-td>

                    <!-- SKU -->
                    <fig-td class="text-sm align-top">
                        <template v-if="isDetailsView">{{ sku.sku }}</template>
                        <fig-form-input
                            v-else
                            v-model="sku.sku"
                            id="size_sku"
                            size="sm" />
                    </fig-td>

                    <!-- Barcode -->
                    <fig-td class="text-sm align-top">
                        <template v-if="isDetailsView">{{ sku.barcode }}</template>
                        <fig-form-input
                            v-else
                            v-model="sku.barcode"
                            size="sm"
                            id="size_barcode" />
                    </fig-td>

                    <!-- Price -->
                    <fig-td class="text-sm text-right align-top">
                        <money
                            v-if="isDetailsView"
                            :cents="sku.base_price" />
                        <template v-else>
                            <fig-form-input-money
                                v-if="sku.base_price !== null"
                                v-model="sku.base_price"
                                size="sm"
                                id="size_price" />

                            <fig-form-input-toggle
                                :value="sku.base_price !== null"
                                size="sm"
                                variant="success"
                                class="mt-2"
                                @input="(val) => onToggleChange(index, 'base_price', val)" />
                        </template>
                    </fig-td>

                    <!-- Sale price -->
                    <fig-td class="text-sm text-right align-top">
                        <money
                            v-if="isDetailsView"
                            :cents="sku.sale_price" />
                        <template v-else>
                            <fig-form-input-money
                                v-if="sku.sale_price !== null"
                                v-model="sku.sale_price"
                                size="sm"
                                id="size_price" />

                            <fig-form-input-toggle
                                :value="sku.sale_price !== null"
                                size="sm"
                                variant="success"
                                class="mt-2"
                                @input="(val) => onToggleChange(index, 'sale_price', val)" />
                        </template>
                    </fig-td>

                    <!-- Is on sale -->
                    <fig-td class="text-center align-top">
                        <fig-boolean-tag
                            v-if="isDetailsView"
                            :bool="sku.is_on_sale"
                            :true-label="$t('Yes')"
                            :false-label="$t('No')"
                            size="sm" />
                        <fig-form-checkbox
                            v-else
                            v-model="sku.is_on_sale" />
                    </fig-td>

                    <!-- Compare at -->
                    <fig-td class="text-sm text-right align-top">
                        <money
                            v-if="isDetailsView"
                            :cents="sku.compare_at_price" />
                        <template v-else>
                            <fig-form-input-money
                                v-if="sku.compare_at_price !== null"
                                v-model="sku.compare_at_price"
                                size="sm"
                                id="size_price_compare_at" />

                            <fig-form-input-toggle
                                :value="sku.compare_at_price !== null"
                                size="sm"
                                variant="success"
                                class="mt-2"
                                @input="(val) => onToggleChange(index, 'compare_at_price', val)" />
                        </template>
                    </fig-td>

                    <!-- Cost -->
                    <fig-td class="text-sm text-right align-top">
                        <money
                            v-if="isDetailsView"
                            :cents="sku.cost_price" />
                        <template v-else>
                            <fig-form-input-money
                                v-if="sku.cost_price !== null"
                                v-model="sku.cost_price"
                                size="sm"
                                id="size_price_cost" />

                            <fig-form-input-toggle
                                :value="sku.cost_price !== null"
                                size="sm"
                                variant="success"
                                class="mt-2"
                                @input="(val) => onToggleChange(index, 'cost_price', val)" />
                        </template>
                    </fig-td>

                    <!-- Weight -->
                    <fig-td class="text-sm text-right align-top">
                        <template v-if="isDetailsView">{{ sku.weight_oz }}</template>
                        <template v-else>
                            <fig-form-input-number
                                v-if="sku.weight_oz !== null"
                                v-model="sku.weight_oz"
                                :step=".01"
                                :min="0"
                                controls-right
                                size="sm"
                                id="size_weight" />

                            <fig-form-input-toggle
                                :value="sku.weight_oz !== null"
                                size="sm"
                                variant="success"
                                class="mt-2"
                                @input="(val) => onToggleChange(index, 'weight_oz', val)" />
                        </template>
                    </fig-td>

                    <!-- Track inventory -->
                    <fig-td class="text-center align-top">
                        <fig-boolean-tag
                            v-if="isDetailsView"
                            :bool="sku.track_inventory_count"
                            :true-label="$t('Yes')"
                            :false-label="$t('No')"
                            size="sm" />
                        <fig-form-checkbox
                            v-else
                            v-model="sku.track_inventory_count" />
                    </fig-td>

                    <!-- Hide when out of stock -->
                    <fig-td class="text-center align-top">
                        <fig-boolean-tag
                            v-if="isDetailsView"
                            :bool="sku.visible_if_no_inventory"
                            :true-label="$t('Yes')"
                            :false-label="$t('No')"
                            size="sm" />
                        <fig-form-checkbox
                            v-else
                            v-model="sku.visible_if_no_inventory" />
                    </fig-td>

                    <!-- Country of origin -->
                    <!-- <fig-td class="text-sm align-top">
                        <template v-if="isDetailsView">
                            <fig-country
                                v-if="sku.customs_country_of_origin !== null"
                                :alpha2="sku.customs_country_of_origin" />
                            <div
                                v-else
                                class="text-gray-400">({{ $t('default') }})</div>
                        </template>
                        <template v-else>
                            <fig-form-select-country
                                v-if="sku.customs_country_of_origin !== null"
                                v-model="sku.customs_country_of_origin"
                                size="xs"
                                id="size_origin" />

                            <fig-form-input-toggle
                                :value="sku.customs_country_of_origin !== null"
                                size="sm"
                                variant="success"
                                class="mt-2"
                                @input="(val) => onToggleChange(index, 'customs_country_of_origin', val)" />
                        </template>
                    </fig-td> -->

                    <fig-td class="align-top">
                        <fig-pop-confirm @confirm="removeRow(index)">
                            <div class="text-center" style="min-width:125px">{{ $t('Delete this size?') }}</div>
                            <fig-button
                                slot="reference"
                                variant="ghost"
                                size="sm"
                                icon="trash" />
                        </fig-pop-confirm>
                    </fig-td>
                </tr>
            </draggable>
        </fig-table-simple>
    </div>
</template>


<style lang="postcss">
.handle {
    cursor: grab !important;
}
</style>
