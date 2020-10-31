<script>
import Vue from 'vue';
import flatpickr from '@notoursllc/figleaf/directives/flatpickr';


export default Vue.extend({
    directives: {
        flatpickr
    },

    inheritAttrs: false,

    props: {
        value: {
            type: String,
            default: null
        },

        config: {
            type: Object,
            default: () => {
                return {};
            }
        }
    },

    data () {
        return {
            selectedDate: null
        };
    },

    computed: {
        finalConfig() {
            // Config options: https://flatpickr.js.org/options/
            // Events:  https://flatpickr.js.org/events/
            // Formatting tokens:  https://flatpickr.js.org/formatting/

            const format = this.config.enableTime === false ? 'dateFormatPicker_mdy' : 'dateFormatPicker_mdy_hm';

            return Object.assign(
                {
                    dateFormat: 'Z',
                    altFormat: this.$t(format),
                    altInput: true,
                    enableTime: true,
                    hourIncrement: 1,
                    minuteIncrement: 1
                },
                this.config,
                {
                    wrap: false // needs to be false
                }
            );
        }
    },

    created() {
        const unwatch = this.$watch('value', function (newVal, oldVal) {
            if(newVal && !oldVal) {
                this.selectedDate = newVal;

                if(unwatch) {
                    unwatch();
                }
            }
        },
        { immediate: true });
    },

    methods: {
        onChange(val, dateString) {
            this.$emit('input', val);
        },

        onClear() {
            this.$refs.dateInput.$el._flatpickr.clear();
        }
    }
});
</script>


<template>
    <b-input-group v-bind="$attrs" class="date-picker">
        <b-form-input
            v-model="selectedDate"
            @input="onChange"
            v-on="$listeners"
            v-flatpickr="finalConfig"
            ref="dateInput"></b-form-input>

        <b-input-group-append v-show="selectedDate">
            <b-button variant="outline-secondary" @click="onClear">
                <fig-icon icon="x" width="18" height="18" />
            </b-button>
        </b-input-group-append>
    </b-input-group>
</template>


<style lang="scss">
.date-picker {
    input[readonly] {
        background-color: #fff;
        cursor: pointer;
        border-top-right-radius: 0 !important;
        border-bottom-right-radius: 0 !important;
    }
}
</style>
