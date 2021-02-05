<script>
import isObject from 'lodash.isobject';

import {
    FigFormGroup,
    FigFormCheckbox,
    FigFormInputMoney,
    FigCol,
    FigRow
} from '@notoursllc/figleaf';


export default {
    name: 'PricingForm',

    components: {
        FigFormGroup,
        FigFormCheckbox,
        FigFormInputMoney,
        FigCol,
        FigRow
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
    <fig-row sm="1/2" md="1/3" lg="1/4" xl="1/5" default="full" default-gap="1" sm-gap="2" key="org">

        <!-- price -->
        <fig-col>
            <fig-form-group>
                <label slot="label" for="color_base_price">{{ $t('Price') }}</label>
                <fig-form-input-money
                    v-model="form.base_price"
                    @input="onChange"
                    id="color_base_price" />
            </fig-form-group>
        </fig-col>

        <!-- compare at price -->
        <fig-col>
            <fig-form-group>
                <label slot="label" for="color_compare_at_price">{{ $t('Compare at') }}</label>
                <fig-form-input-money
                    v-model="form.compare_at_price"
                    @input="onChange"
                    id="color_compare_at_price" />
            </fig-form-group>
        </fig-col>

        <!-- cost per item -->
        <fig-col>
            <fig-form-group>
                <label slot="label" for="color_cost_price">{{ $t('Cost per item') }}</label>
                <fig-form-input-money
                    v-model="form.cost_price"
                    @input="onChange"
                    id="color_cost_price" />

                <div slot="description">{{ $t('Customers won’t see this') }}</div>
            </fig-form-group>
        </fig-col>

        <!-- charge tax on this item -->
        <fig-col>
            <fig-form-group>
                <label slot="label">{{ $t('Charge tax on this item') }}</label>
                <fig-form-checkbox
                    v-model="form.is_taxable"
                    @input="onChange"></fig-form-checkbox>
            </fig-form-group>
        </fig-col>

    </fig-row>
</template>

