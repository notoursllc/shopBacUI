<script>
import isObject from 'lodash.isobject';
import {
    FigOverlay,
    FigLabelValueGroup,
    FigLabelValue,
    FigButton
} from '@notoursllc/figleaf';


export default {
    components: {
        FigOverlay,
        FigLabelValueGroup,
        FigLabelValue,
        FigButton
    },

    data() {
        return {
            rate: {},
            loading: false,
            highlight: [],
            onlyHighlights: true
        };
    },

    computed: {
        canShowToggleButton() {
            return isObject(this.rate.rates) && Object.keys(this.rate.rates).length;
        }
    },

    created() {
        this.$store.dispatch('ui/title', this.$t('Exchange rates'));
        this.fetchData();
        this.fetchAccount();
    },

    methods: {
        async fetchData() {
            try {
                const response = await this.$api.exchangeRate.get();
                this.rate = response?.data || {};
            }
            catch(e) {
                this.$figleaf.errorToast({
                    title: this.$t('Error'),
                    text: e.message
                });
            }
        },

        async fetchAccount() {
            try {
                const response = await this.$api.account.get();
                const highlight = response.data?.supported_currencies || [];

                if(response.data?.default_currency) {
                    highlight.splice(
                        highlight.indexOf(response.data.default_currency),
                        1
                    );
                }

                this.highlight = highlight;
            }
            catch(e) {
                this.$figleaf.errorToast({
                    title: this.$t('Error'),
                    text: e.message
                });
            }
        },

        onToggleHighlights() {
            this.onlyHighlights = !this.onlyHighlights;
        }
    }
};
</script>


<template>
    <fig-overlay :show="loading">
        <fig-label-value-group density="md" display="table" class="text-sm">
            <!-- Updated -->
            <fig-label-value>
                <template v-slot:label>{{ $t('Updated') }}:</template>
                <template v-if="rate.created_at">{{ rate.created_at | format8601 }}</template>
            </fig-label-value>

            <!-- Base -->
            <fig-label-value>
                <template v-slot:label>{{ $t('Base') }}:</template>
                {{ rate.base }}
            </fig-label-value>

            <!-- Base -->
            <fig-label-value>
                <template v-slot:label>{{ $t('Rates') }}:</template>
                <table>
                    <tr
                        v-for="(r, countryCode) in rate.rates"
                        :key="countryCode"
                        :class="{
                            'hidden': onlyHighlights && !highlight.includes(countryCode),
                            'bg-green-100': !onlyHighlights && highlight.includes(countryCode)
                        }">
                        <td class="pr-10">{{ countryCode }}</td>
                        <td>{{ r }}</td>
                    </tr>
                </table>

                <div v-if="canShowToggleButton" class="mt-4">
                    <fig-button
                        size="sm"
                        variant="plain"
                        @click="onToggleHighlights">
                        {{ $t( onlyHighlights ? 'View all' : 'Truncate' )}}
                    </fig-button>
                </div>
            </fig-label-value>
        </fig-label-value-group>
    </fig-overlay>
</template>
