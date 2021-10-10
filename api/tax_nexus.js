import queryString from 'query-string';

export default ($http) => ({

    list(params) {
        const paramString = queryString.stringify(params, {arrayFormat: 'bracket'});
        return $http.$get(`/nexus/list?${paramString}`); // TODO: is there a XSS issue here?
    },


    async get(id) {
        const response = await $http.$get('/nexus', {
            params: {
                id
            }
        });

        return response.data;
    },


    async upsert(data) {
        const response = await $http[data.hasOwnProperty('id') ? '$put' : '$post']('/nexus', data);
        return response.data;
    },


    async delete(id) {
        const response = await $http.$delete('/nexus', {
            params: {
                id
            }
        });

        return response.data;
    }

});
