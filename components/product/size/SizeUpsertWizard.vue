<script>
import isObject from 'lodash.isobject';
import draggable from 'vuedraggable';
import PopConfirm from '@/components/PopConfirm';
import SizeInput from '@/components/product/size/SizeInput';
import NumberInput from '@/components/NumberInput';
import CountrySelect from '@/components/CountrySelect';
import InputAppendCheckbox from '@/components/product/size/formInputs/InputAppendCheckbox';
import {
    BTooltip,
    BPopover,
    BCard,
    BCardHeader
} from 'bootstrap-vue';

import {
    FigFormGroup,
    FigFormCheckbox,
    FigFormInputMoney,
    FigFormInput,
    FigButton
} from '@notoursllc/figleaf';


export default {
    name: 'SizeUpsertWizard',

    components: {
        draggable,
        BTooltip,
        BPopover,
        PopConfirm,
        SizeInput,
        NumberInput,
        CountrySelect,
        InputAppendCheckbox,
        BCard,
        BCardHeader,
        FigFormCheckbox,
        FigFormGroup,
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
            sizes: [],
            visibleDetailsRow: null,
            showBulkEdit: false,
            bulkEdit: {},
            bulkEditInputToggle: {},
            whenOutOfStockOptions: [
                { text: this.$t('Continue selling'), value: true },
                { text: this.$t('Hide'), value: false }
            ]
        };
    },

    watch: {
        value: {
            handler(newVal) {
                if(Array.isArray(newVal)) {
                    // mapping the value into a new array
                    this.sizes = [
                        ...newVal
                    ];
                }
                else {
                    this.sizes = [];
                }
            },
            immediate: true
        }
    },

    methods: {
        emitInput() {
            this.$emit('input', this.sizes);
        },

        removeRow(index) {
            this.sizes.splice(index, 1);
            this.emitInput();
        },

        addRow() {
            this.sizes.splice(this.sizes.length, 1, {
                ordinal: this.sizes.length,
                label: null,
                base_price: null,
                base_price_inherit: true,
                visible_if_no_inventory: true,
                compare_at_price: null,
                compare_at_price_inherit: true,
                cost_price_inherit: true,
                weight_oz_inherit: true,
                inventory_count: 0,
                track_inventory_count: true,
                sku: null,
                barcode: null,
                customs_country_of_origin: null
            });
            // this.sizes.push({});

            this.emitInput();
        },

        onClickMoreColorBtn(index) {
            this.visibleDetailsRow = this.visibleDetailsRow === index ? null : index;
        },

        getInheritTooltip(useColorVal) {
            return useColorVal ? this.$t('This value is being inherited from the Color') : this.$t('Check to inherit value from the Color');
        },

        toggleBulkEdit() {
            this.showBulkEdit = !this.showBulkEdit;
        },

        onClickApplyBulkEdit() {
            for (const key in this.bulkEdit) {
                this.sizes.forEach((size) => {
                    this.$set(size, key, this.bulkEdit[key]);
                    this.emitInput();
                });
            }

            this.toggleBulkEdit();
        },

        onClickCancelBulkEdit() {
            this.toggleBulkEdit();
        },

        onBulkEditRegister(key, val) {
            // remove from register
            if(!val) {
                const removeKeys = Array.isArray(key) ? key : [key];

                removeKeys.forEach((k) => {
                    this.$delete(this.bulkEdit, k);
                });
            }
            // add to register
            else {
                const addKeys = Array.isArray(key) ? key : [key];

                addKeys.forEach((k) => {
                    this.$set(this.bulkEdit, k, null);
                });
            }
        }
    }
};
</script>


