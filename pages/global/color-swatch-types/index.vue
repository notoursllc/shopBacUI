<script>
import isObject from 'lodash.isobject';

import OperationsDropdown from '@/components/OperationsDropdown';

import {
    FigButtonFab,
    FigFormInput,
    FigTableSimple,
    FigTh,
    FigTd,
    FigTrNoResults
} from '@notoursllc/figleaf';

export default {
    components: {
        OperationsDropdown,
        FigButtonFab,
        FigFormInput,
        FigTableSimple,
        FigTh,
        FigTd,
        FigTrNoResults
    },

    data() {
        return {
            swatches: [],
            loading: false
        };
    },

    created() {
        this.fetchData();
        this.$store.dispatch('ui/title', this.$t('Color swatches'));
    },

    methods: {
        async fetchData(paramsObj) {
            this.loading = true;

            try {
                const { data } = await this.$api.productColorSwatches.list(paramsObj);
                this.swatches = data;
            }
            catch(e) {
                this.$errorToast({
                    title: this.$t('Error'),
                    text: e.message
                });
            }

            this.loading = false;
        },

        sortChanged(val) {
            this.fetchData({
                sortBy: val.by,
                sortDesc: !val.isAsc
            });
        },

        async deleteSwatch(data) {
            const confirmed = await this.$showConfirm(
                this.$t('remove_label?', {label: data.label}),
                'warning'
            );

            if(!confirmed) {
                return;
            }

            try {
                const response = await this.$api.productColorSwatches.delete(data.id);

                if(!response) {
                    throw new Error(this.$t('Item not found'));
                }

                this.fetchData();

                this.$successToast({
                    title: this.$t('Success'),
                    text: this.$t('item_deleted_label', {label: data.label})
                });
            }
            catch(e) {
                this.$errorToast({
                    title: this.$t('Error'),
                    text: e.message
                });
            }
        },

        goToUpsert(id) {
            this.$router.push({
                name: 'product-color-swatch-types-upsert-id',
                params: { id: id }
            });
        }
    }
};
</script>


<template>
    <div>
        <fig-button-fab icon="plus" @click="goToUpsert()" />

        <fig-table-simple
            striped
            hover
            @sort="sortChanged">
            <template slot="head">
                <tr>
                    <fig-th>{{ $t('Swatch') }}</fig-th>
                    <fig-th>{{ $t('Hex') }}</fig-th>
                    <fig-th sortable prop="name">{{ $t('Label') }}</fig-th>
                    <fig-th sortable prop="description">{{ $t('Description') }}</fig-th>
                </tr>
            </template>

            <tr v-for="(obj, idx) in swatches" :key="idx">
                <!-- swatch -->
                <fig-td>
                    <fig-form-input
                        type="color"
                        v-model="obj.hex"
                        disabled />
                </fig-td>

                <!-- hex -->
                <fig-td>
                    {{ obj.hex }}
                </fig-td>

                <!-- label -->
                <fig-td>
                    {{ obj.label }}
                    <operations-dropdown
                        :show-view="false"
                        @edit="goToUpsert(obj.id)"
                        @delete="deleteSwatch(obj)"
                        class="ml-1" />
                </fig-td>

                <!-- description -->
                <fig-td>
                    {{ obj.description }}
                </fig-td>
            </tr>

            <fig-tr-no-results
                v-if="!swatches.length"
                colspan="4" />
        </fig-table-simple>

    </div>
</template>
