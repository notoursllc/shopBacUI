<script>
export default {
    created() {
        this.$store.dispatch('ui/title', this.$t('Reports'));
    }
};
</script>


<template>
    <div>
        <!-- Orders -->
        <nuxt-link
            :to="{ name: 'reports-orders-list' }"
            tag="a"
            class="text-lg">{{ $t('Orders') }}</nuxt-link>

    </div>
</template>
