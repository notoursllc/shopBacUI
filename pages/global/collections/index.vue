<script>
import OperationsDropdown from '@/components/OperationsDropdown';
import BooleanTag from '@/components/BooleanTag';

import {
    FigButtonFab,
    FigTableSimple,
    FigTh,
    FigTd
} from '@notoursllc/figleaf';

export default {
    components: {
        OperationsDropdown,
        BooleanTag,
        FigButtonFab,
        FigTableSimple,
        FigTh,
        FigTd
    },

    data() {
        return {
            collections: []
        };
    },

    created() {
        this.fetchCollections();
        this.$store.dispatch('ui/title', this.$t('Product collections'));
    },

    methods: {
        async fetchCollections(paramsObj) {
            try {
                this.collections = await this.$api.productCollections.list(paramsObj);
            }
            catch(e) {
                this.$errorToast({
                    title: this.$t('Error'),
                    text: e.message
                });
            }
        },

        sortChanged(val) {
            this.fetchCollections({
                sortBy: val.by,
                sortDesc: !val.isAsc
            });
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
                const collection = await this.$api.productCollections.delete(data.id);

                if(!collection) {
                    throw new Error(this.$t('Collection not found'));
                }

                this.fetchCollections();
                this.$successToast({
                    title: this.$t('Success'),
                    text: this.$t('deleted_name', {name: data.name})
                });
            }
            catch(e) {
                this.$errorToast({
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
                    <operations-dropdown
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
        </fig-table-simple>
    </div>
</template>
