<script>
import draggable from 'vuedraggable';
import PopConfirm from '@/components/PopConfirm';
import SizeInput from '@/components/product/size/SizeInput';


export default {
    name: 'SizeChooserForm',

    components: {
        draggable,
        PopConfirm,
        SizeInput
    },

    props: {
        sizeModel: {
            type: Array,
            default: () => {
                return [];
            }
        }
    },

    data: function() {
        return {
            selectedSizes: [],
            search: '',
            value: []
        };
    },

    watch: {
        sizeModel: {
            handler(newVal) {
                if(Array.isArray(newVal)) {
                    this.sizes = newVal;
                }
            },
            immediate: true
        }
    },

    methods: {
        emitInput() {
            this.$emit('input', this.selectedSizes);
        },

        onSizeSelect(val) {
            // console.log("ON SIZE SELET", val)
            // console.log("SELETRED", this.selectedSizes)
        },

        removeSelectedSize(index) {
            this.selectedSizes.splice(index, 1);
            this.emitInput();
        },

        addRow() {
            this.selectedSizes.push({
                ordinal: this.selectedSizes.length,
                label: null,
                data: {}
            });
        }
    }
};
</script>


<template>
    <div>
        <b-table-simple
            hover
            small
            responsive
            table-class="bread-table"
            v-show="selectedSizes.length">
            <b-thead>
                <b-tr>
                    <b-th v-if="selectedSizes.length > 1" class="width50"></b-th>
                    <b-th>{{ $t('Size') }}</b-th>
                    <b-th></b-th>
                    <b-th class="width100"></b-th>
                </b-tr>
            </b-thead>

            <draggable
                v-model="selectedSizes"
                ghost-class="ghost"
                handle=".handle"
                tag="b-tbody">

                <b-tr v-for="(size, index) in selectedSizes" :key="index">
                    <!-- handle -->
                    <b-td v-if="selectedSizes.length > 1">
                        <i class="handle">
                            <fig-icon icon="dots-vertical-double" />
                        </i>
                    </b-td>

                    <!-- size -->
                    <b-td>
                        <size-input v-model="size.label" />
                    </b-td>

                    <!-- label -->
                    <b-td class="vam">
                        todo
                    </b-td>

                    <!-- actions -->
                    <b-td class="text-center">
                        <pop-confirm
                            @onConfirm="removeSelectedSize(index)">
                            {{ $t('Delete this item?') }}

                            <b-button
                                slot="reference"
                                variant="outline-secondary"
                                class="mls border-dashed-2">
                                <fig-icon icon="trash" stroke-width="1px" width="18" height="18" />
                            </b-button>
                        </pop-confirm>
                    </b-td>
                </b-tr>
            </draggable>
        </b-table-simple>

        <div class="pt-2">
            <b-button
                variant="primary"
                size="sm"
                @click="addRow">
                <fig-icon icon="plus" /> {{ $t('Add Size') }}
            </b-button>
        </div>
    </div>
</template>


<style lang="scss">
.handle {
    cursor: grab;
}
</style>


