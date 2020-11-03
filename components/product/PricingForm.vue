<script>
import isObject from 'lodash.isobject';
import InputMoney from '@/components/InputMoney';


export default {
    name: 'PricingForm',

    components: {
        InputMoney
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
                <b-form-group
                    :label="$t('Price') "
                    label-for="color_base_price">
                    <input-money
                        v-model="form.base_price"
                        @input="onChange"
                        id="color_base_price" />
                </b-form-group>
            </b-col>

            <!-- compare at price -->
            <b-col sm="12" lg="4">
                <b-form-group
                    :label="$t('Compare at price') "
                    label-for="color_compare_at_price">
                    <input-money
                        v-model="form.compare_at_price"
                        @input="onChange"
                        id="color_compare_at_price" />
                </b-form-group>
            </b-col>

            <!-- cost pre item -->
            <b-col sm="12" lg="4">
                <b-form-group
                    :label="$t('Cost per item') "
                    label-for="color_cost_price"
                    :description="$t('Customers won’t see this')">
                    <input-money
                        v-model="form.cost_price"
                        @input="onChange"
                        id="color_cost_price" />
                </b-form-group>
            </b-col>
        </b-row>

        <b-row>
            <!-- Charge tax on this product -->
            <b-col lg="12">
                <b-form-group>
                    <b-form-checkbox
                        v-model="form.is_taxable"
                        @input="onChange">{{ $t('Charge tax on this product') }}</b-form-checkbox>
                </b-form-group>
            </b-col>
        </b-row>
    </div>
</template>


<style lang="scss">
@import "~assets/css/components/_formRow.scss";
</style>
