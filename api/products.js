import queryString from 'query-string';
import isObject from 'lodash.isobject';
import cloneDeep from 'lodash.clonedeep';


function stripRelations(data) {
    delete data.created_at;
    delete data.updated_at;
    delete data.deleted_at;
    delete data.total_inventory_count;

    if(Array.isArray(data.variants)) {
        data.variants.forEach((variant) => {
            delete variant.display_price;
            delete variant.is_displayable;
            delete variant.total_inventory_count;

            if(Array.isArray(variant.images)) {
                variant.images.forEach((img) => {
                    delete img.loading;
                    delete img.media;
                });
            }

            if(Array.isArray(variant.skus)) {
                variant.skus.forEach((sku) => {
                    delete sku.final_price;
                    delete sku.display_price;
                });
            }

        });
    }
}


export default ($http) => ({

    // Example params object:
    // See BaseController.queryHelper() for all attributes
    // ============================
    // {
    // where: ['is_available', '=', true],
    // whereRaw: ['sub_type & ? > 0', [productTypeId]],
    // andWhere: [
    //     ['total_inventory_count', '>', 0]
    // ],
    // }
    async list(params) {
        const paramString = queryString.stringify(params, {arrayFormat: 'bracket'});
        const { data } = await $http.$get(`/products?${paramString}`); // TODO: is there a XSS issue here?
        return data;
    },


    async getBySeoUri(str) {
        const { data } = await $http.$get('/product/seo', {
            params: {
                id: str
            }
        });

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

        const { data } = await $http.$get('/product', {
            params
        });

        return data;
    },


    async upsert(data) {
        const prod = cloneDeep(data);
        stripRelations(prod);

        const response = await $http[prod.id ? '$put' : '$post']('/product', prod);
        return response.data;
    },


    async delete(id) {
        const { data } = await $http.$delete('/product', {
            params: {
                id
            }
        });
        return data;
    },


    /***********
     * Variants
     ***********/
    variants: {

        async delete(id) {
            const { data } = await $http.$delete('/product/variant', {
                params: {
                    id
                }
            });
            return data;
        },

        async deleteImage(id, media_id) {
            const { data } = await $http.$delete('/product/variant/image', {
                params: {
                    id,
                    media_id
                }
            });
            return data;
        }

    }

});
