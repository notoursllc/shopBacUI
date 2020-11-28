<script>
import isObject from 'lodash.isobject';
import draggable from 'vuedraggable';
import PopConfirm from '@/components/PopConfirm';
import BooleanTag from '@/components/BooleanTag';
import SizeInput from '@/components/product/size/SizeInput';
import SizeCardDetailsView from '@/components/product/size/sizeCard/SizeCardDetailsView';
import SizeCardEditView from '@/components/product/size/sizeCard/SizeCardEditView';
import UsingColorValueBadge from '@/components/product/size/sizeCard/UsingColorValueBadge';

import {
    BTooltip,
    BPopover,
    BCard,
    BCardHeader
} from 'bootstrap-vue';

import {
    FigFormGroup,
    FigFormCheckbox,
    FigFormInput,
    FigButton,
    FigFormSelect,
    FigFormInputNumber,
    FigFormInputMoney,
    FigFormInputToggle,
    FigFormSelectCountry,
    FigBadge
} from '@notoursllc/figleaf';


export default {
    name: 'SizeUpsertWizard',

    components: {
        draggable,
        BTooltip,
        BPopover,
        PopConfirm,
        BooleanTag,
        SizeInput,
        SizeCardDetailsView,
        BCard,
        BCardHeader,
        FigFormCheckbox,
        FigFormGroup,
        FigFormInput,
        FigButton,
        FigFormSelect,
        FigFormInputNumber,
        FigFormInputMoney,
        FigFormInputToggle,
        FigFormSelectCountry,
        FigBadge,
        SizeCardDetailsView,
        SizeCardEditView,
        UsingColorValueBadge
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
                { label: this.$t('Continue selling'), value: true },
                { label: this.$t('Hide'), value: false }
            ],
            allOpened: false
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

        addSize() {
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
                customs_country_of_origin: null,

                // meta data that should be removed before saving:
                opened: true
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

        toggleAllFormOpened() {
            this.allOpened = !this.allOpened;

            this.sizes.forEach((size) => {
                size.opened = this.allOpened;
            });
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
        },

        getInheritValueTooltip(useColorVal) {
            return useColorVal ? this.$t('This value is being inherited from the Color') : this.$t('Check to inherit value from the Color');
        },

        updateSize(index, obj) {
            if(isObject(obj)) {
                for(const prop in obj) {
                    this.$set(this.sizes[index], prop, obj[prop]);
                }
            }
        }
    }
};
</script>


