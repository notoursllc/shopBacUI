<script>
import AppTable from '@/components/AppTable';
import OperationsDropdown from '@/components/OperationsDropdown';
import AccentMessageForm from '@/components/product/accentMessage/AccentMessageForm';
import Fab from '@/components/Fab';

export default {
    components: {
        AppTable,
        OperationsDropdown,
        AccentMessageForm,
        Fab
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
        <fab icon="plus" @click="onUpsertClick" />

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

        <b-modal
            ref="upsert_modal"
            size="lg"
            :title="dialog.id ? $t('Edit Item') : $t('Add Item')"
            hide-footer>
            <accent-message-form
                :id="dialog.id"
                @success="onUpsertSuccess" />
        </b-modal>
    </div>
</template>
