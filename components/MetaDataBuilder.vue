<script>
import draggable from 'vuedraggable';
import {
    FigButton,
    FigFormInput,
    FigPopConfirm
} from '@notoursllc/figleaf';


export default {
    components: {
        draggable,
        FigPopConfirm,
        FigButton,
        FigFormInput
    },

    props: {
        value: {
            type: Array,
            default: function() {
                return [];
            }
        },

        propertyPlaceholder: {
            type: String,
            default: null
        },

        valuePlaceholder: {
            type: String,
            default: function() {
                return this.$t('Value');
            }
        },

        isSortable: {
            type: Boolean,
            default: true
        }
    },

    data: function() {
        return {
            newdata: []
        };
    },

    computed: {
        canSortRows() {
            return this.isSortable && this.newdata.length > 1;
        }
    },

    watch: {
        value: {
            handler(newVal) {
                this.newdata = Array.isArray(newVal) ? newVal : [];

                if(!this.newdata.length) {
                    this.addNewItem();
                }
            },
            immediate: true
        }
    },

    methods: {
        emitInput() {
            if(!this.newdata.length) {
                this.$emit('input', null);
                return;
            }

            this.$emit('input', this.newdata);
        },

        sanitize() {
            let i = this.newdata.length;
            while (i--) {
                if(!this.newdata[i].property && !this.newdata[i].value) {
                    this.newdata.splice(i, 1);
                }
            }
        },

        onInputChange() {
            this.sanitize();
            this.emitInput();
        },

        onClickDeleteRow(index) {
            this.newdata.splice(index, 1);
            this.sanitize();
            this.emitInput();

            if(!this.newdata.length) {
                this.addNewItem();
            }
        },

        addNewItem() {
            this.newdata.push(
                { property: null, value: null }
            );
        }
    }
};
</script>


<template>
    <div>
        <div class="metaDataHeader">
            <draggable
                v-model="newdata"
                handle=".meta-row-handle"
                @update="emitInput"
                ghost-class="ghost"
                tag="div">
                <div class="meta-row" v-for="(obj, index) in newdata" :key="index">
                    <div class="meta-row-fields">
                        <!-- drag handle -->
                        <div class="meta-row-handle cursor-grab" v-if="canSortRows">
                            <fig-icon icon="dots-vertical-double" />
                        </div>

                        <div class="meta-row-property">
                            <fig-form-input
                                v-model="obj.property"
                                @input="onInputChange"
                                :placeholder="propertyPlaceholder" />
                        </div>

                        <div class="meta-row-value">
                            <fig-form-input
                                v-model="obj.value"
                                @input="onInputChange"
                                :placeholder="valuePlaceholder" />

                            <fig-pop-confirm @confirm="onClickDeleteRow(index)">
                                {{ $t('Delete this row?') }}

                                <fig-button
                                    slot="reference"
                                    class="ml-4"
                                    variant="plain"
                                    icon="trash"
                                    dotted />
                            </fig-pop-confirm>
                        </div>
                    </div>
                </div>
            </draggable>
        </div>

        <div class="metaDataFooter">
            <fig-button
                @click="addNewItem"
                variant="plain"
                icon="plus">{{ $t('New item') }}</fig-button>
        </div>
    </div>
</template>

<style lang="scss" scoped>
@import "~assets/css/components/_mixins.scss";

.metaDataHeader {
    .meta-row {
        @include flexbox();
        @include flex-direction(column);
    }
    .meta-row-fields {
        @include flexbox();
    }
    .meta-row-handle {
        width: 25px;
        @include flexbox();
        @include align-items(center);
    }
    .meta-row-property {
        @include flex(0 0 180px);
        padding: 2px 5px 2px 0;
    }
    .meta-row-value {
        @include flexbox();
        @include flex(1 1 auto);
        @include align-items(flex-start);
        padding: 2px 5px 2px 0;
    }
}

.metaDataFooter {
    padding-top: 10px;
    text-align: left;
}
</style>
