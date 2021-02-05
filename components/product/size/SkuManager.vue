<script>
import Vue from 'vue';
import isObject from 'lodash.isobject';
import draggable from 'vuedraggable';
import PopConfirm from '@/components/PopConfirm';
import SizeSelect from '@/components/product/size/SizeSelect';
import UsingColorValueBadge from '@/components/product/size/sizeCard/UsingColorValueBadge';
import Money from '@/components/Money';
import BooleanTag from '@/components/BooleanTag';
import OperationsDropdown from '@/components/OperationsDropdown';

import {
    FigFormCheckbox,
    FigButton,
    FigFormSelect,
    FigFormInputNumber,
    FigFormInputMoney,
    FigFormInputToggle,
    FigFormSelectCountry,
    FigPopover,
    FigFormGroup,
    FigFormInput,
    FigTag,
    FigTooltip,
    FigCountry,
    FigTableSimple,
    FigTh,
    FigTd
} from '@notoursllc/figleaf';

export default Vue.extend({
    name: 'SizeUpsertWizard',

    components: {
        draggable,
        PopConfirm,
        SizeSelect,
        FigFormCheckbox,
        FigButton,
        FigFormSelect,
        FigFormInputNumber,
        FigFormInputMoney,
        FigFormInputToggle,
        FigFormSelectCountry,
        FigPopover,
        FigFormGroup,
        FigFormInput,
        FigTag,
        FigTooltip,
        FigCountry,
        FigTableSimple,
        FigTh,
        FigTd,
        UsingColorValueBadge,
        Money,
        BooleanTag,
        OperationsDropdown
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
            sizes: Array.isArray(this.value) ? this.value : [],
            showBulkEdit: false,
            showBulkEditInputs: {},
            bulkEdit: {},
            whenOutOfStockOptions: [
                { label: this.$t('Continue selling'), value: true },
                { label: this.$t('Hide'), value: false }
            ],
            isDetailsView: false
        };
    },

    watch: {
        sizes: {
            handler(newVal) {
                this.emitInput();
            },
            deep: true
        }
    },

    methods: {
        emitInput() {
            // each size has an 'opened' property that needs to be removed before emitting
            const cleanSizes = [];

            if(Array.isArray(this.sizes)) {
                this.sizes.forEach((size) => {
                    const copy = {...size};
                    cleanSizes.push(copy);
                });
            }

            this.$emit('input', cleanSizes);
        },

        removeRow(index) {
            this.sizes.splice(index, 1);
        },

        addSize() {
            this.sizes.splice(this.sizes.length, 1, {
                ordinal: this.sizes.length,
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
                customs_country_of_origin: null,
            });
        },

        toggleBulkEdit() {
            this.showBulkEdit = !this.showBulkEdit;
        },

        onClickApplyBulkEdit() {
            for (const key in this.bulkEdit) {
                this.sizes.forEach((size) => {
                    this.$set(size, key, this.bulkEdit[key]);
                });
            }
            this.toggleBulkEdit();
        },

        onBulkEditRegister(key, val) {
            // remove from register
            if(!val) {
                this.$delete(this.bulkEdit, key);
            }
            // add to register
            else {
                this.$set(this.bulkEdit, key, null);
            }
        },

        updateSize(index, obj) {
            if(isObject(obj)) {
                for(const prop in obj) {
                    this.$set(this.sizes[index], prop, obj[prop]);
                }
            }
        },

        onBulkEditToggleChange(prop, val) {
            this.$set(this.bulkEdit, prop, !val ? null : '');
        },


        onToggleChange(index, prop, val) {
            this.$set(this.sizes[index], prop, !val ? null : '');
        }
    }
});
</script>


