export default ($http) => ({

    async delete(id) {
        const { data } = await $http.$delete('/product/sku', {
            params: {
                id
            }
        });
        return data;
    },


    async deleteImage(id) {
        const { data } = await $http.$delete('/product/sku/image', {
            params: {
                id
            }
        });
        return data;
    }
});
