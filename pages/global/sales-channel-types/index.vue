<script>
export default {
    components: {
        MasterTypesManager: () => import('@/components/MasterTypesManager')
    },

    created() {
        this.$store.dispatch('ui/title', this.$t('Product sales channels'));
    }
};
</script>


<template>
    <master-types-manager object="product_sales_channel_type" />
</template>
