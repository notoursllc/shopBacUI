<script>
import AppTable from '@/components/AppTable';
import OperationsDropdown from '@/components/OperationsDropdown';
import AccentMessageForm from '@/components/product/accentMessage/AccentMessageForm';

import {
    FigButtonFab,
    FigModal
} from '@notoursllc/figleaf';

export default {
    components: {
        AppTable,
        OperationsDropdown,
        AccentMessageForm,
        FigButtonFab,
        FigModal
    },


    data() {
        return {
            dialog: {
                id: null
            },
            messages: [],
            tableData: {
                headers: [
                    { key: 'message', label: this.$t('Accent Message'), sortable: true }
                ]
            },
            tableSort: {sortBy: 'message', sortDesc: false}
        };
    },

    created() {
        this.init();
    },

    methods: {
        init() {
            this.fetchData(this.tableSort);
        },

        async fetchData(paramsObj) {
            try {
                const { data } = await this.$api.productAccentMessages.list(paramsObj);
                this.messages = data;
            }
            catch(e) {
                this.$errorToast(e.message);
            }
        },

        sortChanged(val) {
            this.tableSort = val;
            this.fetchData(this.tableSort);
        },

        async deleteType(data) {
            const confirmed = await this.$confirmModal(
                this.$t('remove_label?', {label: data.message}),
                'warning'
            );

            if(!confirmed) {
                return;
            }

            try {
                const response = await this.$api.productAccentMessages.delete(data.id);

                if(!response) {
                    throw new Error(this.$t('Item not found'));
                }

                this.init();
                this.$successToast(this.$t('item_deleted_label', {label: data.message}));
            }
            catch(e) {
                this.$errorToast(e.message);
            }
        },

        onUpsertClick(id) {
            this.dialog.id = id || null;
            this.$refs.upsert_modal.show();
        },

        onUpsertSuccess() {
            this.$refs.upsert_modal.hide();
            this.init();
        }
    }
};
</script>


<template>
    <div>
        <fig-button-fab icon="plus" @click="onUpsertClick()" />

        <app-table
            :items="messages"
            :fields="tableData.headers"
            @column-sort="sortChanged">

            <template v-slot:cell(message)="row">
                {{ row.item.message }}
                <operations-dropdown
                    :show-view="false"
                    @edit="onUpsertClick(row.item.id)"
                    @delete="deleteType(row.item)"
                    class="mls" />
            </template>
        </app-table>

        <fig-modal
            ref="upsert_modal"
            size="lg">
            <div slot="header">
                {{ dialog.id ? $t('Edit Item') : $t('Add Item') }}
            </div>

            <accent-message-form
                :id="dialog.id"
                @success="onUpsertSuccess" />
        </fig-modal>

    </div>
</template>
