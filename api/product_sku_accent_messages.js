import queryString from 'query-string';

function formatParams(params) {
    return queryString.stringify(params, {arrayFormat: 'bracket'});
}

export default ($http) => ({

    list(params) {
        return $http.$get(`/product/sku/accent_messages?${formatParams(params)}`); // TODO: is there a XSS issue here?
    },


    async get(id) {
        const { data } = await $http.$get('/product/sku/accent_message', {
            params: {
                id
            }
        });
        return data;
    },


    async all(params) {
        const { data } = await $http.$get(`/product/sku/accent_messages/all?${formatParams(params)}`);
        return data;
    },


    async upsert(props) {
        const { data } = await $http[props.id ? '$put' : '$post']('/product/sku/accent_message', props);
        return data;
    },


    async delete(id) {
        const { data } = await $http.$delete('/product/sku/accent_message', {
            params: {
                id
            }
        });
        return data;
    }

});
