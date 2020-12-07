<script>
import isObject from 'lodash.isobject';

import {
    FigTableSimple,
    FigTh,
    FigTd
} from '@notoursllc/figleaf';


export default {
    name: 'TableBuilderView',

    components: {
        FigTableSimple,
        FigTh,
        FigTd
    },

    props: {
        tableData: {
            type: Object,
            default: () => {
                return {};
            }
        }
    },

    data: function() {
        return {
            selectedVal: null,
            selectOptions: []
        };
    },

    computed: {
        cols() {
            return isObject(this.tableData) ? this.tableData.columns : [];
        },

        rows() {
            return isObject(this.tableData) ? this.tableData.rows : [];
        }
    },

    // watch: {
    //     value: {
    //         handler(newVal) {
    //             this.selectedVal = newVal;
    //         },
    //         immediate: true
    //     }
    // },

    // created() {
    //     this.createOptions();
    // },

    methods: {

    }
};
</script>


<template>
    <fig-table-simple
        striped
        hover
        table-class="table-builder-table table-builder-details">
        <template slot="head">
            <tr>
                <fig-th class="th"></fig-th>
                <fig-th
                    v-for="(obj, index) in cols"
                    :key="index"
                    class="th">{{ obj.label }}
                </fig-th>
            </tr>
        </template>

        <tbody>
            <tr v-for="(row, idx) in rows" :key="idx">
                <fig-td class="th">{{ row.label }}</fig-td>
                <fig-td v-for="obj in row.cells" :key="obj.columnId">{{ obj.value }}</fig-td>
            </tr>
        </tbody>
    </fig-table-simple>
</template>

<style lang="scss">
@import "~assets/css/components/_tableBuilderComponent.scss";
</style>
