
<script>
export default {
    components: {
        MasterTypesManager: () => import('@/components/MasterTypesManager')
    },

    created() {
        this.$store.dispatch('ui/title', this.$t('Basic colors'));
    }
};
</script>


<template>
    <master-types-manager object="product_basic_color_type" />
</template>
