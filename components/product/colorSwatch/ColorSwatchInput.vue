<script>
import Vue from 'vue';
import { v4 as uuidv4 } from 'uuid';
import {
    FigFormInput,
    FigFormInputEndcapper,
    FigPopover,
    FigPopoverDivider,
    FigOverlay
} from '@notoursllc/figleaf';


export default {
    name: 'ColorInput',

    components: {
        FigFormInput,
        FigFormInputEndcapper,
        FigPopover,
        FigPopoverDivider,
        FigOverlay
    },

    inheritAttrs: false,

    props: {
        value: {},

        placeholder: {
            type: String,
            default: ''
        }
    },

    data: function() {
        return {
            selectedVal: [],
            allSwatches: [],
            loading: false,
            swatchesFetched: false,
            uuid: uuidv4()
        };
    },

    watch: {
        value: {
            handler(newVal) {
                this.selectedVal = newVal;
            },
            immediate: true
        }
    },

    methods: {
        onPopoverVisible(isVisible) {
            if(!this.swatchesFetched) {
                this.fetchSwatches();
                this.swatchesFetched = true;
            }
        },

        async fetchSwatches() {
            this.loading = true;

            try {
                this.allSwatches = await this.$api.productColorSwatches.all();
            }
            catch(e) {
                this.$figleaf.errorToast({
                    title: this.$t('Error'),
                    text: e.message
                });
            }

            this.loading = false;
        },

        emitInput(hex, label) {
            this.$emit('input', {
                hex,
                label
            });
        },

        onSelectSwatch(obj) {
            this.selectedVal = obj.hex;

            this.emitInput(
                this.selectedVal,
                obj.label
            );

            this.$refs[this.uuid].hide();
        }
    }
};
</script>

<template>
    <fig-form-input-endcapper suffix-as="button">
        <fig-form-input
            type="color"
            v-model="selectedVal"
            square-right
            v-bind="$attrs"
            @input="emitInput" />

        <template v-slot:suffix>
            <fig-popover
                placement="bottom"
                @visible="onPopoverVisible"
                :ref="uuid">
                <fig-icon
                    slot="toggler"
                    icon="palette"
                    class="mt-1"
                    :width="20"
                    :height="20" />

                <div class="text-center">{{ $t('Choose a pre-defined swatch') }}:</div>
                <fig-popover-divider />

                <fig-overlay :show="loading">
                    <div class="swatch-container">
                        <table class="swatch-table cursor-pointer">
                            <tr
                                v-for="(obj, index) in allSwatches"
                                :key="index"
                                class="hover:bg-gray-200">
                                <td @click="onSelectSwatch(obj)">
                                    <div
                                        class="inline-block w-6 h-6 align-middle"
                                        :style="`background: ${obj.hex}`"></div>
                                </td>
                                <td class="text-xs" @click="onSelectSwatch(obj)">{{ obj.hex }}</td>
                                <td class="swatch-label" @click="onSelectSwatch(obj)">
                                    <div class="pl-2 font-semibold">{{ obj.label }}</div>
                                </td>
                            </tr>
                        </table>
                    </div>
                </fig-overlay>
            </fig-popover>
        </template>
    </fig-form-input-endcapper>
</template>


<style lang="postcss" scoped>
.swatch-container {
    @apply mt-2 overflow-y-auto;
    max-height: 200px;
    max-width: 300px;
}
.swatch-label {
    @apply truncate break-words;
    max-width: 200px;
}
.swatch-table {
    @apply border-0;
}
.swatch-table td {
    @apply align-middle;
    padding: 2px;
}
</style>





