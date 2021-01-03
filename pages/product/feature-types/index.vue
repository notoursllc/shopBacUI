
<script>
export default {
    components: {
        MasterTypesManager: () => import('@/components/MasterTypesManager')
    },

    created() {
        this.$store.dispatch('ui/title', this.$t('Product features'));
    }
};
</script>


<template>
    <master-types-manager object="product_feature_type" />
</template>
