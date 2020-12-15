import queryString from 'query-string';

function formatParams(params) {
    return queryString.stringify(params, {arrayFormat: 'bracket'});
}

export default ($http) => ({

    list(params) {
        return $http.$get(`/product/color_swatches?${formatParams(params)}`); // TODO: is there a XSS issue here?
    },


    async get(id) {
        const { data } = await $http.$get('/product/color_swatch', {
            params: {
                id
            }
        });
        return data;
    },


    async all(params) {
        const { data } = await $http.$get(`/product/color_swatches/all?${formatParams(params)}`);
        return data;
    },


    async upsert(props) {
        const { data } = await $http[props.id ? '$put' : '$post']('/product/color_swatches', props);
        return data;
    },


    async delete(id) {
        const { data } = await $http.$delete('/product/color_swatch', {
            params: {
                id
            }
        });
        return data;
    }

});
