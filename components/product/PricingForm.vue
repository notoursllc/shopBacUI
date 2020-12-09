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
        <div class="flex flex-wrap -mx-3">
            <!-- price -->
            <div class="my-3 px-3 w-full sm:w-1/2 md:w-1/3 xl:w-1/4">
                <fig-form-group>
                    <label slot="label" for="color_base_price">{{ $t('Price') }}</label>
                    <fig-form-input
                        type="money"
                        v-model="form.base_price"
                        @input="onChange"
                        id="color_base_price" />
                </fig-form-group>
            </div>

            <!-- compare at price -->
            <div class="my-3 px-3 w-full sm:w-1/2 md:w-1/3 xl:w-1/4">
                <fig-form-group>
                    <label slot="label" for="color_compare_at_price">{{ $t('Compare at') }}</label>
                    <fig-form-input
                        type="money"
                        v-model="form.compare_at_price"
                        @input="onChange"
                        id="color_compare_at_price" />
                </fig-form-group>
            </div>

            <!-- cost pre item -->
            <div class="my-3 px-3 w-full sm:w-1/2 md:w-1/3 xl:w-1/4">
                <fig-form-group>
                    <label slot="label" for="color_cost_price">{{ $t('Cost per item') }}</label>
                    <fig-form-input
                        type="money"
                        v-model="form.cost_price"
                        @input="onChange"
                        id="color_cost_price" />

                    <div slot="description">{{ $t('Customers won’t see this') }}</div>
                </fig-form-group>
            </div>
        </div>

        <div>
            <!-- Charge tax on this product -->
            <fig-form-checkbox
                v-model="form.is_taxable"
                @input="onChange">{{ $t('Charge tax on this product') }}</fig-form-checkbox>
        </div>
    </div>
</template>

