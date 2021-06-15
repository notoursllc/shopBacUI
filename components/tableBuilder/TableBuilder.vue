<script>
import isObject from 'lodash.isobject';
import draggable from 'vuedraggable';
import PopConfirm from '@/components/PopConfirm';
import DataTableSelect from '@/components/product/dataTable/DataTableSelect';
import AppMessage from '@/components/AppMessage';

import {
    FigButton,
    FigFormInput,
    FigFormInputEndcapper,
    FigFormGroup,
    FigTooltip,
    FigPopover,
    FigOverlay,
    FigTableSimple,
    FigTh,
    FigTd
} from '@notoursllc/figleaf';

export default {
    components: {
        draggable,
        PopConfirm,
        DataTableSelect,
        AppMessage,
        FigButton,
        FigFormInput,
        FigFormInputEndcapper,
        FigFormGroup,
        FigTooltip,
        FigPopover,
        FigOverlay,
        FigTableSimple,
        FigTh,
        FigTd
    },

    props: {
        value: {
            type: Object,
            default: () => {
                return {};
            }
        },

        showImport: {
            type: Boolean,
            default: false
        }
    },

    data: function() {
        return {
            tableData: {
                columns: [],
                rows: []
            },
            importFromDataTableId: null,
            canDoImport: false,
            loading: false
        };
    },

    computed: {
        canShowRowGrabHandles() {
            return Array.isArray(this.tableData.rows) && this.tableData.rows.length > 1;
        },

        numColumns() {
            return Array.isArray(this.tableData.columns) ? this.tableData.columns.length : 0;
        },

        numRows() {
            return Array.isArray(this.tableData.rows) ? this.tableData.rows.length : 0;
        }
    },

    watch: {
        value: {
            handler(newVal) {
                if(isObject(newVal) && Object.keys(newVal).length) {
                    this.tableData = newVal;
                }
                else {
                    this.init();
                }
            },
            immediate: true
        }
    },

    created() {
        this.setCanDoImport();
    },

    methods: {
        emitInput() {
            this.$emit(
                'input',
                this.tableData
            );
        },

        canShowLeftIcon(index) {
            return !!this.tableData.columns[index - 1];
        },

        canShowRightIcon(index) {
            return !!this.tableData.columns[index + 1];
        },

        onColumnMove(index, moveLeft) {
            const new_index = moveLeft ? index - 1 : index + 1;

            const removedCols = this.tableData.columns.splice(index, 1);
            this.tableData.columns.splice(new_index, 0, removedCols[0]);

            this.tableData.rows.forEach((row) => {
                const removed = row.cells.splice(index, 1);
                row.cells.splice(new_index, 0, removed[0]);
            });

            this.emitInput();
        },

        pushNewColumn(label) {
            this.tableData.columns.push(
                { label: label || null }
            );
        },

        addColumn() {
            this.pushNewColumn();

            if(!this.numRows) {
                this.addRow();
            }
            else {
                // push a new value on to each row
                this.tableData.rows.forEach((row) => {
                    row.cells.push({ value: null });
                });
            }

            this.emitInput();
        },

        addRow() {
            if(!this.numColumns) {
                this.addColumn();
            }
            else {
                const row = {
                    label: null,
                    cells: []
                };

                this.tableData.columns.forEach((obj) => {
                    row.cells.push(
                        { value: null }
                    );
                });

                this.tableData.rows.push(row);
            }

            this.emitInput();
        },

        deleteRow(index) {
            this.tableData.rows.splice(index, 1);
            this.init();
        },

        deleteColumn(index) {
            this.tableData.columns.splice(index, 1);

            this.tableData.rows.forEach((row) => {
                row.cells.splice(index, 1);
            });

            // if all columns have been removed then remove all rows too
            // if(!this.tableData.columns.length) {
            //     let i = this.tableData.rows.length;

            //     while (i--) {
            //         this.tableData.rows.splice(i, 1);
            //     }
            // }

            this.init();
        },

        onInputChange(val) {
            this.emitInput();
        },

        async doDataImport() {
            await this.fetchDataTable(this.importFromDataTableId);
            this.emitInput();
        },

        clearTable() {
            this.tableData.columns = [];
            this.tableData.rows = [];
            this.init();
        },

        async fetchDataTable(id) {
            if(!id) {
                return;
            }

            this.loading = true;

            try {
                const data = await this.$api.productDataTables.get(id);

                if(!data) {
                    throw new Error(this.$t('Data Table not found'));
                }

                this.tableData = data.table_data;
            }
            catch(e) {
                this.$errorToast({
                    title: this.$t('Error'),
                    text: e.message
                });
            }

            this.loading = false;
        },

        async setCanDoImport() {
            try {
                const results = await this.$api.productDataTables.list({
                    limit: 1
                });

                this.canDoImport = results.length;
            }
            catch(e) {
                this.$errorToast({
                    title: this.$t('Error'),
                    text: e.message
                });
            }
        },

        init() {
            if(!this.numColumns) {
                this.addColumn();
            }

            if(!this.numRows) {
                this.addRow();
            }

            this.emitInput();
        }
    }
};
</script>


