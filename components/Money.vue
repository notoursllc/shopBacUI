<script>
import Vue from 'vue';

export default Vue.extend({
    name: 'Money',

    props: ['cents'],

    computed: {
        dinero: function() {
            return this.cents ? parseInt(this.cents, 10)/100 : 0;
        }
    }
});
</script>

<template>
    <span>{{ $n(dinero, 'currency') }}</span>
</template>
