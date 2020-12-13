<script>
export default {
    components: {
        MasterTypesManager: () => import('@/components/MasterTypesManager')
    },

    created() {
        this.$store.dispatch('ui/title', this.$t('Product vendors'));
    }
};
</script>


<template>
    <master-types-manager object="product_vendor_type" />
</template>
