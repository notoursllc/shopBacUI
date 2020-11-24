<script>
import draggable from 'vuedraggable';
import { BTooltip } from 'bootstrap-vue';
import PopConfirm from '@/components/PopConfirm';
import SizeInput from '@/components/product/size/SizeInput';
import NumberInput from '@/components/NumberInput';

import {
    FigFormCheckbox,
    FigFormInputMoney,
    FigFormInput,
    FigButton
} from '@notoursllc/figleaf';

export default {
    name: 'SizeChooserForm',

    components: {
        draggable,
        BTooltip,
        PopConfirm,
        SizeInput,
        NumberInput,
        FigFormCheckbox,
        FigFormInputMoney,
        FigFormInput,
        FigButton
    },

    props: {
        value: {
            type: Array,
            default: () => {
                return [];
            }
        }
    },

    data: function() {
        return {
            selectedSizes: [],
            search: '',
            editInventoryColumn: false,
            editPriceColumn: false
        };
    },

    watch: {
        value: {
            handler(newVal) {
                this.selectedSizes = newVal;
            },
            immediate: true
        }
    },

    methods: {
        emitInput() {
            this.$emit('input', this.selectedSizes);
        },

        onSizeSelect(val) {
            console.log("ON SIZE SELET", val)
            this.emitInput();
            // console.log("SELETRED", this.selectedSizes)
        },

        removeSelectedSize(index) {
            this.selectedSizes.splice(index, 1);
            this.emitInput();
        },

        addRow() {
            this.selectedSizes.push({
                // ordinal: this.selectedSizes.length,
                // label: null,
                // data: {}
                base_price: null
            });
        }
    }
};
</script>