<template>
    <div>
        <div class="pb-2" v-if="sizes.length">

            <div class="d-flex flex-row align-items-center pb-2">
                <div class="flex-fill">
                    <div class="d-inline-block pr-2 text-sm">{{ $t('Created') }}:</div>
                    <div class="d-inline-block">
                        <draggable
                            v-model="sizes"
                            @update="emitInput"
                            ghost-class="ghost"
                            handle=".size-btn"
                            tag="div">
                            <fig-button
                                v-for="(size, idx) in sizes"
                                :key="idx"
                                variant="success-outline"
                                class="mr-2 size-btn handle"
                                size="sm"
                                :href="`#size-card-${idx}`">{{ size.label }}</fig-button>
                        </draggable>
                    </div>
                </div>

                <div id="header-container">
                    <fig-button
                        variant="plain"
                        size="sm"
                        @click="toggleBulkEdit"
                        icon="list-check"
                        id="bulk-edit-button">{{ $t('Bulk edit') }}</fig-button>

                    <b-popover
                        target="bulk-edit-button"
                        triggers="click"
                        :show.sync="showBulkEdit"
                        placement="auto"
                        container="header-container"
                        ref="popover">

                        <template #title>{{ $t('Update all sizes') }}</template>

                        <!-- price -->
                        <div class="bulk-edit-row">
                            <label>
                                <fig-form-checkbox
                                    v-model="bulkEditInputToggle.base_price"
                                    @input="(val) => { onBulkEditRegister(['base_price', 'base_price_inherit'], val) }">
                                    {{ $t('Price') }}
                                </fig-form-checkbox>
                            </label>
                            <span>
                                <input-append-checkbox
                                    v-if="bulkEdit.hasOwnProperty('base_price')"
                                    v-model="bulkEdit.base_price_inherit">
                                    <template slot-scope="scope">
                                        <fig-form-input-money
                                            :disabled="scope.checked"
                                            v-model="bulkEdit.base_price"
                                            size="sm" />
                                    </template>
                                </input-append-checkbox>
                            </span>
                        </div>

                        <!-- compare at -->
                        <div class="bulk-edit-row">
                            <label>
                                <fig-form-checkbox
                                    v-model="bulkEditInputToggle.compare_at_price"
                                    @input="(val) => { onBulkEditRegister(['compare_at_price', 'compare_at_price_inherit'], val) }">
                                    {{ $t('Compare at') }}
                                </fig-form-checkbox>
                            </label>
                            <span>
                                <input-append-checkbox
                                    v-if="bulkEdit.hasOwnProperty('compare_at_price')"
                                    v-model="bulkEdit.compare_at_price_inherit">
                                    <template slot-scope="scope">
                                        <fig-form-input-money
                                            :disabled="scope.checked"
                                            v-model="bulkEdit.compare_at_price"
                                            size="sm" />
                                    </template>
                                </input-append-checkbox>
                            </span>
                        </div>

                        <!-- cost per item -->
                        <div class="bulk-edit-row">
                            <label>
                                <fig-form-checkbox
                                    v-model="bulkEditInputToggle.cost_price"
                                    @input="(val) => { onBulkEditRegister(['cost_price', 'cost_price_inherit'], val) }">
                                    {{ $t('Cost per item') }}
                                </fig-form-checkbox>
                            </label>
                            <span>
                                <input-append-checkbox
                                    v-if="bulkEdit.hasOwnProperty('cost_price')"
                                    v-model="bulkEdit.cost_price_inherit">
                                    <template slot-scope="scope">
                                        <fig-form-input-money
                                            :disabled="scope.checked"
                                            v-model="bulkEdit.cost_price"
                                            size="sm" />
                                    </template>
                                </input-append-checkbox>
                            </span>
                        </div>

                        <!-- weight -->
                        <div class="bulk-edit-row">
                            <label>
                                <fig-form-checkbox
                                    v-model="bulkEditInputToggle.weight_oz"
                                    @input="(val) => { onBulkEditRegister(['weight_oz', 'weight_oz_inherit'], val) }">
                                    {{ $t('Weight (oz)') }}
                                </fig-form-checkbox>
                            </label>
                            <span>
                                <input-append-checkbox
                                    v-if="bulkEdit.hasOwnProperty('weight_oz')"
                                    v-model="bulkEdit.weight_oz_inherit">
                                    <template slot-scope="scope">
                                        <fig-form-input
                                            :disabled="scope.checked"
                                            v-model="bulkEdit.weight_oz"
                                            type="number"
                                            :step=".01"
                                            :min="0"
                                            size="sm"
                                            @input="emitInput" />
                                    </template>
                                </input-append-checkbox>
                            </span>
                        </div>

                        <!-- when out of stock -->
                        <div class="bulk-edit-row">
                            <label>
                                <fig-form-checkbox
                                    v-model="bulkEditInputToggle.visible_if_no_inventory"
                                    @input="(val) => { onBulkEditRegister('visible_if_no_inventory', val) }">
                                    {{ $t('When out of stock') }}
                                </fig-form-checkbox>
                            </label>
                            <span>
                                <div v-if="bulkEdit.hasOwnProperty('visible_if_no_inventory')">
                                    <b-form-select
                                        v-model="bulkEdit.visible_if_no_inventory"
                                        :options="whenOutOfStockOptions"
                                        size="sm" />
                                </div>
                            </span>
                        </div>

                        <!-- Country of origin -->
                        <div class="bulk-edit-row">
                            <label>
                                <fig-form-checkbox
                                    v-model="bulkEditInputToggle.customs_country_of_origin"
                                    @input="(val) => { onBulkEditRegister(['customs_country_of_origin', 'customs_country_of_origin_inherit'], val) }">
                                    {{ $t('Country of origin') }}
                                </fig-form-checkbox>
                            </label>
                            <span>
                                <input-append-checkbox
                                    v-if="bulkEdit.hasOwnProperty('customs_country_of_origin')"
                                    v-model="bulkEdit.customs_country_of_origin_inherit">
                                    <template slot-scope="scope">
                                        <country-select
                                            size="sm"
                                            :disabled="scope.checked"
                                            v-model="bulkEdit.customs_country_of_origin"
                                            :right-radius="false"
                                            class="widthAll" />
                                    </template>
                                </input-append-checkbox>
                            </span>
                        </div>


                        <div class="text-center pt-2">
                            <fig-button
                                variant="primary"
                                size="sm"
                                @click="onClickApplyBulkEdit"
                                class="mr-2">{{ $t('Apply') }}</fig-button>

                            <fig-button
                                variant="plain"
                                size="sm"
                                @click="onClickCancelBulkEdit">{{ $t('Cancel') }}</fig-button>
                        </div>

                    </b-popover>
                </div>


            </div>


        </div>


        <draggable
            v-model="sizes"
            @update="emitInput"
            ghost-class="ghost"
            handle=".handle"
            class="size-card-list"
            tag="div">
            <b-card
                v-for="(size, index) in sizes"
                :key="index"
                body-class="p-0"
                class="mb-4"
                :id="`size-card-${index}`">
                <b-card-header header-class="p-2">

                    <div class="d-flex flex-row align-items-center">
                        <div class="flex-fill">
                            <size-input
                                v-model="size.label"
                                @input="emitInput"
                                size="md"
                                :placeholder="$t('Choose a size')"
                                class="size-select" />

                            <pop-confirm
                                @onConfirm="removeRow(index)">
                                {{ $t('Delete this size?') }}

                                <i slot="reference" class="ml-3 cursorPointer">
                                    <fig-icon icon="trash" stroke-width="1px" width="20" height="20" />
                                </i>
                            </pop-confirm>
                        </div>

                        <i class="handle">
                            <fig-icon icon="dots-vertical-double" />
                        </i>
                    </div>
                </b-card-header>

                <b-container class="d-flex flex-row flex-wrap">
                    <!-- left column -->
                    <div class="flex-fill px-3 py-2">
                        <!-- inventory -->
                        <fig-form-group class="mb-3">
                            <label for="size_qty" slot="label" class="text-sm p-0">
                                {{ $t('Inventory') }}
                            </label>

                            <number-input
                                v-model="size.inventory_count"
                                :min="0"
                                size="sm"
                                id="size_qty" />

                            <div class="pt-1">
                                <fig-form-checkbox
                                    v-model="size.track_inventory_count"
                                    @input="emitInput">{{ $t('Track inventory') }}</fig-form-checkbox>
                            </div>

                            <div>
                                <fig-form-checkbox
                                    v-model="size.visible_if_no_inventory"
                                    @input="emitInput">{{ $t('Hide when out of stock') }}</fig-form-checkbox>
                            </div>
                        </fig-form-group>

                        <!-- sku -->
                        <fig-form-group>
                            <label for="size_sku" slot="label" class="text-sm p-0">
                                {{ $t('SKU') }}
                            </label>

                            <fig-form-input
                                v-model="size.sku"
                                size="sm"
                                @input="emitInput"
                                id="size_sku" />
                        </fig-form-group>
                    </div>

                    <!-- middle column -->
                    <div class="flex-fill px-3 py-2">
                        <!-- price -->
                        <fig-form-group class="mb-2">
                            <label for="size_price" slot="label" class="text-sm p-0">
                                {{ $t('Price') }}
                            </label>

                            <input-append-checkbox
                                v-model="size.base_price_inherit">
                                <template slot-scope="scope">
                                    <fig-form-input-money
                                        :disabled="scope.checked"
                                        v-model="size.base_price"
                                        id="size_price"
                                        size="sm" />
                                </template>
                            </input-append-checkbox>
                        </fig-form-group>

                        <!-- compare at -->
                        <fig-form-group class="mb-2">
                            <label for="size_price_compare_at" slot="label" class="text-sm p-0">
                                {{ $t('Compare at') }}
                            </label>

                            <input-append-checkbox
                                v-model="size.compare_at_price_inherit">
                                <template slot-scope="scope">
                                    <fig-form-input-money
                                        :disabled="scope.checked"
                                        v-model="size.compare_at_price"
                                        id="size_price_compare_at"
                                        size="sm" />
                                </template>
                            </input-append-checkbox>
                        </fig-form-group>

                        <!-- cost per item -->
                        <fig-form-group>
                            <label for="size_price_cost" slot="label" class="text-sm p-0">
                                {{ $t('Cost') }}
                            </label>

                            <input-append-checkbox
                                v-model="size.cost_price_inherit">
                                <template slot-scope="scope">
                                    <fig-form-input-money
                                        :disabled="scope.checked"
                                        v-model="size.cost_price"
                                        id="size_price_cost"
                                        size="sm" />
                                </template>
                            </input-append-checkbox>
                        </fig-form-group>
                    </div>

                    <!-- right column -->
                    <div class="flex-fill px-3 py-2">
                        <!-- weight -->
                        <fig-form-group class="pb-2">
                            <label for="size_weight" slot="label" class="text-sm p-0">
                                {{ $t('Weight (oz)') }}
                            </label>

                            <input-append-checkbox
                                v-model="size.weight_oz_inherit">
                                <template slot-scope="scope">
                                    <b-form-input
                                        :disabled="scope.checked"
                                        v-model="size.weight_oz"
                                        type="number"
                                        :step=".01"
                                        :min="0"
                                        size="sm"
                                        @input="emitInput"
                                        id="size_weight" />
                                </template>
                            </input-append-checkbox>
                        </fig-form-group>

                        <!-- barcode -->
                        <fig-form-group class="pb-2">
                            <label for="size_barcode" slot="label" class="text-sm p-0">
                                {{ $t('Barcode') }}
                                <i v-b-tooltip.hover.top="$t('sku_barcode_description')">
                                    <fig-icon icon="info-circle" width="16" height="16" />
                                </i>
                            </label>

                            <fig-form-input
                                v-model="size.barcode"
                                @input="emitInput"
                                size="sm"
                                id="size_barcode" />
                        </fig-form-group>

                        <!-- country of origin -->
                        <fig-form-group>
                            <label for="size_origin" slot="label" class="text-sm p-0">
                                {{ $t('Country of origin') }}
                                <i v-b-tooltip.hover.top="$t('customs_country_of_origin_desc')">
                                    <fig-icon icon="info-circle" width="16" height="16" />
                                </i>
                            </label>

                            <input-append-checkbox
                                v-model="size.customs_country_of_origin_inherit">
                                <template slot-scope="scope">
                                    <country-select
                                        :disabled="scope.checked"
                                        v-model="size.customs_country_of_origin"
                                        size="sm"
                                        class="widthAll"
                                        id="size_origin" />
                                </template>
                            </input-append-checkbox>
                        </fig-form-group>
                    </div>

                </b-container>
            </b-card>
        </draggable>


        <div>
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
    cursor: grab !important;
}

.size-select {
    input, button {
        border: 1px solid #2eb85c !important;
    }
}

// zebra striping the cards to they are a bit easier to differentiate
.size-card-list .card:nth-child(odd) {
    background-color: #f5f5f5;
}

.bulk-edit-row {
    display: block;
    padding-bottom: 5px;

    >label, >span {
        display: block;
    }
    >label {
        padding-right: 5px;
        vertical-align: top;
    }
}
</style>


