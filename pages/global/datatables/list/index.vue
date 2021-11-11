<script>
import {
    FigOperationsDropdown,
    FigButtonFab,
    FigTableSimple,
    FigTh,
    FigTd,
    FigTrNoResults,
    FigOverlay,
    FigPaginationWrapper
} from '@notoursllc/figleaf';

export default {
    components: {
        FigOperationsDropdown,
        FigButtonFab,
        FigTableSimple,
        FigTh,
        FigTd,
        FigTrNoResults,
        FigOverlay,
        FigPaginationWrapper
    },

    data() {
        return {
            loading: false,
            dataTables: [],
            pagination: {
                _page: 1,
                _pageSize: 100
            },
            table: {
                _sort: 'name:asc'
            },
            totalResults: 0
        };
    },

    created() {
        this.fetchData();
    },

    methods: {
        async fetchData() {
            try {
                const { data, pagination } = await this.$api.product.dataTable.list({
                    ...this.pagination,
                    ...this.table
                });

                this.dataTables = data;
                this.totalResults = pagination.rowCount;
            }
            catch(e) {
                this.$figleaf.errorToast({
                    title: this.$t('Error'),
                    text: e.message
                });
            }
        },

        sortChanged(val) {
            this.table._sort = val;
            this.fetchData();
        },

        onPaginationChange(data) {
            this.pagination = { ...data };
            this.fetchData();
        },

        async onDeleteClick(data) {
            try {
                const confirmed = await this.$showConfirm(
                    this.$t('delete_name?', {name: data.name}),
                    'warning'
                );

                if(!confirmed) {
                    return;
                }

                const result = await this.$api.product.dataTable.delete(data.id);

                if(!result.data) {
                    throw new Error(this.$t('Data Table not found'));
                }

                this.fetchData();
                this.$figleaf.successToast(
                    this.$t('deleted_name', { name: data.name })
                );
            }
            catch(e) {
                this.$figleaf.errorToast({
                    title: this.$t('Error'),
                    text: e.message
                });
            }
        },

        onUpsertClick(data) {
            const params = data ? { id: data.id } : null;

            this.$router.push({
                name: 'product-datatables-upsert-id',
                params
            });
        }
    }
};
</script>


<template>
    <div>
        <fig-button-fab icon="plus" @click="onUpsertClick()" />

        <fig-pagination-wrapper
            bottom
            :total-records="totalResults"
            @perPage="onPaginationChange"
            @pageNumber="onPaginationChange">

            <fig-overlay :show="loading">
                <fig-table-simple
                    striped
                    hover
                    @sort="sortChanged">
                    <template slot="head">
                        <tr>
                            <fig-th sortable prop="name">{{ $t('Name') }}</fig-th>
                            <fig-th sortable prop="updated_at">{{ $t('Updated') }}</fig-th>
                        </tr>
                    </template>

                    <tr v-for="(obj, idx) in dataTables" :key="idx">
                        <!-- name -->
                        <fig-td>
                            {{ obj.name }}
                            <fig-operations-dropdown
                                :show-view="false"
                                @edit="onUpsertClick(obj)"
                                @delete="onDeleteClick(obj)"
                                class="ml-1" />
                        </fig-td>

                        <!-- updated -->
                        <fig-td>
                            {{ obj.updated_at | format8601 }}
                        </fig-td>
                    </tr>

                    <fig-tr-no-results v-if="!dataTables.length" :colspan="2" />
                </fig-table-simple>
            </fig-overlay>

        </fig-pagination-wrapper>
    </div>
</template>
