<script>
import TableBuilder from '@/components/tableBuilder/TableBuilder';

import {
    FigButton,
    FigFormInput,
    FigFormGroup,
    FigOverlay
} from '@notoursllc/figleaf';


export default {
    components: {
        TableBuilder,
        FigButton,
        FigFormInput,
        FigFormGroup,
        FigOverlay
    },

    data() {
        return {
            loading: false,
            data: {}
        };
    },

    mounted() {
        if(this.$route.params.id) {
            this.fetchData();
        }
    },

    methods: {
        async fetchData() {
            const id = this.$route.params.id;
            this.loading = true;

            try {
                const data = await this.$api.productDataTables.get(id);

                if(!data) {
                    throw new Error(this.$t('Data Table not found'));
                }

                this.data = data;
            }
            catch(e) {
                this.$errorToast(e.message);
            }

            this.loading = false;
        },


        async onSaveClick() {
            try {
                this.loading = true;
                const p = await this.$api.productDataTables.upsert(this.data);

                if(!p) {
                    throw new Error('Error updating Data Table');
                }

                const title = p.id ? this.$t('Data Table updated successfully') : this.$t('Data Table added successfully');
                this.$successToast(`${title}: ${p.title}`);

                this.$router.push({
                    name: 'product-datatables-list'
                });
            }
            catch(e) {
                this.$errorToast(e.message);
            }

            this.loading = false;
        },

        onCancelClick() {
            this.$router.push({
                name: 'product-datatables-list'
            });
        }
    }
};
</script>


<template>
    <fig-overlay :show="loading">

        <fig-form-group>
            <label slot="label" for="input_name">{{ $t('Name')+ ':' }}</label>
            <fig-form-input
                v-model="data.name"
                class="w-52"
                id="input_name" />
        </fig-form-group>

        <fig-form-group>
            <label slot="label">{{ $t('Data table')+ ':' }}</label>
            <table-builder
                v-model="data.table_data"
                :show-import="true" />
        </fig-form-group>

        <div class="mt-5">
            <fig-button
                variant="primary"
                @click="onSaveClick">{{ $t('Save') }}</fig-button>

            <fig-button
                variant="plain"
                class="ml-2"
                @click="onCancelClick">{{ $t('cancel') }}</fig-button>
        </div>

    </fig-overlay>
</template>


<style lang="scss">
// @import "~assets/css/components/_table.scss";
@import "~assets/css/components/_formRow.scss";
</style>
