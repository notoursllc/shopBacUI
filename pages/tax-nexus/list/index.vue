<script>
import NexusUpsertForm from '../../../components/nexus/NexusUpsertForm.vue';

import {
    FigButtonFab,
    FigTableSimple,
    FigTh,
    FigTd,
    FigTrNoResults,
    FigPaginationWrapper,
    FigOperationsDropdown,
    FigModal
} from '@notoursllc/figleaf';


export default {
    components: {
        FigButtonFab,
        FigTableSimple,
        FigTh,
        FigTd,
        FigTrNoResults,
        FigPaginationWrapper,
        FigOperationsDropdown,
        FigModal,
        NexusUpsertForm
    },

    data() {
        return {
            nexusList: [],
            pagination: {
                _page: 1,
                _pageSize: 100
            },
            table: {
                _sort: 'countryCodeAlpha2:asc'
            },
            totalResults: 0,
            form: {
                nexusId: null
            }
        };
    },

    created() {
        this.$store.dispatch('ui/title', this.$t('Nexus'));
        this.fetchData();
    },

    methods: {
        async fetchData() {
            try {
                const response = await this.$api.nexus.list({
                    ...this.pagination,
                    ...this.table
                });

                this.nexusList = response?.data || [];
                this.totalResults = response?.pagination.rowCount || 0;
            }
            catch(e) {
                this.$figleaf.errorToast({
                    title: this.$t('Error'),
                    text: e.message
                });
            }
        },

        getLabel(nexus) {
            return `${nexus.countryCodeAlpha2}/${nexus.state}`;
        },

        async onDelete(nexus) {
            const confirmed = await this.$showConfirm(
                this.$t('remove_label?', { label: this.getLabel(nexus) }),
                'warning'
            );

            if(!confirmed) {
                return;
            }

            try {
                const response = await this.$api.nexus.delete(nexus.id);

                if(!response) {
                    throw new Error(this.$t('Item not found'));
                }

                this.init();

                this.$figleaf.successToast({
                    title: this.$t('Success'),
                    text: this.$t('item_deleted_label', { label: this.getLabel(nexus) })
                });
            }
            catch(e) {
                this.$figleaf.errorToast({
                    title: this.$t('Error'),
                    text: e.message
                });
            }
        },

        onUpsert(id) {
            this.form.nexusId = id;
            this.showModal();
        },

        showModal(show) {
            show === false ? this.$refs.nexus_upsert_modal.hide() : this.$refs.nexus_upsert_modal.show();
        },

        onPaginationChange(data) {
            this.pagination = { ...data };
            this.fetchData();
        },

        sortChanged(val) {
            this.table._sort = val;
            this.fetchData();
        },

        onNexusFormSaved() {
            this.fetchData();
            this.showModal(false);
        },

        init() {
            this.fetchData();
        }
    }
};
</script>


<template>
    <div>
        <fig-button-fab icon="plus" @click="onUpsert()" />

        <fig-pagination-wrapper
            bottom
            :total-records="totalResults"
            @perPage="onPaginationChange"
            @pageNumber="onPaginationChange">
            <fig-table-simple
                striped
                hover
                @sort="sortChanged">
                <template slot="head">
                    <tr>
                        <fig-th sortable prop="countryCodeAlpha2">{{ $t('Country code') }}</fig-th>
                        <fig-th sortable prop="state">{{ $t('State/Province/Region') }}</fig-th>
                        <fig-th sortable prop="tax_rate">{{ $t('Tax rate') }} (%)</fig-th>
                    </tr>
                </template>

                <tr v-for="(nexus, idx) in nexusList" :key="idx">
                    <!-- country code -->
                    <fig-td>
                        {{ nexus.countryCodeAlpha2 }}

                        <fig-operations-dropdown
                            :show-view="false"
                            @edit="onUpsert(nexus.id)"
                            @delete="onDelete(nexus)"
                            class="ml-1" />
                    </fig-td>

                    <!-- state -->
                    <fig-td>
                        {{ nexus.state }}
                    </fig-td>

                    <!-- tax rate -->
                    <fig-td>
                        {{ nexus.tax_rate ? parseFloat(nexus.tax_rate * 100) : 0 }}
                    </fig-td>
                </tr>

                <fig-tr-no-results v-if="!nexusList.length" :colspan="3" />
            </fig-table-simple>
        </fig-pagination-wrapper>


        <!-- add/upsert modal -->
        <fig-modal
            ref="nexus_upsert_modal"
            size="md">

            <template v-slot:header>
                {{ form.nexusId ? $t('Edit Nexus') : $t('Add Nexus') }}
            </template>

            <nexus-upsert-form
                :id="form.nexusId"
                @saved="onNexusFormSaved" />
        </fig-modal>
    </div>
</template>
