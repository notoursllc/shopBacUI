<script>
import Vue from 'vue';

export default Vue.extend({
    name: 'Money',

    props: {
        cents: {
            type: [String, Number],
            default: 0
        }
    },

    computed: {
        dinero: function() {
            const val = parseInt(this.cents, 10);
            if(!isNaN(val) && val > 0) {
                return val/100;
            }
            return 0;
        }
    }
});
</script>

<template>
    <span>{{ $n(dinero, 'currency') }}</span>
</template>
