import queryString from 'query-string';
import isObject from 'lodash.isobject';

export default ($http) => ({

    async list(params) {
        const paramString = queryString.stringify(params, { arrayFormat: 'bracket' });
        // const paramString = queryString.stringify(params);
        const { data } = await $http.$get(`/carts?${paramString}`); // TODO: is there a XSS issue here?
        return data;
    },

    async get(id, options) {
        let params = {};

        if(isObject(options)) {
            params = {
                ...options
            };
        }

        params.id = id;

        const { data } = await $http.$get('/cart', {
            params
        });

        return data;
    }

});
