<script>
export default {
    components: {
        MasterTypesManager: () => import('@/components/MasterTypesManager')
    },

    created() {
        this.$store.dispatch('ui/title', this.$t('Sleeve length types'));
    }
};
</script>


<template>
    <master-types-manager object="product_sleeve_length_type" />
</template>
