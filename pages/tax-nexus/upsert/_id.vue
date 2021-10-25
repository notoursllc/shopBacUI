<script>
import Vue from 'vue';
import { required } from 'vuelidate/lib/validators';

import {
    FigFormGroup,
    FigFormInputNumber,
    FigSelectCountry,
    FigButton,
    FigOverlay,
    FigSelectStateProvince,
    FigIconLabel,
    FigLabelValueGroup,
    FigLabelValue
} from '@notoursllc/figleaf';


export default Vue.extend({
    components: {
        FigFormGroup,
        FigFormInputNumber,
        FigSelectCountry,
        FigButton,
        FigOverlay,
        FigSelectStateProvince,
        FigIconLabel,
        FigLabelValueGroup,
        FigLabelValue
    },

    data() {
        return {
            loading: false,
            nexus: {
                tax_rate: 9.00
            }
        };
    },

    validations: {
        nexus: {
            countryCodeAlpha2: {
                required
            },
            state: {
                required
            },
            tax_rate: {
                required
            }
        }
    },

    mounted() {
        try {
            if(this.$route.params.id) {
                this.fetchNexus();
            }
            else {
                this.$store.dispatch('ui/title', this.$t('Add Nexus'));
            }
        }
        catch(e) {
            this.$figleaf.errorToast({
                title: this.$t('Error'),
                text: e.message
            });
        }
    },

    methods: {
        async fetchNexus() {
            try {
                const id = this.$route.params.id;
                this.loading = true;

                const nexus = await this.$api.nexus.get(id);

                if(!nexus) {
                    throw new Error(this.$t('Item not found'));
                }

                this.nexus = {
                    ...nexus,
                    tax_rate: nexus.tax_rate ? parseFloat(nexus.tax_rate * 100) : 0
                };

                this.$store.dispatch('ui/title', this.$t('Nexus: {name}', { name: `${nexus.countryCodeAlpha2}/${nexus.state}` }));
            }
            catch(e) {
                this.$figleaf.errorToast({
                    title: this.$t('Error'),
                    text: e.message
                });
            }

            this.loading = false;
        },

        async onSaveClick() {
            try {
                this.loading = true;

                const n = await this.$api.nexus.upsert({
                    ...this.nexus,
                    tax_rate: this.nexus.tax_rate > 0 ? this.nexus.tax_rate/100 : 0
                });

                if(!n) {
                    throw new Error('Error updating item');
                }

                this.$figleaf.successToast({
                    title: n.id ? this.$t('Item updated successfully') : this.$t('Item added successfully'),
                    text: `${n.countryCodeAlpha2}/${n.state}`
                });

                this.$router.push({
                    name: 'tax-nexus-list'
                });
            }
            catch(e) {
                this.$figleaf.errorToast({
                    title: this.$t('Error'),
                    text: e.message
                });
            }

            this.loading = false;
        }
    }
});
</script>


<template>
    <fig-overlay :show="loading">

        <fig-label-value-group density="lg">
            <!-- country code -->
            <fig-label-value>
                <template v-slot:label><label for="country_code">{{ $t('Country code') }}:</label></template>
                <fig-select-country
                    v-model="nexus.countryCodeAlpha2"
                    :clearable="false"
                    id="country_code" />

                <template v-slot:error v-if="$v.nexus.countryCodeAlpha2.$invalid">
                    <div>{{ $t('Required') }}</div>
                </template>
            </fig-label-value>

            <!-- state -->
            <fig-label-value>
                <template v-slot:label><label for="state">{{ $t('State/Province/Region') }}:</label></template>
                <fig-select-state-province
                    v-model="nexus.state"
                    :country="nexus.countryCodeAlpha2"
                    :clearable="false"
                    id="state" />

                <template v-slot:error v-if="$v.nexus.state.$invalid">
                    <div>{{ $t('Required') }}</div>
                </template>
            </fig-label-value>

            <!-- tax rate -->
            <fig-label-value>
                <label slot="label" for="tax_rate">{{ $t('Tax rate') }} (%):</label>
                <fig-form-input-number
                    v-model="nexus.tax_rate"
                    :step=".01"
                    :min="0"
                    :max="50"
                    controls-right
                    size="md"
                    id="tax_rate" />
                <div class="text-gray-500 text-sm">Example: 9.25</div>

                <template v-slot:error v-if="$v.nexus.tax_rate.$invalid">
                    <div>{{ $t('Required') }}</div>
                </template>
            </fig-label-value>

            <fig-label-value>
                <label slot="label"></label>
                <div class="pt-4">
                    <fig-button
                        variant="primary"
                        size="lg"
                        @click="onSaveClick"
                        :disabled="$v.$invalid">{{ $t('Save') }}</fig-button>
                </div>
            </fig-label-value>
        </fig-label-value-group>




    </fig-overlay>
</template>
