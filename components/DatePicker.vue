<script>
import Vue from 'vue';
import flatPickr from 'vue-flatpickr-component';
import 'flatpickr/dist/flatpickr.css';

// Config options: https://flatpickr.js.org/options/
// Events:  https://flatpickr.js.org/events/
// Formatting tokens:  https://flatpickr.js.org/formatting/

const defaultConfig = {
    dateFormat: 'Z',
    wrap: true,
    altFormat: 'M j, Y',
    altInput: true,
    enableTime: true,
    hourIncrement: 1,
    minuteIncrement: 1
};


export default Vue.extend({
    components: {
        flatPickr
    },

    inheritAttrs: false,

    props: {
        value: {
            type: String,
            default: null
        }
    },

    data () {
        return {
            selectedDate: null
        };
    },

    computed: {
        finalConfig() {
            return Object.assign({}, defaultConfig, this.$attrs.config);
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
        onChange(selectedDates, dateString) {
            this.$emit('input', dateString);
        },

        onClear() {
            this.$refs.datePicker.fp.clear();
        }
    }
});
</script>


<template>
    <b-input-group class="date-picker">
        <flat-pickr
            v-model="selectedDate"
            :config="finalConfig"
            @on-change="onChange"
            v-bind="$attrs"
            ref="datePicker" />

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
        border: 1px solid #b1b7c1 !important;
        border-radius: 4px !important;
        background-color: #fff;
        cursor: pointer;
    }
}
</style>
