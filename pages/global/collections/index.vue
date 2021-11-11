<script>
import BooleanTag from '@/components/BooleanTag';

import {
    FigButtonFab,
    FigTableSimple,
    FigTh,
    FigTd,
    FigTrNoResults,
    FigOperationsDropdown,
    FigPaginationWrapper,
    FigOverlay
} from '@notoursllc/figleaf';

export default {
    components: {
        BooleanTag,
        FigButtonFab,
        FigTableSimple,
        FigTh,
        FigTd,
        FigTrNoResults,
        FigOperationsDropdown,
        FigPaginationWrapper,
        FigOverlay
    },

    data() {
        return {
            loading: false,
            collections: [],
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
        this.$store.dispatch('ui/title', this.$t('Product collections'));
    },

    methods: {
        async fetchData() {
            try {
                this.loading = true;

                const { data, pagination } = await this.$api.product.collection.list({
                    ...this.pagination,
                    ...this.table
                });

                this.collections = data;
                this.totalResults = pagination.rowCount;
            }
            catch(e) {
                this.$figleaf.errorToast({
                    title: this.$t('Error'),
                    text: e.message
                });
            }

            this.loading = false;
        },

        sortChanged(val) {
            this.table._sort = val;
            this.fetchData();
        },

        onPaginationChange(data) {
            this.pagination = { ...data };
            this.fetchData();
        },

        async onDeleteCollection(data) {
            const confirmed = await this.$showConfirm(
                this.$t('delete_name?', {name: data.name}),
                'warning'
            );

            if(!confirmed) {
                return;
            }

            try {
                const response = await this.$api.product.collection.delete(data.id);

                if(!response.data) {
                    throw new Error(this.$t('Collection not found'));
                }

                this.fetchData();
                this.$figleaf.successToast({
                    title: this.$t('Success'),
                    text: this.$t('deleted_name', {name: data.name})
                });
            }
            catch(e) {
                this.$figleaf.errorToast({
                    title: this.$t('Error'),
                    text: e.message
                });
            }
        },

        goToCollectionUpsert(id) {
            this.$router.push({
                name: 'product-collections-upsert',
                params: { id }
            });
        }
    }
};
</script>


<template>
    <div>
        <fig-button-fab icon="plus" @click="goToCollectionUpsert()" />

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
                            <fig-th sortable prop="published">{{ $t('Published') }}</fig-th>
                        </tr>
                    </template>

                    <tr v-for="(obj, idx) in collections" :key="idx">
                        <!-- name -->
                        <fig-td>
                            {{ obj.name }}
                            <fig-operations-dropdown
                                :show-view="false"
                                @edit="goToCollectionUpsert(obj.id)"
                                @delete="onDeleteCollection(obj)"
                                class="ml-1" />
                        </fig-td>

                        <!-- published -->
                        <fig-td>
                            <boolean-tag :value="obj.published" />
                        </fig-td>
                    </tr>

                    <fig-tr-no-results v-if="!collections.length" :colspan="2" />
                </fig-table-simple>
            </fig-overlay>

        </fig-pagination-wrapper>
    </div>
</template>
