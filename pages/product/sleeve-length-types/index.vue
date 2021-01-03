<script>
export default {
    components: {
        MasterTypesManager: () => import('@/components/MasterTypesManager')
    },

    created() {
        this.$store.dispatch('ui/title', this.$t('Sleeve lengths'));
    }
};
</script>


<template>
    <master-types-manager object="product_sleeve_length_type" />
</template>