<template>
    <div>
        <fig-overlay :show="loading">
            <fig-table-simple
                hover
                responsive
                table-class="table-builder-table">
                <template slot="head">
                    <tr>
                        <fig-th class="grab-handle-cell no-color" v-show="canShowRowGrabHandles"></fig-th>
                        <fig-th class="th align-top">
                            <!-- import button -->
                            <pop-confirm
                                v-if="showImport"
                                :confirm-button-label="$t('Import')"
                                :show-confirm-button="!!canDoImport"
                                :cancel-button-label="!canDoImport ? $t('OK') : ''"
                                @onConfirm="doDataImport();">
                                <div>
                                    <template v-if="canDoImport">
                                        <fig-form-group>
                                            <label slot="label" for="select_data_table">{{ $t('Import data from an existing Data Table') + ':' }}</label>
                                            <data-table-select
                                                v-model="importFromDataTableId"
                                                id="select_data_table"
                                                size="sm" />
                                        </fig-form-group>

                                        <app-message>
                                            <template v-slot:icon>
                                                <fig-icon icon="alert-circle" variant="warning" />
                                            </template>
                                            {{ $t('This action will override existing table data.') }}
                                        </app-message>
                                    </template>

                                    <template v-else>
                                        {{ $t("There aren't any pre-defined data tables to import from.") }}
                                    </template>
                                </div>

                                <fig-tooltip placement="top">
                                    <fig-button
                                        slot="reference"
                                        variant="plain"
                                        size="sm"
                                        icon="import"
                                        class="border-dashed-2" />
                                    {{ $t('Import data from an existing Data Table') }}
                                </fig-tooltip>

                            </pop-confirm>
                        </fig-th>

                        <fig-th
                            v-for="(obj, index) in tableData.columns"
                            :key="index"
                            class="th">
                            <div class="col-icon-container">
                                <pop-confirm @onConfirm="deleteColumn(index);">
                                    <div class="whitespace-nowrap">{{ $t('Delete this column?') }}</div>

                                    <fig-button
                                        slot="reference"
                                        variant="plain"
                                        size="sm"
                                        class="border-dashed-2">
                                        <template slot="icon">
                                            <fig-icon icon="trash" stroke-width="1px" /><fig-icon icon="arrow-down" />
                                        </template>
                                    </fig-button>
                                </pop-confirm>
                                <!-- <fig-popover placement="top">
                                    <fig-button
                                        slot="toggler"
                                        variant="plain"
                                        size="sm"
                                        class="border-dashed-2">
                                        <template slot="icon">
                                            <fig-icon icon="trash" stroke-width="1px" /><fig-icon icon="arrow-down" />
                                        </template>
                                    </fig-button>

                                    <div slot="header">header</div>
                                    <div>popover content</div>
                                    <div slot="footer" class="text-right">footer</div>
                                </fig-popover> -->
                            </div>

                            <fig-form-input-endcapper>
                                <fig-button
                                    v-if="canShowLeftIcon(index)"
                                    slot="prefix"
                                    size="sm"
                                    variant="ghost"
                                    @click="onColumnMove(index, true)"
                                    icon="arrow-left" />

                                <fig-form-input
                                    v-model="tableData.columns[index].label"
                                    :placeholder="$t('Column label')"
                                    size="md"
                                    :square-left="canShowLeftIcon(index)"
                                    :square-right="canShowRightIcon(index)"
                                    @input="onInputChange" />

                                <fig-button
                                    v-if="canShowRightIcon(index)"
                                    slot="suffix"
                                    size="sm"
                                    variant="ghost"
                                    @click="onColumnMove(index, false)"
                                    icon="arrow-right" />
                            </fig-form-input-endcapper>
                        </fig-th>

                        <!-- add column button -->
                        <fig-th class="no-color empty-column-cell">
                            <fig-button
                                @click="addColumn"
                                variant="plain"
                                size="sm"
                                icon="plus">{{ $t('column') }}</fig-button>
                        </fig-th>
                    </tr>
                </template>

                <draggable
                    v-model="tableData.rows"
                    handle=".handle"
                    ghost-class="ghost"
                    tag="tbody">
                    <tr v-for="(row, idx) in tableData.rows" :key="idx">
                        <!-- drag handle -->
                        <fig-td class="no-color grab-handle-cell" v-show="canShowRowGrabHandles">
                            <i class="handle cursor-grab">
                                <fig-icon icon="dots-vertical-double" />
                            </i>
                        </fig-td>

                        <!-- row label -->
                        <fig-td class="th">
                            <fig-form-input
                                v-model="row.label"
                                size="sm"
                                :placeholder="$t('Row label')"
                                @input="onInputChange" />
                        </fig-td>

                        <!-- row inputs -->
                        <fig-td v-for="obj in row.cells" :key="obj.columnId">
                            <fig-form-input
                                v-model="obj.value"
                                size="sm"
                                @input="onInputChange" />
                        </fig-td>

                        <!-- delete button -->
                        <fig-td class="no-color empty-column-cell">
                            <pop-confirm @onConfirm="deleteRow(idx)">
                                {{ $t('Delete this row?') }}

                                <fig-button
                                    slot="reference"
                                    variant="plain"
                                    size="sm"
                                    class="border-dashed-2">
                                    <template slot="icon">
                                        <fig-icon icon="arrow-left" /><fig-icon icon="trash" stroke-width="1px" />
                                    </template>
                                </fig-button>
                            </pop-confirm>
                        </fig-td>
                    </tr>
                </draggable>

                <tr>
                    <fig-td class="no-color" v-show="canShowRowGrabHandles"></fig-td>

                    <!-- add row button -->
                    <fig-td class="no-color empthy-row-cell" :colspan="numColumns + 1">
                        <fig-button
                            @click="addRow"
                            variant="plain"
                            size="sm"
                            icon="plus">{{ $t('row') }}</fig-button>

                        <pop-confirm @onConfirm="clearTable()">
                            <app-message>
                                <fig-icon slot="icon" icon="alert-circle" />
                                {{ $t('Are you sure you want to remove all data from this table?') }}
                            </app-message>

                            <fig-button
                                slot="reference"
                                variant="plain"
                                size="sm"
                                icon="trash"
                                class="ml-3 border-dashed-2">{{ $t('Clear table') }}</fig-button>
                        </pop-confirm>
                    </fig-td>

                    <fig-td class="no-color"></fig-td>
                </tr>
            </fig-table-simple>
        </fig-overlay>
    </div>
</template>

<style lang="scss">
@import "~assets/css/components/_tableBuilderComponent.scss";
</style>
