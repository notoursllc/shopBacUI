<script>
export default {
    components: {
        MasterTypesManager: () => import('@/components/MasterTypesManager')
    },

    created() {
        this.$store.dispatch('ui/title', this.$t('Genders'));
    }
};
</script>


<template>
    <master-types-manager object="product_gender_type" />
</template>
