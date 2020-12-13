<script>
import OperationsDropdown from '@/components/OperationsDropdown';

import {
    FigButtonFab,
    FigTableSimple,
    FigTh,
    FigTd
} from '@notoursllc/figleaf';

export default {
    components: {
        OperationsDropdown,
        FigButtonFab,
        FigTableSimple,
        FigTh,
        FigTd
    },

    data() {
        return {
            dataTables: []
        };
    },

    created() {
        this.fetchData();
    },

    methods: {
        // will need to add pagination params in the future
        async fetchData(paramsObj) {
            try {
                this.dataTables = await this.$api.productDataTables.list(paramsObj);
            }
            catch(e) {
                this.$errorToast({
                    title: this.$t('Error'),
                    text: e.message
                });
            }
        },

        sortChanged(val) {
            this.fetchData({
                sortBy: val.by,
                sortDesc: !val.isAsc
            });
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

                const result = await this.$api.productDataTables.delete(data.id);

                if(!result) {
                    throw new Error(this.$t('Data Table not found'));
                }

                this.fetchData();
                this.$successToast(
                    this.$t('deleted_name', { name: data.name })
                );
            }
            catch(e) {
                this.$errorToast({
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
                    <operations-dropdown
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
        </fig-table-simple>
    </div>
</template>
