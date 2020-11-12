export default {

    methods: {
        getInheritTooltip(useColorVal) {
            return useColorVal ? this.$t('This value is being inherited from the Color') : this.$t('Check to inherit value from the Color');
        }
    }

};
