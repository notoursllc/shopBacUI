import queryString from 'query-string';

export default ($http) => ({

    async all(params) {
        const paramString = queryString.stringify(params, {arrayFormat: 'bracket'});
        const { data } = await $http.$get(`/package_types/all?${paramString}`); // TODO: is there a XSS issue here?
        return data;
    },


    async list(params) {
        const paramString = queryString.stringify(params, {arrayFormat: 'bracket'});
        const { data } = await $http.$get(`/package_types?${paramString}`); // TODO: is there a XSS issue here?
        return data;
    },


    async get(id) {
        const response = await $http.$get('/package_type', {
            params: {
                id
            }
        });

        return response.data;
    },


    async upsert(data) {
        const response = await $http[data.hasOwnProperty('id') ? '$put' : '$post']('/package_type', data);
        return response.data;
    },


    async ordinals(data) {
        const response = await $http.$put('/package_types/ordinal', data);
        return response.data;
    },


    async delete(id) {
        const response = await $http.$delete('/package_type', {
            params: {
                id
            }
        });

        return response.data;
    }

});
