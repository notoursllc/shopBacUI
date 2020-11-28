<script>
import isObject from 'lodash.isobject';

import {
    FigFormGroup,
    FigFormCheckbox,
    FigFormInput
} from '@notoursllc/figleaf';


export default {
    name: 'PricingForm',

    components: {
        FigFormGroup,
        FigFormCheckbox,
        FigFormInput
    },

    props: {
        data: {
            type: Object,
            default: () => {
                return {};
            }
        }
    },

    data: () => {
        return {
            form: {}
        };
    },

    watch: {
        data: {
            handler(newVal) {
                if(isObject(newVal)) {
                    this.form.base_price = newVal.base_price;
                    this.form.compare_at_price = newVal.compare_at_price;
                    this.form.cost_price = newVal.cost_price;
                    this.form.is_taxable = newVal.is_taxable;
                }
            },
            immediate: true
        }
    },

    methods: {
        onChange() {
            this.$emit('input', {
                ...this.form
            });
        }
    }
};
</script>


<template>
    <div>
        <b-row>
            <!-- price -->
            <b-col sm="12" lg="4">
                <fig-form-group>
                    <label slot="label" for="color_base_price">{{ $t('Price') }}</label>
                    <fig-form-input
                        type="money"
                        v-model="form.base_price"
                        @input="onChange"
                        id="color_base_price" />
                </fig-form-group>
            </b-col>

            <!-- compare at price -->
            <b-col sm="12" lg="4">
                <fig-form-group>
                    <label slot="label" for="color_compare_at_price">{{ $t('Compare at') }}</label>
                    <fig-form-input
                        type="money"
                        v-model="form.compare_at_price"
                        @input="onChange"
                        id="color_compare_at_price" />
                </fig-form-group>
            </b-col>

            <!-- cost pre item -->
            <b-col sm="12" lg="4">
                <fig-form-group>
                    <label slot="label" for="color_cost_price">{{ $t('Cost per item') }}</label>
                    <fig-form-input
                        type="money"
                        v-model="form.cost_price"
                        @input="onChange"
                        id="color_cost_price" />

                    <div slot="description">{{ $t('Customers won’t see this') }}</div>
                </fig-form-group>
            </b-col>
        </b-row>

        <b-row>
            <!-- Charge tax on this product -->
            <b-col lg="12">
                <fig-form-checkbox
                    v-model="form.is_taxable"
                    @input="onChange">{{ $t('Charge tax on this product') }}</fig-form-checkbox>
            </b-col>
        </b-row>
    </div>
</template>

