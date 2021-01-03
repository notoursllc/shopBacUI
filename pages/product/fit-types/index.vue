<script>
export default {
    components: {
        MasterTypesManager: () => import('@/components/MasterTypesManager')
    },

    created() {
        this.$store.dispatch('ui/title', this.$t('Fits'));
    }
};
</script>


<template>
    <master-types-manager object="product_fit_type" />
</template>
