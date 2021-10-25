<script>
import {
    FigButtonFab,
    FigTableSimple,
    FigTh,
    FigTd,
    FigTrNoResults,
    FigPaginationBar,
    FigOperationsDropdown
} from '@notoursllc/figleaf';


export default {
    components: {
        FigButtonFab,
        FigTableSimple,
        FigTh,
        FigTd,
        FigTrNoResults,
        FigPaginationBar,
        FigOperationsDropdown
    },

    data() {
        return {
            nexusList: [],
            pagination: {
                pageNo: 1,
                pageSize: 1,
                totalResults: 0
            }
        };
    },

    created() {
        this.$store.dispatch('ui/title', this.$t('Nexus'));
        this.fetchList();
    },

    methods: {
        async fetchList(paramsObj) {
            try {
                const { data, pagination } = await this.$api.nexus.list({
                    ...paramsObj
                });



                this.nexusList = data;
                // this.pagination.pageNo = pagination.page;
                // this.pagination.pageSize = pagination.pageSize;
                // this.pagination.totalResults = pagination.rowCount;
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

        goToUpsert(id) {
            this.$router.push({
                name: 'tax-nexus-upsert-id',
                params: { id }
            });
        },

        sortChanged(val) {
            this.fetchList({
                sortBy: val.by,
                sortDesc: !val.isAsc,
                pageSize: this.pagination.pageSize,
                page: this.pagination.pageNo
            });
        },

        onPerPageChange(val) {
            this.pagination.pageSize = val;
            this.pagination.pageNo = 1;

            this.fetchList({
                pageSize: this.pagination.pageSize,
                page: this.pagination.pageNo
            });
        },

        init() {
            this.fetchList({
                pageSize: this.pagination.pageSize,
                page: this.pagination.pageNo
            });
        },

        onPageNumberChange(val) {
            this.pagination.pageNo = val;
            this.init();
        }
    }
};
</script>


<template>
    <div>
        <fig-button-fab icon="plus" @click="goToUpsert()" />

        <div>
            <fig-pagination-bar
                :current-page="pagination.pageNo"
                :per-page="pagination.pageSize"
                :total-records="pagination.totalResults"
                @perPage="onPerPageChange"
                @pageNumber="onPageNumberChange" />
        </div>

        <fig-table-simple
            striped
            hover
            @sort="sortChanged"
            :cell-padding="1">
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
                        @edit="goToUpsert(nexus.id)"
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
    </div>
</template>