<template>
    <div>
        <div class="pb-4" v-if="sizes.length">

            <div class="pb-2">

                <!-- <div id="header-container" v-if="sizes.length > 1"> -->
                <div id="header-container" class="text-right">
                    <fig-button
                        variant="primary"
                        size="sm"
                        @click="addSize"
                        icon="plus"
                        class="mr-2">{{ $t('Add Size') }}</fig-button>

                    <fig-button
                        variant="plain"
                        size="sm"
                        @click="isDetailsView = !isDetailsView"
                        :icon="isDetailsView ? 'edit' : 'columns'"
                        class="mr-2">
                        <template v-if="isDetailsView">{{ $t('Edit Sizes') }}</template>
                        <template v-else>{{ $t('Show list view') }}</template>
                    </fig-button>

                    <fig-button
                        variant="plain"
                        size="sm"
                        @click="toggleBulkEdit"
                        ref="bulkEditBtn"
                        icon="list-check"
                        id="bulk-edit-button">{{ $t('Bulk edit') }}</fig-button>

                    <!-- popover for bulk edit form -->
                    <fig-popover
                        placement="left"
                        :target="$refs.bulkEditBtn"
                        :show="showBulkEdit"
                        :offset="[0,10]">
                        <div slot="header" style="min-width:175px">{{ $t('Update all sizes') }}</div>

                        <!-- price -->
                        <div class="bulk-edit-row">
                            <div class="bulk-edit-cell">
                                <fig-form-checkbox
                                    v-model="showBulkEditInputs.base_price"
                                    @input="(val) => { onBulkEditRegister('base_price', val) }"
                                    id="bulk-edit-price" />
                            </div>

                            <div class="bulk-edit-cell pl-2">
                                <div class="bulk-edit-label">
                                    <label for="bulk-edit-price">{{ $t('Price') }}</label>
                                    <fig-form-input-toggle
                                        v-if="showBulkEditInputs.base_price"
                                        :value="bulkEdit.base_price !== null"
                                        size="sm"
                                        variant="success"
                                        @input="(val) => onBulkEditToggleChange('base_price', val)"  />
                                </div>

                                <!-- <div v-if="bulkEdit.hasOwnProperty('base_price')"> -->
                                <div v-if="showBulkEditInputs.base_price">
                                    <using-color-value-badge v-if="bulkEdit.base_price === null" />

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
                                    v-model="showBulkEditInputs.compare_at_price"
                                    @input="(val) => { onBulkEditRegister('compare_at_price', val) }"
                                    id="bulk-edit-compare-at" />
                            </div>

                            <div class="bulk-edit-cell pl-2">
                                <div class="bulk-edit-label">
                                    <label for="bulk-edit-compare-at">{{ $t('Compare at') }}</label>
                                    <fig-form-input-toggle
                                        v-if="showBulkEditInputs.compare_at_price"
                                        :value="bulkEdit.compare_at_price !== null"
                                        variant="success"
                                        size="sm"
                                        @input="(val) => onBulkEditToggleChange('compare_at_price', val)" />
                                </div>

                                <div v-if="showBulkEditInputs.compare_at_price">
                                    <using-color-value-badge v-if="bulkEdit.compare_at_price === null" />

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
                                    v-model="showBulkEditInputs.cost_price"
                                    @input="(val) => { onBulkEditRegister('cost_price', val) }"
                                    id="bulk-edit-cost_price" />
                            </div>
                            <div class="bulk-edit-cell pl-2">
                                <div class="bulk-edit-label">
                                    <label for="bulk-edit-cost_price">{{ $t('Cost per item') }}</label>
                                    <fig-form-input-toggle
                                        v-if="showBulkEditInputs.cost_price"
                                        :value="bulkEdit.cost_price !== null"
                                        variant="success"
                                        size="sm"
                                        @input="(val) => onBulkEditToggleChange('cost_price', val)" />
                                </div>

                                <div v-if="showBulkEditInputs.cost_price">
                                    <using-color-value-badge v-if="bulkEdit.cost_price === null" />

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
                                    v-model="showBulkEditInputs.weight_oz"
                                    @input="(val) => { onBulkEditRegister('weight_oz', val) }"
                                    id="bulk-edit-weight-oz" />
                            </div>

                            <div class="bulk-edit-cell pl-2">
                                <div class="bulk-edit-label">
                                    <label for="bulk-edit-weight-oz">{{ $t('Weight (oz)') }}</label>
                                    <fig-form-input-toggle
                                        v-if="showBulkEditInputs.weight_oz"
                                        :value="bulkEdit.weight_oz !== null"
                                        variant="success"
                                        size="sm"
                                        @input="(val) => onBulkEditToggleChange('weight_oz', val)" />
                                </div>

                                <div v-if="showBulkEditInputs.weight_oz">
                                    <using-color-value-badge v-if="bulkEdit.weight_oz === null" />

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
                                    v-model="showBulkEditInputs.visible_if_no_inventory"
                                    @input="(val) => { onBulkEditRegister('visible_if_no_inventory', val) }" />
                            </div>

                            <div class="bulk-edit-cell pl-2">
                                <label for="bulk-edit-visible-no-inventory">{{ $t('When out of stock') }}</label>

                                <div v-if="showBulkEditInputs.visible_if_no_inventory">
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
                                    v-model="showBulkEditInputs.customs_country_of_origin"
                                    @input="(val) => { onBulkEditRegister('customs_country_of_origin', val) }"
                                    id="bulk-edit-country" />
                            </div>

                            <div class="bulk-edit-cell pl-2">
                                <div class="bulk-edit-label">
                                    <label for="bulk-edit-country">{{ $t('Country of origin') }}</label>
                                    <fig-form-input-toggle
                                        v-if="showBulkEditInputs.customs_country_of_origin"
                                        :value="bulkEdit.customs_country_of_origin !== null"
                                        variant="success"
                                        size="sm"
                                        @input="(val) => onBulkEditToggleChange('customs_country_of_origin', val)" />
                                </div>

                                <div v-if="showBulkEditInputs.customs_country_of_origin">
                                    <using-color-value-badge v-if="bulkEdit.customs_country_of_origin === null" />

                                    <fig-form-select-country
                                        v-else
                                        v-model="bulkEdit.customs_country_of_origin"
                                        class="w-full" />
                                </div>
                            </div>
                        </div>


                        <div slot="footer" class="text-center">
                            <fig-button
                                variant="primary"
                                size="sm"
                                @click="onClickApplyBulkEdit"
                                class="mr-2">{{ $t('Apply') }}</fig-button>

                            <fig-button
                                variant="plain"
                                size="sm"
                                @click="toggleBulkEdit">{{ $t('Cancel') }}</fig-button>
                        </div>
                    </fig-popover>

                </div>
            </div>
        </div>


        <!-- size card list -->
        <fig-table-simple
            v-if="isDetailsView"
            striped
            hover>
            <template slot="head">
                <tr>
                    <fig-th v-if="sizes.length > 1" class="handle-cell"></fig-th>
                    <fig-th>{{ $t('Size') }}</fig-th>
                    <fig-th>{{ $t('Inventory') }}</fig-th>
                    <fig-th>{{ $t('Price') }}</fig-th>
                    <fig-th>{{ $t('Compare at') }}</fig-th>
                    <fig-th>{{ $t('Cost') }}</fig-th>
                    <fig-th>{{ $t('Weight (oz)') }}</fig-th>
                    <fig-th>{{ $t('SKU') }}</fig-th>
                    <fig-th>{{ $t('Barcode') }}</fig-th>
                    <fig-th class="text-center">{{ $t('Track inventory') }}</fig-th>
                    <fig-th class="text-center">{{ $t('Hide when out of stock') }}</fig-th>
                    <fig-th>{{ $t('Country of origin') }}</fig-th>
                </tr>
            </template>

            <draggable
                v-model="sizes"
                ghost-class="ghost"
                handle=".handle"
                tag="tbody">

                <tr
                    v-for="(size, index) in sizes"
                    :key="index">

                    <!-- handle -->
                    <fig-td v-if="sizes.length > 1" class="align-middle">
                        <i class="handle">
                            <fig-icon icon="dots-vertical-double" />
                        </i>
                    </fig-td>

                    <!-- size -->
                    <fig-td class="font-semibold">
                        {{ size.label }}
                    </fig-td>

                    <!-- inventory -->
                    <fig-td class="text-sm">
                        {{ size.inventory_count }}
                    </fig-td>

                    <!-- Price -->
                    <fig-td class="text-sm text-right">
                        <money
                            v-if="size.base_price !== null"
                            :cents="size.base_price" />
                    </fig-td>

                    <!-- Compare at -->
                    <fig-td class="text-sm text-right">
                        <money
                            v-if="size.compare_at_price !== null"
                            :cents="size.compare_at_price" />
                        <div
                            v-else
                            class="text-gray-400">({{ $t('default') }})</div>
                    </fig-td>

                    <!-- Cost -->
                    <fig-td class="text-sm text-right">
                        <money
                            v-if="size.cost_price !== null"
                            :cents="size.cost_price" />
                        <div
                            v-else
                            class="text-gray-400">({{ $t('default') }})</div>
                    </fig-td>

                    <!-- Weight -->
                    <fig-td class="text-sm text-right">
                        <div v-if="size.weight_oz !== null">{{ size.weight_oz }}</div>
                        <div
                            v-else
                            class="text-gray-400">({{ $t('default') }})</div>
                    </fig-td>

                    <!-- SKU -->
                    <fig-td class="text-sm">
                        {{ size.sku }}
                    </fig-td>

                    <!-- Barcode -->
                    <fig-td class="text-sm">
                        {{ size.barcode }}
                    </fig-td>

                    <!-- Track inventory -->
                    <fig-td class="text-center">
                        <boolean-tag
                            :value="size.track_inventory_count"
                            size="sm"
                            pill />
                    </fig-td>

                    <!-- Hide when out of stock -->
                    <fig-td class="text-center">
                        <boolean-tag
                            :value="size.visible_if_no_inventory"
                            size="sm"
                            pill />
                    </fig-td>

                    <!-- Country of origin -->
                    <fig-td class="text-sm">
                        <fig-country
                            v-if="size.customs_country_of_origin !== null"
                            :alpha2="size.customs_country_of_origin" />
                        <div
                            v-else
                            class="text-gray-400">({{ $t('default') }})</div>
                    </fig-td>
                </tr>

            </draggable>
        </fig-table-simple>

        <!-- EDIT VIEW (cards) -->
        <template v-else>
            <draggable
                v-model="sizes"
                ghost-class="ghost"
                handle=".handle"
                class="flex flex-wrap -mx-1 mb-4"
                tag="div">

                <!-- card -->
                <div
                    class="my-2 px-2 w-full sm:w-full md:w-1/2 xl:w-1/3"
                    v-for="(size, index) in sizes"
                    :key="index">
                    <div
                        class="bg-gray-100 border rounded-lg shadow-md"
                        :class="{'border-red-500': !size.label, 'border-gray-200': size.label}">

                        <!-- button header -->
                        <div class="flex flex-row items-center pt-1 px-3">
                            <div class="flex-grow">
                                <i class="handle">
                                    <fig-icon icon="dots" />
                                </i>
                            </div>

                            <div>
                                <pop-confirm @onConfirm="removeRow(index)">
                                    <div class="text-center" style="min-width:125px">{{ $t('Delete this size?') }}</div>

                                    <i slot="reference" class="cursor-pointer">
                                        <fig-icon icon="trash" stroke-width="1px" width="20" height="20" />
                                    </i>
                                </pop-confirm>
                            </div>
                        </div>

                        <!-- size input -->
                        <div class="p-3 flex items-center flex-grow">
                            <size-select
                                v-model="size.label"
                                size="md"
                                :placeholder="$t('Choose a size')"
                                style="min-width:200px" />
                        </div>

                        <!-- body -->
                        <div class="text-sm border-t border-gray-200">
                            <div class="px-3 pb-3">
                                <!-- Inventory -->
                                <div class="mb-3">
                                    <fig-form-group class="mb-1">
                                        <label for="size_qty" slot="label" class="size-card-edit-label">
                                            {{ $t('Inventory') }}
                                        </label>

                                        <fig-form-input-number
                                            v-model="size.inventory_count"
                                            controls
                                            :min="0"
                                            id="size_qty" />
                                    </fig-form-group>

                                    <div>
                                        <fig-form-checkbox
                                            v-model="size.track_inventory_count">{{ $t('Track inventory') }}</fig-form-checkbox>
                                    </div>

                                    <div>
                                        <fig-form-checkbox
                                            v-model="size.visible_if_no_inventory">{{ $t('Hide when out of stock') }}</fig-form-checkbox>
                                    </div>
                                </div>


                                <!-- sku -->
                                <fig-form-group class="mb-3">
                                    <label for="size_sku" slot="label" class="size-card-edit-label">
                                        {{ $t('SKU') }}
                                    </label>

                                    <fig-form-input
                                        v-model="size.sku"
                                        id="size_sku" />
                                </fig-form-group>


                                <!-- barcode -->
                                <fig-form-group class="mb-3">
                                    <label for="size_barcode" slot="label" class="size-card-edit-label">
                                        <div class="flex items-center">
                                            <div class="mr-1">{{ $t('Barcode') }}</div>

                                            <fig-tooltip placement="top">
                                                <i slot="toggler">
                                                    <fig-icon icon="info-circle" width="16" height="16" />
                                                </i>
                                                <div class="whitespace-no-wrap">{{ $t('sku_barcode_description') }}</div>
                                            </fig-tooltip>
                                        </div>
                                    </label>

                                    <fig-form-input
                                        v-model="size.barcode"
                                        id="size_barcode" />
                                </fig-form-group>


                                <!-- price -->
                                <fig-form-group class="mb-3">
                                    <label slot="label" for="size_price" class="size-card-edit-label">
                                        {{ $t('Price') }}
                                        <fig-form-input-toggle
                                            :value="size.base_price !== null"
                                            size="sm"
                                            variant="success"
                                            @input="(val) => onToggleChange(index, 'base_price', val)" />
                                    </label>

                                    <fig-form-input-money
                                        v-if="size.base_price !== null"
                                        v-model="size.base_price"
                                        id="size_price" />
                                </fig-form-group>


                                <!-- compare at -->
                                <fig-form-group class="mb-3">
                                    <label for="size_price_compare_at" slot="label" class="size-card-edit-label">
                                        {{ $t('Compare at') }}
                                        <fig-form-input-toggle
                                            :value="size.compare_at_price !== null"
                                            size="sm"
                                            variant="success"
                                            @input="(val) => onToggleChange(index, 'compare_at_price', val)" />
                                    </label>

                                    <fig-form-input-money
                                        v-if="size.compare_at_price !== null"
                                        v-model="size.compare_at_price"
                                        id="size_price_compare_at" />
                                </fig-form-group>


                                <!-- cost per item -->
                                <fig-form-group class="mb-3">
                                    <label for="size_price_cost" slot="label" class="size-card-edit-label">
                                        {{ $t('Cost') }}
                                        <fig-form-input-toggle
                                            :value="size.cost_price !== null"
                                            size="sm"
                                            variant="success"
                                            @input="(val) => onToggleChange(index, 'cost_price', val)" />
                                    </label>

                                    <fig-form-input-money
                                        v-if="size.cost_price !== null"
                                        v-model="size.cost_price"
                                        id="size_price_cost" />
                                </fig-form-group>


                                <!-- weight -->
                                <fig-form-group class="mb-3">
                                    <label for="size_weight" slot="label" class="size-card-edit-label">
                                        {{ $t('Weight (oz)') }}
                                        <fig-form-input-toggle
                                            :value="size.weight_oz !== null"
                                            size="sm"
                                            variant="success"
                                            @input="(val) => onToggleChange(index, 'weight_oz', val)" />
                                    </label>

                                    <fig-form-input-number
                                        v-if="size.weight_oz !== null"
                                        v-model="size.weight_oz"
                                        :step=".01"
                                        :min="0"
                                        controls
                                        id="size_weight" />
                                </fig-form-group>


                                <!-- country of origin -->
                                <fig-form-group>
                                    <label for="size_origin" slot="label" class="size-card-edit-label">
                                        {{ $t('Country of origin') }}
                                        <fig-form-input-toggle
                                            :value="size.customs_country_of_origin !== null"
                                            size="sm"
                                            variant="success"
                                            @input="(val) => onToggleChange(index, 'customs_country_of_origin', val)" />
                                    </label>

                                    <fig-form-select-country
                                        v-if="size.customs_country_of_origin !== null"
                                        v-model="size.customs_country_of_origin"
                                        id="size_origin" />
                                </fig-form-group>
                            </div>

                        </div>
                    </div>
                </div>
            </draggable>
        </template>

    </div>
</template>


<style lang="postcss">
.handle {
    cursor: grab !important;
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

.size-details-row {
    @apply table-row;
}
.size-details-cell {
    @apply table-cell pb-1;
}
.size-details-row > label {
    @apply font-medium pr-2 pb-1;
}

.size-card-edit-label {
    @apply flex flex-row items-center text-sm font-medium mb-1;
}
.size-card-edit-label .toggle-switch {
    @apply ml-2;
}
</style>