<template>
    <div>
        <div class="pb-2" v-if="sizes.length">

            <div class="d-flex flex-row align-items-center pb-2">

                <!-- created button list -->
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
                                variant="success"
                                class="mr-2 size-btn handle"
                                size="sm"
                                :href="`#size-card-${idx}`">{{ size.label }}</fig-button>
                        </draggable>
                    </div>
                </div>


                <!-- bulk edit button/popup -->
                <div id="header-container" v-if="sizes.length > 1">
                    <fig-button
                        variant="plain"
                        size="sm"
                        @click="toggleAllFormOpened"
                        :icon="allOpened ? 'chevron-up' : 'chevron-down'"
                        class="mr-2">{{ allOpened ? $t('Collapse all') : $t('Expand all') }}</fig-button>

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
                            <div class="bulk-edit-cell">
                                <fig-form-checkbox
                                    v-model="bulkEditInputToggle.base_price"
                                    @input="(val) => { onBulkEditRegister(['base_price', 'base_price_inherit'], val) }"
                                    id="bulk-edit-price" />
                            </div>

                            <div class="bulk-edit-cell pl-2">
                                <div class="bulk-edit-label">
                                    <label for="bulk-edit-price">{{ $t('Price') }}</label>
                                    <fig-form-input-toggle
                                        v-if="bulkEditInputToggle.base_price"
                                        v-model="bulkEdit.base_price_inherit"
                                        size="sm"
                                        variant="success"
                                        inverse />
                                </div>

                                <div v-if="bulkEdit.hasOwnProperty('base_price')">
                                    <div
                                        v-if="bulkEdit.base_price_inherit"
                                        class="bulk-edit-noval">{{ $t('Use color value') }}</div>

                                    <fig-form-input-money
                                        v-else
                                        v-model="bulkEdit.base_price" />
                                </div>
                            </div>
                        </div>


                        <!-- compare at -->
                        <div class="bulk-edit-row">
                            <div class="bulk-edit-cell">
                                <fig-form-checkbox
                                    v-model="bulkEditInputToggle.compare_at_price"
                                    @input="(val) => { onBulkEditRegister(['compare_at_price', 'compare_at_price_inherit'], val) }"
                                    id="bulk-edit-compare-at" />
                            </div>

                            <div class="bulk-edit-cell pl-2">
                                <div class="bulk-edit-label">
                                    <label for="bulk-edit-compare-at">{{ $t('Compare at') }}</label>
                                    <fig-form-input-toggle
                                        v-if="bulkEditInputToggle.compare_at_price"
                                        v-model="bulkEdit.compare_at_price_inherit"
                                        variant="success"
                                        inverse
                                        size="sm" />
                                </div>

                                <div v-if="bulkEdit.hasOwnProperty('compare_at_price')">
                                    <div
                                        v-if="bulkEdit.compare_at_price_inherit"
                                        class="bulk-edit-noval">{{ $t('Use color value') }}</div>

                                    <fig-form-input-money
                                        v-else
                                        v-model="bulkEdit.compare_at_price" />
                                </div>
                            </div>
                        </div>


                        <!-- cost per item -->
                        <div class="bulk-edit-row">
                            <div class="bulk-edit-cell">
                                <fig-form-checkbox
                                    v-model="bulkEditInputToggle.cost_price"
                                    @input="(val) => { onBulkEditRegister(['cost_price', 'cost_price_inherit'], val) }"
                                    id="bulk-edit-cost_price" />
                            </div>
                            <div class="bulk-edit-cell pl-2">
                                <div class="bulk-edit-label">
                                    <label for="bulk-edit-cost_price">{{ $t('Cost per item') }}</label>
                                    <fig-form-input-toggle
                                        v-if="bulkEditInputToggle.cost_price"
                                        v-model="bulkEdit.cost_price_inherit"
                                        variant="success"
                                        size="sm"
                                        inverse />
                                </div>

                                <div v-if="bulkEdit.hasOwnProperty('cost_price')">
                                    <div
                                        v-if="bulkEdit.cost_price_inherit"
                                        class="bulk-edit-noval">{{ $t('Use color value') }}</div>

                                    <fig-form-input-money
                                        v-else
                                        v-model="bulkEdit.cost_price" />
                                </div>
                            </div>
                        </div>


                        <!-- weight -->
                        <div class="bulk-edit-row">
                            <div class="bulk-edit-cell">
                                <fig-form-checkbox
                                    v-model="bulkEditInputToggle.weight_oz"
                                    @input="(val) => { onBulkEditRegister(['weight_oz', 'weight_oz_inherit'], val) }"
                                    id="bulk-edit-weight-oz" />
                            </div>

                            <div class="bulk-edit-cell pl-2">
                                <div class="bulk-edit-label">
                                    <label for="bulk-edit-weight-oz">{{ $t('Weight (oz)') }}</label>
                                    <fig-form-input-toggle
                                        v-if="bulkEditInputToggle.weight_oz"
                                        v-model="bulkEdit.weight_oz_inherit"
                                        variant="success"
                                        size="sm"
                                        inverse />
                                </div>

                                <div v-if="bulkEdit.hasOwnProperty('weight_oz')">
                                    <div
                                        v-if="bulkEdit.weight_oz_inherit"
                                        class="bulk-edit-noval">{{ $t('Use color value') }}</div>

                                    <fig-form-input-number
                                        v-else
                                        type="number"
                                        v-model="bulkEdit.weight_oz"
                                        :step=".01"
                                        :min="0" />
                                </div>
                            </div>
                        </div>


                        <!-- when out of stock -->
                        <div class="bulk-edit-row">
                            <div class="bulk-edit-cell">
                                <fig-form-checkbox
                                    v-model="bulkEditInputToggle.visible_if_no_inventory"
                                    @input="(val) => { onBulkEditRegister('visible_if_no_inventory', val) }" />
                            </div>

                            <div class="bulk-edit-cell pl-2">
                                <label for="bulk-edit-visible-no-inventory">{{ $t('When out of stock') }}</label>

                                <div v-if="bulkEdit.hasOwnProperty('visible_if_no_inventory')">
                                    <fig-form-select
                                        :options="whenOutOfStockOptions"
                                        :reduce="obj => obj.value" />
                                </div>
                            </div>
                        </div>


                        <!-- Country of origin -->
                        <div class="bulk-edit-row">
                            <div class="bulk-edit-cell">
                                <fig-form-checkbox
                                    v-model="bulkEditInputToggle.customs_country_of_origin"
                                    @input="(val) => { onBulkEditRegister(['customs_country_of_origin', 'customs_country_of_origin_inherit'], val) }"
                                    id="bulk-edit-country" />
                            </div>

                            <div class="bulk-edit-cell pl-2">
                                <div class="bulk-edit-label">
                                    <label for="bulk-edit-country">{{ $t('Country of origin') }}</label>
                                    <fig-form-input-toggle
                                        v-if="bulkEditInputToggle.customs_country_of_origin"
                                        v-model="bulkEdit.customs_country_of_origin_inherit"
                                        variant="success"
                                        size="sm"
                                        inverse />
                                </div>

                                <div v-if="bulkEdit.hasOwnProperty('customs_country_of_origin')">
                                    <div
                                        v-if="bulkEdit.customs_country_of_origin_inherit"
                                        class="bulk-edit-noval">{{ $t('Use color value') }}</div>

                                    <fig-form-select-country
                                        v-else
                                        v-model="bulkEdit.customs_country_of_origin"
                                        class="widthAll" />
                                </div>
                            </div>
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



        <!-- size card list -->
        <draggable
            v-model="sizes"
            @update="emitInput"
            ghost-class="ghost"
            handle=".handle"
            class="flex flex-wrap -mx-1"
            tag="div">

            <!-- card -->
            <div
                class="my-2 px-2 w-full sm:w-full md:w-1/2 xl:w-1/3"
                v-for="(size, index) in sizes"
                :key="index">
                <div
                    class="bg-gray-100 border rounded-lg shadow-md"
                    :class="{'border-red-600': !size.label, 'border-gray-200': size.label}">

                    <!-- button header -->
                    <div class="flex flex-row items-center pt-1 px-3">
                        <div class="flex-grow">
                            <i class="handle">
                                <fig-icon icon="dots" />
                            </i>
                        </div>

                        <div>
                            <pop-confirm
                                @onConfirm="removeRow(index)">
                                {{ $t('Delete this size?') }}

                                <i slot="reference" class="ml-3 cursorPointer">
                                    <fig-icon icon="trash" stroke-width="1px" width="20" height="20" />
                                </i>
                            </pop-confirm>
                        </div>
                    </div>

                    <!-- size input -->
                    <div class="p-3 flex items-center flex-grow">
                        <size-input
                            v-model="size.label"
                            @input="emitInput"
                            size="md"
                            :placeholder="$t('Choose a size')"
                            style="min-width:200px" />
                    </div>

                    <!-- body -->
                    <div class="text-sm border-t border-gray-200">
                        <div class="px-2 pt-2 pb-1 text-right">
                            <fig-button
                                @click="$set(size, 'opened', !size.opened)"
                                variant="ghost"
                                :icon="size.opened ? 'chevron-up' : 'chevron-down'"
                                size="sm" />
                        </div>

                        <div class="px-3 pb-3">
                            <!-- details view -->
                            <size-card-details-view
                                v-if="!size.opened"
                                :size="size" />

                            <!-- edit view -->
                            <size-card-edit-view
                                v-else
                                :size="size"
                                @input="obj => $set(size, obj.property, obj.value)" />
                        </div>

                    </div>
                </div>
            </div>
        </draggable>


        <div class="mt-2">
            <fig-button
                variant="primary"
                size="sm"
                @click="addSize"
                icon="plus">{{ $t('Add Size') }}</fig-button>
        </div>
    </div>
</template>


<style lang="postcss">
.handle {
    cursor: grab !important;
}

// zebra striping the cards to they are a bit easier to differentiate
.size-card-list .card:nth-child(odd) {
    background-color: #f5f5f5;
}

.bulk-edit-row {
    @apply table-row;
}
.bulk-edit-cell {
    @apply table-cell pb-1;
}
.bulk-edit-label {
    @apply flex flex-row flex-no-wrap items-center;
    padding-bottom: 2px;
}
.bulk-edit-label .fig-toggle {
    @apply pl-2;
}
.bulk-edit-noval {
    @apply text-gray-500;
}

.size-details-row {
    @apply table-row;
}
.size-details-cell {
    @apply table-cell pb-1;
}
.size-details-row > label {
    @apply font-medium pr-2 pb-1;
}




.formRow {
    display: table-row;
}
.formRow > label {
    padding-right: 10px;
}
.formRow > label,
.formRow > span {
    display: table-cell;
    padding-bottom: 10px;
    vertical-align: top;
}
</style>


