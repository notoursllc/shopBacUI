import queryString from 'query-string';
import isObject from 'lodash.isobject';

export default ($http) => ({

    list(params) {
        const paramString = queryString.stringify(params, { arrayFormat: 'bracket' });
        // const paramString = queryString.stringify(params);
        return $http.$get(`/carts?${paramString}`); // TODO: is there a XSS issue here?
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


    // async getShippingRate(rate_id) {
    //     const { data } = await $http.$get('/cart/shipping/rate', {
    //         params: {
    //             rate_id
    //         }
    //     });

    //     return data;
    // }

});
