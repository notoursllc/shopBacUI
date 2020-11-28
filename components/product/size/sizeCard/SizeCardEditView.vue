<script>
import Vue from 'vue';
import isObject from 'lodash.isobject';
import UsingColorValueBadge from '@/components/product/size/sizeCard/UsingColorValueBadge';

import {
    FigFormGroup,
    FigFormCheckbox,
    FigFormInput,
    FigFormInputNumber,
    FigFormInputMoney,
    FigFormInputToggle,
    FigFormSelectCountry,
} from '@notoursllc/figleaf';


export default Vue.extend({
    name: 'SizeCardEditView',

    components: {
        UsingColorValueBadge,
        FigFormGroup,
        FigFormCheckbox,
        FigFormInput,
        FigFormInputNumber,
        FigFormInputMoney,
        FigFormInputToggle,
        FigFormSelectCountry
    },

    props: {
        size: {
            type: Object,
            default: () => {
                return {};
            }
        }
    },

    data: function() {
        return {
            form: {
                inventory_count: null,
                track_inventory_count: null,
                visible_if_no_inventory: null,
                sku: null,
                barcode: null,
                base_price: null,
                base_price_inherit: null,
                compare_at_price: null,
                compare_at_price_inherit: null,
                cost_price: null,
                cost_price_inherit: null,
                weight_oz: null,
                weight_oz_inherit: null,
                customs_country_of_origin: null,
                customs_country_of_origin_inherit: null
            }
        };
    },

    watch: {
        size: {
            handler: function(newVal) {
                this.form = isObject(newVal) ? { ...newVal } : {};
            },
            immediate: true
        }
    },

    methods: {
        emitInput(prop) {
            this.$emit('input', {
                property: prop,
                value: this.form[prop]
            });
        }
    }
});
</script>


<template>
    <div>

        <!-- Inventory -->
        <div class="mb-3">
            <fig-form-group class="mb-1">
                <label for="size_qty" slot="label" class="size-card-edit-label">
                    {{ $t('Inventory') }}
                </label>

                <fig-form-input-number
                    v-model="form.inventory_count"
                    controls
                    :min="0"
                    @input="emitInput('inventory_count')"
                    id="size_qty" />
            </fig-form-group>

            <div>
                <fig-form-checkbox
                    v-model="form.track_inventory_count"
                    @input="emitInput('track_inventory_count')">{{ $t('Track inventory') }}</fig-form-checkbox>
            </div>

            <div>
                <fig-form-checkbox
                    v-model="form.visible_if_no_inventory"
                    @input="emitInput('visible_if_no_inventory')">{{ $t('Hide when out of stock') }}</fig-form-checkbox>
            </div>
        </div>


        <!-- sku -->
        <fig-form-group class="mb-3">
            <label for="size_sku" slot="label" class="size-card-edit-label">
                {{ $t('SKU') }}
            </label>

            <fig-form-input
                v-model="form.sku"
                @input="emitInput('sku')"
                id="size_sku" />
        </fig-form-group>


        <!-- barcode -->
        <fig-form-group class="mb-3">
            <label for="size_barcode" slot="label" class="size-card-edit-label">
                {{ $t('Barcode') }}
                <i class="ml-1"
                    v-b-tooltip.hover.top="$t('sku_barcode_description')">
                    <fig-icon icon="info-circle" width="16" height="16" />
                </i>
            </label>

            <fig-form-input
                v-model="form.barcode"
                @input="emitInput('barcode')"
                id="size_barcode" />
        </fig-form-group>


        <!-- price -->
        <fig-form-group class="mb-3">
            <label slot="label" for="size_price" class="size-card-edit-label">
                {{ $t('Price') }}
                <fig-form-input-toggle
                    v-model="form.base_price_inherit"
                    size="sm"
                    variant="success"
                    inverse
                    @input="emitInput('base_price_inherit')" />
            </label>

            <using-color-value-badge v-if="form.base_price_inherit" />

            <fig-form-input-money
                v-else
                v-model="form.base_price"
                @input="emitInput('base_price')"
                id="size_price" />
        </fig-form-group>


        <!-- compare at -->
        <fig-form-group class="mb-3">
            <label for="size_price_compare_at" slot="label" class="size-card-edit-label">
                {{ $t('Compare at') }}
                <fig-form-input-toggle
                    v-model="form.compare_at_price_inherit"
                    size="sm"
                    variant="success"
                    inverse
                    @input="emitInput('compare_at_price_inherit')" />
            </label>

            <using-color-value-badge v-if="form.compare_at_price_inherit" />

            <fig-form-input-money
                v-else
                v-model="form.compare_at_price"
                @input="emitInput('compare_at_price')"
                id="size_price_compare_at" />
        </fig-form-group>


        <!-- cost per item -->
        <fig-form-group class="mb-3">
            <label for="size_price_cost" slot="label" class="size-card-edit-label">
                {{ $t('Cost') }}
                <fig-form-input-toggle
                    v-model="form.cost_price_inherit"
                    size="sm"
                    variant="success"
                    inverse
                    @input="emitInput('cost_price_inherit')" />
            </label>

            <using-color-value-badge v-if="form.cost_price_inherit" />

            <fig-form-input-money
                v-else
                v-model="form.cost_price"
                @input="emitInput('cost_price')"
                id="size_price_cost" />
        </fig-form-group>


        <!-- weight -->
        <fig-form-group class="mb-3">
            <label for="size_weight" slot="label" class="size-card-edit-label">
                {{ $t('Weight (oz)') }}
                <fig-form-input-toggle
                    v-model="form.weight_oz_inherit"
                    size="sm"
                    variant="success"
                    inverse
                    @input="emitInput('weight_oz_inherit')" />
            </label>

            <using-color-value-badge v-if="form.weight_oz_inherit" />

            <fig-form-input-number
                v-else
                v-model="form.weight_oz"
                :step=".01"
                :min="0"
                controls
                @input="emitInput('weight_oz')"
                id="size_weight" />
        </fig-form-group>


        <!-- country of origin -->
        <fig-form-group>
            <label for="size_origin" slot="label" class="size-card-edit-label">
                {{ $t('Country of origin') }}
                <fig-form-input-toggle
                    v-model="form.customs_country_of_origin_inherit"
                    size="sm"
                    variant="success"
                    inverse
                    @input="emitInput('customs_country_of_origin_inherit')" />
            </label>

            <using-color-value-badge v-if="form.customs_country_of_origin_inherit" />

            <fig-form-select-country
                v-else
                v-model="form.customs_country_of_origin"
                @input="emitInput('customs_country_of_origin')" />
        </fig-form-group>

    </div>
</template>


<style lang="postcss">
.size-card-edit-label {
    @apply flex flex-row items-center text-sm font-medium mb-1;
}
.size-card-edit-label .toggle-switch {
    @apply ml-2;
}
</style>


