<script>
import isObject from 'lodash.isobject';
import draggable from 'vuedraggable';
import InputMoney from '@/components/InputMoney';
import PopConfirm from '@/components/PopConfirm';
import SizeInput from '@/components/product/size/SizeInput';
import NumberInput from '@/components/NumberInput';
import CountrySelect from '@/components/CountrySelect';
import {
    BInputGroup,
    BInputGroupAppend,
    BTooltip
} from 'bootstrap-vue';


export default {
    name: 'SizeUpsertTable',

    components: {
        draggable,
        BTooltip,
        InputMoney,
        PopConfirm,
        SizeInput,
        NumberInput,
        CountrySelect,
        BInputGroup,
        BInputGroupAppend
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
            visibleDetailsRow: null
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
            this.sizes.push({
                ordinal: this.sizes.length,
                // label: null,
                base_price: null,
                base_price_inherit: true,
                track_quantity: true,
                visible_if_out_of_stock: true,
                compare_at_price_inherit: true,
                cost_price_inherit: true,
                weight_oz_inherit: true
            });
        },

        onClickMoreColorBtn(index) {
            this.visibleDetailsRow = this.visibleDetailsRow === index ? null : index;
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
            v-show="sizes.length">

            <b-thead>
                <!-- <b-tr>
                    <b-th :colspan="sizes.length > 1 ? 3 : 2"></b-th>
                    <b-th colspan="3" class="text-center">click checkboxes to use color price info</b-th>
                    <b-th colspan="5"></b-th>
                </b-tr> -->

                <b-tr>
                    <b-th v-if="sizes.length > 1" class="width50"></b-th>
                    <b-th>{{ $t('Size') }}</b-th>
                    <b-th>{{ $t('Quantity') }}</b-th>
                    <b-th>{{ $t('SKU') }}</b-th>
                    <b-th>{{ $t('Price') }}</b-th>
                    <b-th>{{ $t('Compare at price') }}</b-th>
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
                            <b-input-group size="sm">
                                <input-money
                                    :disabled="size.base_price_inherit"
                                    v-model="size.base_price"
                                    @input="emitInput" />
                                <b-input-group-append is-text>
                                    <b-form-checkbox
                                        v-model="size.base_price_inherit"
                                        @input="emitInput"
                                        plain
                                        v-b-tooltip.hover :title="`${$t('Inherit value from color')}: ${$t(size.base_price_inherit ? 'Yes' : 'No')}`" />
                                </b-input-group-append>
                            </b-input-group>
                        </b-td>

                        <!-- compare at price -->
                        <b-td class="text-center">
                            <b-input-group size="sm">
                                <input-money
                                    :disabled="size.compare_at_price_inherit"
                                    v-model="size.compare_at_price"
                                    @input="emitInput" />
                                <b-input-group-append is-text>
                                    <b-form-checkbox
                                        v-model="size.compare_at_price_inherit"
                                        @input="emitInput"
                                        plain
                                        v-b-tooltip.hover :title="`${$t('Inherit value from color')}: ${$t(size.compare_at_price_inherit ? 'Yes' : 'No')}`" />
                                </b-input-group-append>
                            </b-input-group>
                        </b-td>

                        <!-- cost per item -->
                        <b-td class="text-center">
                            <b-input-group size="sm">
                                <input-money
                                    :disabled="size.cost_price_inherit"
                                    v-model="size.cost_price"
                                    @input="emitInput" />
                                <b-input-group-append is-text>
                                    <b-form-checkbox
                                        v-model="size.cost_price_inherit"
                                        @input="emitInput"
                                        plain
                                        v-b-tooltip.hover :title="`${$t('Inherit value from color')}: ${$t(size.cost_price_inherit ? 'Yes' : 'No')}`" />
                                </b-input-group-append>
                            </b-input-group>
                        </b-td>



                        <!-- weight -->
                        <b-td>
                            <b-input-group size="sm" class="no-flex-wrap">
                                <b-form-input
                                    :disabled="size.weight_oz_inherit"
                                    v-model="size.weight_oz"
                                    type="number"
                                    :step=".01"
                                    :min="0"
                                    size="sm"
                                    @input="emitInput" />
                                <b-input-group-append is-text>
                                    <b-form-checkbox
                                        v-model="size.weight_oz_inherit"
                                        @input="emitInput"
                                        plain
                                        v-b-tooltip.hover :title="`${$t('Inherit value from color')}: ${$t(size.weight_oz_inherit ? 'Yes' : 'No')}`" />
                                </b-input-group-append>
                            </b-input-group>
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

                                <!-- out of stock behavior -->
                                <b-form-group
                                    :label="$t('Out of stock behavior')"
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
                                    <b-input-group class="no-flex-wrap">
                                        <country-select
                                            :disabled="size.customs_country_of_origin_inherit"
                                            v-model="size.customs_country_of_origin"
                                            class="widthAll" />
                                        <b-input-group-append is-text>
                                            <b-form-checkbox
                                                v-model="size.customs_country_of_origin_inherit"
                                                @input="emitInput"
                                                plain
                                                v-b-tooltip.hover :title="`${$t('Inherit value from color')}: ${$t(size.customs_country_of_origin_inherit ? 'Yes' : 'No')}`" />
                                        </b-input-group-append>
                                    </b-input-group>
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
</style>


