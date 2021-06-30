<script>
import draggable from 'vuedraggable';
import ColorSwatchInput from '@/components/product/colorSwatch/ColorSwatchInput';

import {
    FigButton,
    FigFormInput,
    FigTableSimple,
    FigTh,
    FigTd,
    FigPopConfirm
} from '@notoursllc/figleaf';

export default {
    name: 'VariantExhibitForm',

    components: {
        draggable,
        ColorSwatchInput,
        FigButton,
        FigFormInput,
        FigTableSimple,
        FigTh,
        FigTd,
        FigPopConfirm
    },

    props: {
        value: {
            type: Array,
            default: () => {
                return [];
            }
        }
    },

    data: function() {
        return {
            selectedColors: [],
            maxSelectedColors: this.$config.COLOR_SWATCH_MAX_SWATCHES || 3,
            allSwatchHexValues: []
        };
    },

    computed: {
        numRemainingColors() {
            return this.maxSelectedColors - this.selectedColors.length;
        }
    },

    watch: {
        value: {
            handler(newVal) {
                if(Array.isArray(newVal)) {
                    this.selectedColors = newVal;
                }
            },
            immediate: true,
            deep: true
        },

        selectedColors: {
            handler(newVal) {
                this.emitInput();
            },
            deep: true
        }
    },

    created() {
        this.fetchAllSwatches();
    },

    methods: {
        emitInput() {
            this.$emit('input', this.selectedColors);
        },

        async fetchAllSwatches() {
            const all = await this.$api.productColorSwatches.all();

            if(Array.isArray(all)) {
                this.allSwatchHexValues = all.map(obj => obj.hex);
            }
        },

        onDeleteColor(index) {
            this.selectedColors.splice(index, 1);
        },

        canShowSaveButton(obj) {
            const canSave = this.allSwatchHexValues.indexOf(obj.swatch) === -1;
            return obj.label && obj.swatch && canSave;
        },

        addColorRow() {
            this.selectedColors.push({
                label: null,
                swatch: '#000000'
            });
        },

        onColorSwatchChange(index, data) {
            this.$set(this.selectedColors[index], 'swatch', data.hex);
            this.$set(this.selectedColors[index], 'label', data.label);
        },

        async onSaveSwatchToPreDefined(index) {
            try {
                const data = this.selectedColors[index];
                const response = await this.$api.productColorSwatches.upsert({
                    hex: data.swatch,
                    label: data.label
                });

                if(!response) {
                    throw new Error(this.$t('Error adding swatch'));
                }

                this.$figleaf.successToast({
                    title: this.$t('Success'),
                    text: this.$t('Swatch added successfully: {hex}', {hex: data.swatch})
                });

                this.fetchAllSwatches();
            }
            catch(e) {
                this.$figleaf.errorToast({
                    title: this.$t('Error'),
                    text: e.message
                });
            }
        }
    }
};
</script>


<template>
    <div>
        <fig-table-simple
            striped
            hover
            v-if="selectedColors.length">
            <template slot="head">
                <tr>
                    <fig-th v-if="selectedColors.length > 1" class="handle-cell"></fig-th>
                    <fig-th class="w-40">{{ $t('Color') }}</fig-th>
                    <fig-th>{{ $t('Label') }}</fig-th>
                    <fig-th class="w-24"></fig-th>
                </tr>
            </template>

            <draggable
                v-model="selectedColors"
                ghost-class="ghost"
                handle=".handle"
                tag="tbody">

                <template v-for="(obj, index) in selectedColors">
                    <tr :key="index">
                        <!-- handle -->
                        <fig-td v-if="selectedColors.length > 1" class="align-middle">
                            <i class="handle">
                                <fig-icon icon="dots-vertical-double" />
                            </i>
                        </fig-td>

                        <!-- color -->
                        <fig-td>
                            <color-swatch-input
                                :value="obj.swatch"
                                @input="(data) => onColorSwatchChange(index, data)" />
                        </fig-td>

                        <!-- label -->
                        <fig-td class="align-middle">
                            <fig-form-input
                                v-model="obj.label"
                                class="w-full"
                                :placeholder="$t('example: Black')" />
                        </fig-td>

                        <!-- actions -->
                        <fig-td class="text-center align-middle">
                            <div class="flex items-center">
                                <fig-pop-confirm
                                    @confirm="onDeleteColor(index)">
                                    {{ $t('Delete this item?') }}

                                    <fig-button
                                        slot="reference"
                                        variant="plain"
                                        dotted
                                        class="ml-2"
                                        icon="trash" />
                                </fig-pop-confirm>

                                <fig-pop-confirm
                                    @confirm="onSaveSwatchToPreDefined(index)">
                                    {{ $t('Save to your pre-defined color swatches?') }}

                                    <fig-button
                                        v-if="canShowSaveButton(obj)"
                                        slot="reference"
                                        variant="plain"
                                        dotted
                                        class="ml-2"
                                        icon="floppy" />
                                </fig-pop-confirm>
                            </div>
                        </fig-td>
                    </tr>
                </template>

            </draggable>
        </fig-table-simple>

        <div class="pt-2">
            <fig-button
                variant="primary"
                size="sm"
                @click="addColorRow"
                icon="plus"
                :disabled="numRemainingColors <= 0">{{ $t('Add swatch') }}</fig-button>

            <div class="text-muted text-sm pt-2">{{ $t('You can add up to {number} swatches', {number: maxSelectedColors} ) }}</div>
        </div>
    </div>
</template>


<style>
.handle {
    cursor: grab;
}
.handle-cell {
    width: 30px;
}
</style>
