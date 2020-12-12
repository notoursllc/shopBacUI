<script>
import Vue from 'vue';
import isObject from 'lodash.isobject';
import draggable from 'vuedraggable';
import PopConfirm from '@/components/PopConfirm';
import SizeSelect from '@/components/product/size/SizeSelect';
import UsingColorValueBadge from '@/components/product/size/sizeCard/UsingColorValueBadge';
import Money from '@/components/Money';
import BooleanTag from '@/components/BooleanTag';

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
    FigTooltip,
    FigCountry
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
        FigTooltip,
        FigCountry,
        UsingColorValueBadge,
        Money,
        BooleanTag
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
            showBulkEdit: false,
            showBulkEditInputs: {},
            bulkEdit: {},
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
        },

        sizes: {
            handler(newVal) {
                console.log("SIZES CHANGE");
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
                    delete copy.opened;
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

                // meta data that should be removed before saving:
                opened: true
            });
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

            <div class="flex flex-row items-center pb-2">

                <!-- created button list -->
                <div class="flex-grow">
                    <div class="inline-block pr-2 text-sm">{{ $t('Created') }}:</div>
                    <div class="inline-block">
                        <draggable
                            v-model="sizes"
                            ghost-class="ghost"
                            handle=".size-btn"
                            tag="div">
                            <fig-button
                                v-for="(size, idx) in sizes"
                                :key="idx"
                                :variant="size.label ? 'success' : 'danger'"
                                class="mr-2 size-btn handle"
                                size="sm"
                                :href="`#size-card-${idx}`">{{ size.label }}</fig-button>
                        </draggable>
                    </div>
                </div>


                <!-- bulk edit button/popup -->
                <!-- <div id="header-container" v-if="sizes.length > 1"> -->
                <div id="header-container">
                    <fig-button
                        variant="primary"
                        size="sm"
                        @click="addSize"
                        icon="plus"
                        class="mr-2">{{ $t('Add Size') }}</fig-button>

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

                                <i slot="reference" class="ml-3 cursor-pointer">
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
                        <div class="px-2 pt-2 pb-1 text-right">
                            <fig-button
                                @click="$set(size, 'opened', !size.opened)"
                                variant="ghost"
                                :icon="size.opened ? 'chevron-up' : 'chevron-down'"
                                size="sm" />
                        </div>

                        <div class="px-3 pb-3">

                            <!------------- DETAILS VIEW ------------->
                            <template v-if="!size.opened">
                                <!-- inventory -->
                                <div class="size-details-row">
                                    <label>{{ $t('Inventory') }}:</label>
                                    <div class="size-details-cell">{{ size.inventory_count }}</div>
                                </div>

                                <!-- Track inventory -->
                                <div class="size-details-row">
                                    <label>{{ $t('Track inventory') }}:</label>
                                    <div class="size-details-cell">
                                        <boolean-tag
                                            :value="size.track_inventory_count"
                                            size="sm"
                                            pill />
                                    </div>
                                </div>

                                <!-- Hide when out of stock -->
                                <div class="size-details-row">
                                    <label>{{ $t('Hide when out of stock') }}:</label>
                                    <div class="size-details-cell">
                                        <boolean-tag
                                            :value="size.visible_if_no_inventory"
                                            size="sm"
                                            pill />
                                    </div>
                                </div>

                                <!-- SKU -->
                                <div class="size-details-row">
                                    <label>{{ $t('SKU') }}:</label>
                                    <div class="size-details-cell">{{ size.sku }}</div>
                                </div>

                                <!-- Barcode -->
                                <div class="size-details-row">
                                    <label>{{ $t('Barcode') }}:</label>
                                    <div class="size-details-cell">{{ size.barcode }}</div>
                                </div>

                                <!-- Price -->
                                <div class="size-details-row">
                                    <label>{{ $t('Price') }}:</label>
                                    <div class="size-details-cell">
                                        <using-color-value-badge v-if="size.base_price === null" />
                                        <money
                                            v-else
                                            :cents="size.base_price" />
                                    </div>
                                </div>

                                <!-- Compare at -->
                                <div class="size-details-row">
                                    <label>{{ $t('Compare at') }}:</label>
                                    <div class="size-details-cell">
                                        <using-color-value-badge v-if="size.compare_at_price === null" />
                                        <money
                                            v-else
                                            :cents="size.compare_at_price" />
                                    </div>
                                </div>

                                <!-- Cost -->
                                <div class="size-details-row">
                                    <label>{{ $t('Cost') }}:</label>
                                    <div class="size-details-cell">
                                        <using-color-value-badge v-if="size.cost_price === null" />
                                        <money
                                            v-else
                                            :cents="size.cost_price" />
                                    </div>
                                </div>

                                <!-- Weight -->
                                <div class="size-details-row">
                                    <label>{{ $t('Weight (oz)') }}:</label>
                                    <div class="size-details-cell">
                                        <using-color-value-badge v-if="size.weight_oz === null" />
                                        <div v-else>{{ size.weight_oz }}</div>
                                    </div>
                                </div>

                                <!-- Country of origin -->
                                <div class="size-details-row">
                                    <label>{{ $t('Country of origin') }}:</label>
                                    <div class="size-details-cell">
                                        <using-color-value-badge v-if="size.customs_country_of_origin === null" />
                                        <fig-country
                                            v-else
                                            :alpha2="size.customs_country_of_origin" />
                                    </div>
                                </div>
                            </template>


                            <!------------- EDIT VIEW ------------->
                            <template v-else>
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
                                        {{ $t('Barcode') }}

                                        <fig-tooltip placement="top">
                                            <i slot="toggler" class="ml-1">
                                                <fig-icon icon="info-circle" width="16" height="16" />
                                            </i>
                                            <div class="whitespace-no-wrap">{{ $t('sku_barcode_description') }}</div>
                                        </fig-tooltip>
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

                                    <using-color-value-badge v-if="size.base_price === null" />

                                    <fig-form-input-money
                                        v-else
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

                                    <using-color-value-badge v-if="size.compare_at_price === null" />

                                    <fig-form-input-money
                                        v-else
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

                                    <using-color-value-badge v-if="size.cost_price === null" />

                                    <fig-form-input-money
                                        v-else
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

                                    <using-color-value-badge v-if="size.weight_oz === null" />

                                    <fig-form-input-number
                                        v-else
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

                                    <using-color-value-badge v-if="size.customs_country_of_origin === null" />

                                    <fig-form-select-country
                                        v-else
                                        v-model="size.customs_country_of_origin"
                                        id="size_origin" />
                                </fig-form-group>
                            </template>
                        </div>

                    </div>
                </div>
            </div>
        </draggable>


        <div>
            <fig-button
                variant="primary"
                size="sm"
                @click="addSize"
                icon="plus"
                class="mr-2">{{ $t('Add Size') }}</fig-button>
        </div>

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
