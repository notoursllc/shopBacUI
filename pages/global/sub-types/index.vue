<script>
export default {
    components: {
        MasterTypesManager: () => import('@/components/MasterTypesManager')
    },

    created() {
        this.$store.dispatch('ui/title', this.$t('Product sub-types'));
    }
};
</script>


<template>
    <master-types-manager object="product_sub_type" />
</template>
