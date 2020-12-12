<script>
import OperationsDropdown from '@/components/OperationsDropdown';
import AccentMessageForm from '@/components/product/accentMessage/AccentMessageForm';

import {
    FigButtonFab,
    FigModal,
    FigTableSimple,
    FigTh,
    FigTd
} from '@notoursllc/figleaf';

export default {
    components: {
        OperationsDropdown,
        AccentMessageForm,
        FigButtonFab,
        FigModal,
        FigTableSimple,
        FigTh,
        FigTd
    },

    data() {
        return {
            dialog: {
                id: null
            },
            messages: [],
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
                this.$errorToast({
                    title: this.$t('Error'),
                    text: e.message
                });
            }
        },

        sortChanged(val) {
            this.tableSort = {
                sortBy: val.by,
                sortDesc: !val.isAsc
            };
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

                this.$successToast({
                    title: this.$t('Success'),
                    text: this.$t('item_deleted_label', {label: data.message})
                });
            }
            catch(e) {
                this.$errorToast({
                    title: this.$t('Error'),
                    text: e.message
                });
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


        <fig-table-simple
            striped
            hover
            @sort="sortChanged">
            <template slot="head">
                <tr>
                    <fig-th sortable prop="message">{{ $t('Accent Message') }}</fig-th>
                </tr>
            </template>

            <tr v-for="(obj, idx) in messages" :key="idx">
                <fig-td>
                    {{ obj.message }}
                    <operations-dropdown
                        :show-view="false"
                        @edit="onUpsertClick(obj.id)"
                        @delete="deleteType(obj)"
                        class="ml-1" />
                </fig-td>
            </tr>
        </fig-table-simple>


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
