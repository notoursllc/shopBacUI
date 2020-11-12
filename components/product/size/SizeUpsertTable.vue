<script>
import isObject from 'lodash.isobject';
import draggable from 'vuedraggable';
import InputMoney from '@/components/InputMoney';
import PopConfirm from '@/components/PopConfirm';
import SizeInput from '@/components/product/size/SizeInput';
import NumberInput from '@/components/NumberInput';
import CountrySelect from '@/components/CountrySelect';
import InputAppendCheckbox from '@/components/product/size/formInputs/InputAppendCheckbox';
import {
    BTooltip,
    BPopover
} from 'bootstrap-vue';


export default {
    name: 'SizeUpsertTable',

    components: {
        draggable,
        BTooltip,
        BPopover,
        InputMoney,
        PopConfirm,
        SizeInput,
        NumberInput,
        CountrySelect,
        InputAppendCheckbox
    },

    props: {
        color: {
            type: Object,
            default: () => {
                return {};
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
        color: {
            handler(newVal) {
                if(isObject(newVal)) {
                    if(Array.isArray(newVal.sizes)) {
                        this.sizes = [
                            ...newVal.sizes
                        ];
                    }
                    else {
                        this.sizes = [];
                    }
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
                track_quantity: true,
                visible_if_out_of_stock: true,
                compare_at_price_inherit: true,
                cost_price_inherit: true,
                weight_oz_inherit: true
            });

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
            <div class="text-right" id="header-container">
                <b-button
                    variant="outline-secondary"
                    size="sm"
                    v-b-tooltip.hover.left="$t('Bulk edit')"
                    @click="toggleBulkEdit"
                    id="bulk-edit-button">
                    <fig-icon icon="list-check" stroke-width="1.5" width="20" height="20" />
                </b-button>

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
                            <b-form-checkbox
                                v-model="bulkEditInputToggle.base_price"
                                @input="(val) => { onBulkEditRegister(['base_price', 'base_price_inherit'], val) }">
                                {{ $t('Price') }}
                            </b-form-checkbox>
                        </label>
                        <span>
                            <input-append-checkbox
                                v-if="bulkEdit.hasOwnProperty('base_price')"
                                v-model="bulkEdit.base_price_inherit">
                                <template slot-scope="scope">
                                    <input-money
                                        :disabled="scope.checked"
                                        v-model="bulkEdit.base_price" />
                                </template>
                            </input-append-checkbox>
                        </span>
                    </div>

                    <!-- compare at -->
                    <div class="bulk-edit-row">
                        <label>
                            <b-form-checkbox
                                v-model="bulkEditInputToggle.compare_at_price"
                                @input="(val) => { onBulkEditRegister(['compare_at_price', 'compare_at_price_inherit'], val) }">
                                {{ $t('Compare at') }}
                            </b-form-checkbox>
                        </label>
                        <span>
                            <input-append-checkbox
                                v-if="bulkEdit.hasOwnProperty('compare_at_price')"
                                v-model="bulkEdit.compare_at_price_inherit">
                                <template slot-scope="scope">
                                    <input-money
                                        :disabled="scope.checked"
                                        v-model="bulkEdit.compare_at_price" />
                                </template>
                            </input-append-checkbox>
                        </span>
                    </div>

                    <!-- cost per item -->
                    <div class="bulk-edit-row">
                        <label>
                            <b-form-checkbox
                                v-model="bulkEditInputToggle.cost_price"
                                @input="(val) => { onBulkEditRegister(['cost_price', 'cost_price_inherit'], val) }">
                                {{ $t('Cost per item') }}
                            </b-form-checkbox>
                        </label>
                        <span>
                            <input-append-checkbox
                                v-if="bulkEdit.hasOwnProperty('cost_price')"
                                v-model="bulkEdit.cost_price_inherit">
                                <template slot-scope="scope">
                                    <input-money
                                        :disabled="scope.checked"
                                        v-model="bulkEdit.cost_price" />
                                </template>
                            </input-append-checkbox>
                        </span>
                    </div>

                    <!-- weight -->
                    <div class="bulk-edit-row">
                        <label>
                            <b-form-checkbox
                                v-model="bulkEditInputToggle.weight_oz"
                                @input="(val) => { onBulkEditRegister(['weight_oz', 'weight_oz_inherit'], val) }">
                                {{ $t('Weight (oz)') }}
                            </b-form-checkbox>
                        </label>
                        <span>
                            <input-append-checkbox
                                v-if="bulkEdit.hasOwnProperty('weight_oz')"
                                v-model="bulkEdit.weight_oz_inherit">
                                <template slot-scope="scope">
                                    <b-form-input
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
                            <b-form-checkbox
                                v-model="bulkEditInputToggle.visible_if_out_of_stock"
                                @input="(val) => { onBulkEditRegister('visible_if_out_of_stock', val) }">
                                {{ $t('When out of stock') }}
                            </b-form-checkbox>
                        </label>
                        <span>
                            <div v-if="bulkEdit.hasOwnProperty('visible_if_out_of_stock')">
                                <b-form-select
                                    v-model="bulkEdit.visible_if_out_of_stock"
                                    :options="whenOutOfStockOptions"
                                    size="sm" />
                            </div>
                        </span>
                    </div>

                    <!-- Country of origin -->
                    <div class="bulk-edit-row">
                        <label>
                            <b-form-checkbox
                                v-model="bulkEditInputToggle.customs_country_of_origin"
                                @input="(val) => { onBulkEditRegister(['customs_country_of_origin', 'customs_country_of_origin_inherit'], val) }">
                                {{ $t('Country of origin') }}
                            </b-form-checkbox>
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
                        <b-button
                            variant="primary"
                            size="sm"
                            @click="onClickApplyBulkEdit"
                            class="mr-2">{{ $t('Apply') }}</b-button>

                        <b-button
                            variant="light"
                            size="sm"
                            @click="onClickCancelBulkEdit">{{ $t('Cancel') }}</b-button>
                    </div>

                </b-popover>
            </div>
        </div>

        <b-table-simple
            hover
            small
            responsive
            table-class="bread-table"
            v-show="sizes.length">

            <b-thead>
                <b-tr>
                    <b-th v-if="sizes.length > 1" class="width50"></b-th>
                    <b-th>{{ $t('Size') }}</b-th>
                    <b-th>{{ $t('Quantity') }}</b-th>
                    <b-th>{{ $t('SKU') }}</b-th>
                    <b-th>{{ $t('Price') }}</b-th>
                    <b-th>{{ $t('Compare at') }}</b-th>
                    <b-th>{{ $t('Cost per item') }}</b-th>
                    <b-th>{{ $t('Weight (oz)') }}</b-th>
                    <b-th class="width100"></b-th>
                </b-tr>
            </b-thead>

            <draggable
                v-model="sizes"
                @update="emitInput"
                ghost-class="ghost"
                handle=".handle"
                tag="b-tbody">

                <template v-for="(size, index) in sizes">
                    <b-tr
                        :key="index"
                        :class="{'visible-details': visibleDetailsRow === index}">
                        <!-- handle -->
                        <b-td v-if="sizes.length > 1">
                            <i class="handle">
                                <fig-icon icon="dots-vertical-double" />
                            </i>
                        </b-td>

                        <!-- size -->
                        <b-td>
                            <size-input
                                v-model="size.label"
                                @input="emitInput"
                                size="sm" />
                        </b-td>

                        <!-- quantity -->
                        <b-td>
                            <number-input
                                v-model="size.inventory_count"
                                :min="0"
                                size="sm" />
                        </b-td>

                        <!-- sku -->
                        <b-td>
                            <b-form-input
                                v-model="size.sku"
                                size="sm"
                                @input="emitInput" />
                        </b-td>

                        <!-- price -->
                        <b-td class="text-center">
                            <input-append-checkbox
                                v-model="size.base_price_inherit">
                                <template slot-scope="scope">
                                    <input-money
                                        :disabled="scope.checked"
                                        v-model="size.base_price" />
                                </template>
                            </input-append-checkbox>
                        </b-td>

                        <!-- compare at price -->
                        <b-td class="text-center">
                            <input-append-checkbox
                                v-model="size.compare_at_price_inherit">
                                <template slot-scope="scope">
                                    <input-money
                                        :disabled="scope.checked"
                                        v-model="size.compare_at_price" />
                                </template>
                            </input-append-checkbox>
                        </b-td>

                        <!-- cost per item -->
                        <b-td class="text-center">
                            <input-append-checkbox
                                v-model="size.cost_price_inherit">
                                <template slot-scope="scope">
                                    <input-money
                                        :disabled="scope.checked"
                                        v-model="size.cost_price" />
                                </template>
                            </input-append-checkbox>
                        </b-td>

                        <!-- weight -->
                        <b-td>
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
                                        @input="emitInput" />
                                </template>
                            </input-append-checkbox>
                        </b-td>

                        <!-- actions -->
                        <b-td class="text-right nowrap">
                            <b-button
                                variant="outline-secondary"
                                @click="onClickMoreColorBtn(index)"
                                size="sm"
                                class="m-l-1">{{ $t('more') }}</b-button>

                            <pop-confirm
                                @onConfirm="removeRow(index)">
                                {{ $t('Delete this row?') }}

                                <b-button
                                    slot="reference"
                                    variant="outline-secondary"
                                    class="mls border-dashed-2"
                                    size="sm">
                                    <fig-icon icon="trash" stroke-width="1px" width="18" height="18" />
                                </b-button>
                            </pop-confirm>
                        </b-td>
                    </b-tr>

                    <!-- more details row -->
                    <transition name="dropdown" :key="`${index}_details`">
                        <b-tr
                            :class="{'visible-details': visibleDetailsRow === index}"
                            v-if="visibleDetailsRow === index">
                            <b-td :colspan="sizes.length > 1 ? 11 : 10" class="p-3">
                                <!-- track quantity -->
                                <b-form-group
                                    :label="$t('Track quantity')"
                                    label-for="size_track_qty">
                                    <b-form-checkbox
                                        v-model="size.track_quantity"
                                        @input="emitInput"
                                        id="size_track_qty" />
                                </b-form-group>

                                <!-- When out of stock -->
                                <b-form-group
                                    :label="$t('When out of stock')"
                                    label-for="size_out_of_stock">
                                    <b-form-select
                                        v-model="size.visible_if_out_of_stock"
                                        @input="emitInput"
                                        id="size_out_of_stock">
                                        <b-form-select-option :value="true">{{ $t('Continue selling') }}</b-form-select-option>
                                        <b-form-select-option :value="false">{{ $t('Hide') }}</b-form-select-option>
                                    </b-form-select>
                                </b-form-group>

                                <!-- barcode -->
                                <b-form-group
                                    :label="$t('Barcode')"
                                    label-for="size_barcode"
                                    :description="$t('sku_barcode_description')">
                                    <b-form-input
                                        v-model="size.barcode"
                                        @input="emitInput"
                                        id="size_barcode" />
                                </b-form-group>

                                <!-- country of origin -->
                                <b-form-group
                                    :label="$t('Country of origin')"
                                    label-for="sku_customs_country_of_origin"
                                    :description="$t('customs_country_of_origin_desc')">
                                    <input-append-checkbox
                                        v-model="size.customs_country_of_origin_inherit">
                                        <template slot-scope="scope">
                                            <country-select
                                                :disabled="scope.checked"
                                                v-model="size.customs_country_of_origin"
                                                class="widthAll" />
                                        </template>
                                    </input-append-checkbox>
                                </b-form-group>
                            </b-td>
                        </b-tr>
                    </transition>
                </template>
            </draggable>
        </b-table-simple>

        <div class="pt-2">
            <b-button
                variant="primary"
                size="sm"
                @click="addRow">
                <fig-icon icon="plus" /> {{ $t('Add Size') }}
            </b-button>
        </div>
    </div>
</template>


<style lang="scss">
.handle {
    cursor: grab;
}

.bread-table {
    th {
        font-size: 14px;
        text-align: center;
    }

    input:disabled {
        opacity: .5;
    }

    .vs--disabled .vs__dropdown-toggle {
        background-color: #d8dbe0;
        opacity: .5;
    }

    .input-group-append .input-group-text {
        background-color: #f1f2f3;
    }

    .visible-details > td {
        border-top: 0 !important;
        background-color: #f2fdec;
    }
}

.header-icon {
    margin: -3px 0 0 5px;
    cursor: pointer;
}

.no-flex-wrap {
    flex-wrap: nowrap !important
}

.bulk-edit-row {
    // display: table-row;
    display: block;
    padding-bottom: 5px;

    >label, >span {
        // display: table-cell;
        display: block;

    }
    >label {
        padding-right: 5px;
        vertical-align: top;
    }
}
</style>