<template>
    <div>
        <b-table-simple
            hover
            small
            responsive
            table-class="bread-table"
            v-show="selectedSizes.length">
            <b-thead>
                <b-tr>
                    <b-th v-if="selectedSizes.length > 1" class="width50"></b-th>
                    <b-th>{{ $t('Size') }}</b-th>
                    <b-th>
                        {{ $t('Inventory') }}
                        <i v-b-tooltip.hover :title="$t('Edit this column')">
                            <fig-icon
                                class="header-icon"
                                icon="edit"
                                @click="editInventoryColumn = !editInventoryColumn"
                                :stroke-width="1"
                                :width="20"
                                :height="20" />
                        </i>
                    </b-th>
                    <b-th>
                        {{ $t('Price') }}
                        <i v-b-tooltip.hover :title="$t('Edit this column')">
                            <fig-icon
                                class="header-icon"
                                icon="edit"
                                @click="editPriceColumn = !editPriceColumn"
                                :stroke-width="1"
                                :width="20"
                                :height="20" />
                        </i>
                    </b-th>
                    <b-th class="width100"></b-th>
                </b-tr>
            </b-thead>

            <draggable
                v-model="selectedSizes"
                @update="emitInput"
                ghost-class="ghost"
                handle=".handle"
                tag="b-tbody">

                <b-tr v-for="(size, index) in selectedSizes" :key="index">
                    <!-- handle -->
                    <b-td v-if="selectedSizes.length > 1">
                        <i class="handle">
                            <fig-icon icon="dots-vertical-double" />
                        </i>
                    </b-td>

                    <!-- size -->
                    <b-td>
                        <size-input
                            v-model="size.label"
                            @input="onSizeSelect" />
                    </b-td>

                    <!-- inventory -->
                    <b-td class="align-top mini-table" :class="{'mini-table-edit': editInventoryColumn}">

                        <!-- qty -->
                        <div class="mini-row">
                            <label>{{ $t('Quantity') }}:</label>
                            <span>
                                <number-input
                                    v-if="editInventoryColumn"
                                    v-model="size.inventory_count"
                                    :min="0"
                                    size="sm" />
                                <template v-else>{{ size.inventory_count }}</template>
                            </span>
                        </div>

                        <!-- sku -->
                        <div class="mini-row">
                            <label>{{ $t('SKU') }}:</label>
                            <span>
                                <fig-form-input
                                    v-if="editInventoryColumn"
                                    v-model="size.sku"
                                    size="sm" />
                                <template v-else>{{ size.sku }}</template>
                            </span>
                        </div>

                        <!-- barcode -->
                        <div class="mini-row">
                            <label>{{ $t('Barcode') }}:</label>
                            <span>
                                <fig-form-input
                                    v-if="editInventoryColumn"
                                    v-model="size.barcode"
                                    size="sm" />
                                <template v-else>{{ size.barcode }}</template>
                            </span>
                        </div>

                        <!-- track quantity -->
                        <div class="mini-row">
                            <label>{{ $t('Track inventory') }}:</label>
                            <span>
                                <fig-form-checkbox
                                    v-if="editInventoryColumn"
                                    v-model="size.track_inventory_count" />
                                <template v-else>{{ size.track_inventory_count }}</template>
                            </span>
                        </div>

                        <!-- continue selling when out of stock -->
                        <div class="mini-row">
                            <label>{{ $t('Continue selling when out of stock') }}:</label>
                            <span>
                                <fig-form-checkbox
                                    v-if="editInventoryColumn"
                                    v-model="size.visible_if_no_inventory" />
                                <template v-else>{{ size.visible_if_no_inventory }}</template>
                            </span>
                        </div>
                    </b-td>

                    <!-- price -->
                    <b-td class="align-top mini-table" :class="{'mini-table-edit': editPriceColumn}">
                        <div class="mini-row">
                            <span>
                                <fig-form-checkbox
                                    v-if="editPriceColumn"
                                    v-model="size.use_color_price">{{ $t('Use color pricing') }}</fig-form-checkbox>
                                <template v-if="!editPriceColumn && size.use_color_price">
                                    {{ $t('Use color pricing') }}
                                </template>
                            </span>
                        </div>

                        <template v-if="!size.use_color_price">
                            <!-- price -->
                            <div class="mini-row">
                                <label>{{ $t('Price') }}:</label>
                                <span>
                                    <fig-form-input-money
                                        v-if="editPriceColumn"
                                        v-model="size.base_price"
                                        size="sm" />
                                    <template v-else>${{ size.base_price }}</template>
                                </span>
                            </div>

                            <!-- compare at price -->
                            <div class="mini-row">
                                <label>{{ $t('Compare at price') }}:</label>
                                <span>
                                    <fig-form-input-money
                                        v-if="editPriceColumn"
                                        v-model="size.compare_at_price"
                                        size="sm" />
                                    <template v-else>${{ size.compare_at_price }}</template>
                                </span>
                            </div>

                            <!-- cost per item -->
                            <div class="mini-row">
                                <label>{{ $t('Cost per item') }}:</label>
                                <span>
                                    <fig-form-input-money
                                        v-if="editPriceColumn"
                                        v-model="size.cost_price"
                                        size="sm" />
                                    <template v-else>${{ size.cost_price }}</template>
                                </span>
                            </div>
                        </template>
                    </b-td>

                    <!-- actions -->
                    <b-td class="text-center">
                        <pop-confirm
                            @onConfirm="removeSelectedSize(index)">
                            {{ $t('Delete this item?') }}

                            <fig-button
                                slot="reference"
                                variant="plain"
                                dotted
                                icon="trash"
                                class="mls" />
                        </pop-confirm>
                    </b-td>
                </b-tr>
            </draggable>
        </b-table-simple>

        <div class="pt-2">
            <fig-button
                variant="primary"
                size="sm"
                @click="addRow"
                icon="plus">{{ $t('Add Size') }}</fig-button>
        </div>
    </div>
</template>


<style lang="scss">
.handle {
    cursor: grab;
}

.header-icon {
    margin: -3px 0 0 5px;
    cursor: pointer;
}

.mini-table {
    font-size: 12px;

    .mini-row {
        display: table-row;

        > label, > span {
            display: table-cell;
        }
        > label {
            padding-right: 2px;
        }

        input[type="text"] {
            width: 150px;
        }
        input[type="number"] {
            width: 85px;
            flex: none;
        }
    }
}

.mini-table-edit {
    .mini-row {
        display: block;
        margin-bottom: 5px;

        > label, > span {
            display: block;
        }
        > label {
            padding-right: 0;
        }
    }
}
</style>


