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
    },


    async order(id) {
        const { data } = await $http.$get('/cart/order', {
            params: {
                id: id
            }
        });

        return data;
    },


    async purchaseShippingLabel(cartId) {
        const { data } = await $http.$post('/cart/shipping/label', {
            id: cartId
        });

        return data;
    },


    async shipped(cartId, isShipped) {
        const { data } = await $http.$post('/cart/shipped', {
            id: cartId,
            shipped: !!isShipped
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
