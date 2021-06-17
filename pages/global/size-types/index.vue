<script>
export default {
    components: {
        MasterTypesManager: () => import('@/components/MasterTypesManager')
    },

    created() {
        this.$store.dispatch('ui/title', this.$t('Sizes'));
    }
};
</script>


<template>
    <master-types-manager object="product_size_type" />
</template>
