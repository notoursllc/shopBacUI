<script>
import isObject from 'lodash.isobject';
import cloneDeep from 'lodash.clonedeep';
import { isUuid4 } from '@/utils/common';
import TableBuilder from '@/components/tableBuilder/TableBuilder';
import TableBuilderView from '@/components/tableBuilder/TableBuilderView';
import DataTableSelect from '@/components/product/dataTable/DataTableSelect';
import AppMessage from '@/components/AppMessage';

import {
    FigFormInput,
    FigFormGroup,
    FigFormSelect,
    FigOverlay
} from '@notoursllc/figleaf';

export default {
    name: 'DataTableWizard',

    components: {
        TableBuilder,
        TableBuilderView,
        DataTableSelect,
        AppMessage,
        FigFormInput,
        FigFormGroup,
        FigFormSelect,
        FigOverlay
    },

    inheritAttrs: false,

    props: {
        sku: {
            type: Object,
            default: null
        }
    },

    data: function() {
        return {
            loading: false,
            actionSelectOptions: [
                { label: this.$t('None'), value: null },
                { label: this.$t('Use pre-defined'), value: 'pre' },
                { label: this.$t('Create new'), value: 'create' }
            ],
            action: null,
            readOnlyTableData: null,
            readOnlyTableId: null,
            allDataTables: [],
            data_table: null,
            data_table_name: null
        };
    },

    computed: {
        canShowPredefinedTables() {
            return this.allDataTables.length;
        },

        visibleActionSelectOptions() {
            const opts = cloneDeep(this.actionSelectOptions);

            if(!this.canShowPredefinedTables) {
                opts.splice(1, 1);
            }

            return opts;
        },

        showWarning() {
            if(!this.readOnlyTableId) {
                return false;
            }

            let exists = false;

            this.allDataTables.forEach((opt) => {
                if(opt.id === this.readOnlyTableId) {
                    exists = true;
                }
            });

            return !exists;
        }
    },

    watch: {
        sku: {
            handler(newVal) {
                if(isObject(newVal)) {
                    let selectedOptionIndex = 0;

                    if(newVal.data_table_name) {
                        // data_table_name will be a UUID if the sku
                        // is using a pre-defined data table
                        if(isUuid4(newVal.data_table_name)) {
                            this.readOnlyTableId = newVal.data_table_name;
                            this.data_table_name = null;

                            selectedOptionIndex = 1;
                            this.fetchDataForReadOnlyTable(newVal);
                        }
                        // if data_table_name is a string that's not a UUID
                        // then this sku has it's own data table defined and
                        // is not using a pre-defined one
                        else {
                            this.readOnlyTableId = null;
                            this.data_table_name = newVal.data_table_name;
                            this.data_table = newVal.data_table;

                            selectedOptionIndex = 2;
                        }
                    }
                    else {
                        this.readOnlyTableId = null;
                        this.data_table_name = null;
                        this.data_table = null;
                    }

                    this.action = this.actionSelectOptions[selectedOptionIndex].value;
                }
                else {
                    this.data_table = null;
                    this.readOnlyTableId = null;
                    this.data_table_name = null;
                }
            },
            immediate: true
        }
    },

    created() {
        this.fetchAllDataTables();
    },

    methods: {
        async fetchDataTable(id) {
            if(!id) {
                return;
            }

            this.loading = true;
            let tableData;

            try {
                tableData = await this.$api.productDataTables.get(id);

                // if(!tableData) {
                //     throw new Error(this.$t('Data Table not found'));
                // }
            }
            catch(e) {
                this.$errorToast({
                    title: this.$t('Error'),
                    text: e.message
                });
            }

            this.loading = false;
            return tableData;
        },

        async fetchAllDataTables() {
            try {
                this.allDataTables = await this.$api.productDataTables.all();
            }
            catch(e) {
                this.$errorToast({
                    title: this.$t('Error'),
                    text: e.message
                });
            }
        },

        async fetchDataForReadOnlyTable() {
            const results = await this.fetchDataTable(this.readOnlyTableId);
            this.readOnlyTableData = isObject(results) ? results.table_data : null;
        },

        emitInput() {
            const data = {
                data_table_name: null,
                data_table: null
            };

            switch(this.action) {
                // pre
                case this.actionSelectOptions[1].value:
                    data.data_table_name = this.readOnlyTableId;
                    data.data_table = null;
                    break;

                // create
                case this.actionSelectOptions[2].value:
                    data.data_table_name = this.data_table_name;
                    data.data_table = this.data_table;
                    break;
            }

            this.$emit('input', data);
        },

        onTableBuilderChange() {
            this.emitInput();
        },

        onPredefinedSelectChange() {
            this.fetchDataForReadOnlyTable();
            this.emitInput();
        }
    }
};
</script>


<template>
    <div>
        <div class="pb-3" v-if="showWarning">
            <app-message>
                <template v-slot:icon>
                    <fig-icon
                        icon="alert-circle"
                        variant="danger"
                        :width="24"
                        :height="24" />
                </template>
                {{ $t('This SKU is assigned to a Data Table that no longer exists.') }}
            </app-message>
        </div>

        <fig-form-select
            v-model="action"
            :options="visibleActionSelectOptions"
            class="w-auto"
            @input="emitInput"
            :reduce="obj => obj.value" />

        <fig-icon
            icon="arrow-right"
            v-if="canShowPredefinedTables && (action === 'pre' || action === 'create')" />

        <!-- select predefined data table  -->
        <fig-form-group
            v-show="canShowPredefinedTables && action === 'pre'"
            class="inline-block mb-0 align-bottom">
            <label slot="label" for="input_choose_predefined">{{ $t('Choose') }}</label>
            <data-table-select
                v-model="readOnlyTableId"
                class="w-36"
                @input="onPredefinedSelectChange"
                id="input_choose_predefined" />
        </fig-form-group>

        <!-- new data table name -->
        <fig-form-group
            v-show="action === 'create'"
            class="inline-block mb-0 align-bottom">
            <label slot="label" for="input_create_dt">{{ $t('Name') }}</label>
            <fig-form-input
                v-if="action === 'create'"
                v-model="data_table_name"
                @input="emitInput"
                class="w-auto"
                id="input_create_dt" />
        </fig-form-group>

        <!-- table builder -->
        <div class="pt-4">
            <fig-overlay :show="loading">
                <fig-form-group
                    v-if="action === 'create'"
                    class="pb-2">
                    <label slot="label" for="data_table">{{ $t('Data table') }}</label>
                    <table-builder
                        v-model="data_table"
                        @input="onTableBuilderChange"
                        :show-import="true"
                        id="data_table"></table-builder>
                </fig-form-group>

                <table-builder-view
                    v-if="action === 'pre' && readOnlyTableId"
                    :table-data="readOnlyTableData" />
            </fig-overlay>
        </div>
    </div>
</template>
