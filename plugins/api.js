import isObject from 'lodash.isobject';
import cloneDeep from 'lodash.clonedeep';

export default (context, inject) => {

    const $axios = context.$axios;

    $axios.onError(async (error) => {
        const errorCode = parseInt(error.response && error.response.status);

        switch(errorCode) {
            case 401: // Unauthorized
                await context.store.dispatch('ui/logout');

                // https://nuxtjs.org/docs/internals-glossary/context/#redirect
                context.redirect({
                    name: 'tenantmember-login'
                });
                return;
        }
    });


    const api = {};

    // GET
    api.get = (url, params) => {
        let config = null;

        if(params) {
            config = { params }
        }

        return $axios.get(url, config);
    };

    api.$get = async (url, params) => {
        const response = await api.get(url, params);
        return response?.data;
    };


    // POST
    api.post = (url, params) => {
        return $axios.post(url, params);
    };

    api.$post = async (url, params) => {
        const response = await api.post(url, params);
        return response?.data;
    };


    // PUT
    api.put = (url, params) => {
        return $axios.put(url, params);
    };

    api.$put = async (url, params) => {
        const response = await api.put(url, params);
        return response?.data;
    };


    // DELETE
    api.delete = (url, params) => {
        let config = null;

        if(params) {
            config = { params }
        }

        return $axios.delete(url, config);
    };

    api.$delete = async (url, params) => {
        const response = await api.delete(url, params);
        return response?.data;
    };


    // MISC
    api.getCancelToken = () => {
        const { CancelToken } = $axios;
        return CancelToken
    };

    api.getCancelTokenSource = () => {
        return $axios.CancelToken.source();
    };

    api.getErrorMessage = (err) => {
        let message = err.message;

        if(err?.response?.data?.message) {
            message = err.response.data.message;
        }

        return message;
    };


    api.account = {
        get(params) {
            return api.$get('/account', params)
        },

        update(data) {
            const fd = new FormData();

            for(let key in data) {
                let val = data[key];

                if(val && ['shipengine_carriers', 'supported_currencies'].includes(key)) {
                    val = JSON.stringify(val);
                }

                fd.append(key, val);
            }

            return api.$put('/account', fd)
        },

        deleteApiKey() {
            return api.$delete('/account/api_key')
        },

        updateApiKey() {
            // Some kind of payload needs to be sent
            // so the API request handler can access the request.payload
            // object.  Without this, is seems that only request.query is available
            // and an error occurrs.
            return api.$put('/account/api_key', {})
        }
    },


    api.cart = {
        closed(params) {
            return api.$get('/carts/closed', params)
        },

        currency(params) {
            return api.$post('/cart/currency', params)
        },

        get(params) {
            return api.$get('/cart', params)
        },

        update(data) {
            return api.$post('/cart/upsert', data)
        },

        item: {
            add(data) {
                return api.$post('/cart/item', data);
            },

            update(data) {
                return api.$put('/cart/item', data)
            },

            delete(params) {
                return api.$delete('/cart/item', params);
            }
        },

        order: {
            get(id) {
                return api.$get('/cart/order', { id })
            },

            resendConfirmationEmail(id) {
                return api.$post('/cart/order/resend-confirmation', { id });
            },

            notes: {
                update(id, notes) {
                    return api.$put('/cart/order/notes', {
                        id: id,
                        admin_order_notes: notes
                    })
                }
            }
        },

        payment: {
            get(cartId) {
                return api.$get('/cart/payment', {
                    id: cartId
                });
            },

            intent(cartId) {
                return api.$post('/cart/payment/intent', {
                    id: cartId
                });
            },

            success(cartId, paymentIntentId) {
                return api.$post('/cart/payment', {
                    id: cartId,
                    stripe_payment_intent_id: paymentIntentId
                });
            },

            paypal: {
                create(cartId) {
                    return api.$post('/cart/payment/paypal', {
                        id: cartId
                    });
                },

                execute(cartId, paymentToken) {
                    return api.$put('/cart/payment/paypal', {
                        id: cartId,
                        token: paymentToken
                    });
                }
            }
        },

        refund: {
            add(data) {
                return api.$post('/cart/refund', data);
            },

            list(params) {
                return api.$get('/cart/refunds', params)
            },

            summary(params) {
                return api.$get('/cart/refunds/summary', params)
            }
        },

        shipping: {
            setAddress(data) {
                return api.$post('/cart/shippingaddress', data);
            },

            validateAddress(data) {
                return api.$post('/cart/shippingaddress/validate', data);
            },

            getEstimates(cartId) {
                return api.$post('/cart/shipping/estimate', {
                    id: cartId
                });
            },

            purchaseLabel(id) {
                return api.$post('/cart/shipping/label', { id });
            },

            selectRate(cartId, rateId) {
                return api.$post('/cart/shipping/rate', {
                    id: cartId,
                    rate_id: rateId || null
                });
            },

            isShipped(cartId, isShipped) {
                return api.$post('/cart/shipped', {
                    id: cartId,
                    shipped: !!isShipped
                });
            }
        }
    };

    api.exchangeRate = {
        get(params) {
            return api.$get('/exchange-rate', params);
        }
    }

    api.hero = {
        delete(id) {
            return api.$delete('/hero', { id });
        },

        get(id) {
            return api.$get('/hero', { id });
        },

        list(params) {
            return api.$get('/heros', params);
        },

        ordinals(data) {
            return api.$put('/heros/ordinal', data);
        },

        upsert(data) {
            const fd = new FormData();
            fd.append('title', data.title);
            fd.append('published', data.published === false ? false : true);
            fd.append('ordinal', parseInt(data.ordinal || 0, 10));

            if(data.id) {
                fd.append('id', data.id);
            }
            if(data.file) {
                fd.append('file', data.file);
            }
            if(data.caption) {
                fd.append('caption', data.caption);
            }
            if(data.alt_text) {
                fd.append('alt_text', data.alt_text);
            }
            if(data.metadata) {
                fd.append('metadata', JSON.stringify(data.metadata));
            }

            return api[data.hasOwnProperty('id') ? '$put' : '$post']('/hero', fd);
        },

        addImage(File) {
            const formData = new FormData();
            formData.append('file', File);

            return api.$post('/hero/image', formData);
        }
    },

    api.masterType = {
        delete(id) {
            return api.$delete('/master_type', { id });
        },

        get(id) {
            return api.$get('/master_type', { id });
        },

        list(params) {
            return api.$get('/master_types', params);
        },

        all(params) {
            return api.$get('/master_types/all', params);
        },

        ordinals(data) {
            return api.$put('/master_types/ordinal', data);
        },

        upsert(data) {
            return api[data.hasOwnProperty('id') ? '$put' : '$post']('/master_type', data);
        },

        getNextAvailableTypeValue(allTypes) {
            let highestValue = 0;

            // find the highest value
            allTypes.forEach((obj) => {
                if(obj.value > highestValue) {
                    highestValue = obj.value;
                }
            });

            let factor = 0;

            if(highestValue) {
                factor = parseInt(Math.log(highestValue) / Math.log(2), 10); // current factor
                factor++; // what the new factor should be
            }

            return Math.pow(2, factor);
        }
    };


    api.media = {
        addImage(File) {
            const formData = new FormData();
            formData.append('file', File);

            return api.$post('/media/image', formData);
        },

        video: {
            add(File) {
                const formData = new FormData();
                formData.append('file', File);

                return api.$post('/media/video', formData);
            },

            del(id) {
                return api.$delete('/media/video', { id });
            }
        }
    };


    api.packageType = {
        stripRelations(data) {
            delete data.volume_cm;
            delete data.created_at;
            delete data.updated_at;
        },

        delete(id) {
            return api.$delete('/package_type', { id });
        },

        get(id) {
            return api.$get('/package_type', { id });
        },

        list(params) {
            return api.$get('/package_types', params);
        },

        ordinals(data) {
            return api.$put('/package_types/ordinal', data);
        },

        upsert(data) {
            const type = cloneDeep(data);
            api.packageType.stripRelations(type);

            return api[data.hasOwnProperty('id') ? '$put' : '$post']('/package_type', type);
        }
    };


    api.product = {
        stripRelations(data) {
            delete data.created_at;
            delete data.updated_at;
            delete data.deleted_at;
            delete data.total_inventory_count;
            delete data.packing_volume_cm;
            delete data.artist;

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
        },

        delete(id) {
            return api.$delete('/product', { id });
        },

        list(params) {
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
            return api.$get('/products', params);
        },

        get(id, options) {
            return api.$get('/product', {
                id,
                ...(isObject(options) ? options : {})
            });
        },


        upsert(data) {
            const prod = cloneDeep(data);
            api.product.stripRelations(prod);

            // const formData = new FormData();
            // for(let prop in prod) {
            //     if(Array.isArray(prod[prop])) {
            //         formData.set(prop, JSON.stringify(prod[prop]))
            //     }
            //     else {
            //         formData.set(
            //             prop,
            //             [null, undefined].includes(prod[prop]) ? null : prod[prop]
            //         );
            //     }
            // }

            // if(prod.video) {
            //     const formData = new FormData();
            //     formData.set('video', prod.video)
            //     prod.video = formData;
            // }

            // delete prod.video;


            // console.log("FORM DATA", formData.entries())
            return api[prod.id ? '$put' : '$post']('/product', prod);
        },

        getStipeTaxCodes(params) {
            return api.$get('/product/tax_codes', params);
        },

        accentMessage: {
            get(id) {
                return api.$get('/product/accent_message', { id });
            },

            delete(id) {
                return api.$delete('/product/accent_message', { id });
            },

            list(params) {
                return api.$get('/product/accent_messages', params);
            },

            upsert(props) {
                return api[props.id ? '$put' : '$post']('/product/accent_message', props);
            }
        },

        collection: {
            stripRelations(data) {
                delete data.created_at;
                delete data.updated_at;
                delete data.deleted_at;
            },

            get(id) {
                return api.$get('/product/collection', { id });
            },

            delete(id) {
                return api.$delete('/product/collection', { id });
            },

            list(params) {
                return api.$get('/product/collections', params);
            },

            upsert(data) {
                const prod = cloneDeep(data);
                api.product.collections.stripRelations(prod);

                return api[prod.id ? '$put' : '$post']('/product/collection', prod);
            }
        },

        colorSwatch: {
            delete(id) {
                return api.$delete('/product/color_swatch', { id });
            },

            get(id) {
                return api.$get('/product/color_swatch', { id });
            },

            list(params) {
                return api.$get('/product/color_swatches', params);
            },

            upsert(data) {
                return api[data.hasOwnProperty('id') ? '$put' : '$post']('/product/color_swatches', data);
            }
        },

        dataTable: {
            delete(id) {
                return api.$delete('/product/data_table', { id });
            },

            get(id) {
                return api.$get('/product/data_table', { id });
            },

            list(params) {
                return api.$get('/product/data_tables', params);
            },

            upsert(data) {
                return api[data.hasOwnProperty('id') ? '$put' : '$post']('/product/data_table', data);
            }
        },

        variant: {
            delete(id) {
                return api.$delete('/product/variant', { id });
            },

            deleteImage(id, media_id) {
                return api.$delete('/product/variant/image', {
                    id,
                    media_id
                });
            },

            get(id, options) {
                return api.$get('/product/variant', {
                    id,
                    ...(isObject(options) ? options : {})
                });
            },

            sku: {
                get(id) {
                    return api.$get('/product/variant/sku', { id });
                },

                delete(id) {
                    return api.$delete('/product/variant/sku', { id });
                }
            }
        }
    };


    api.product_artists = {
        delete(id) {
            return api.$delete('/product/artist', { id });
        },

        list(params) {
            return api.$get('/product/artists', params);
        },

        get(id) {
            return api.$get('/product/artist', { id });
        },

        upsert(data) {
            const fd = new FormData();
            const blacklist = ['created_at', 'updated_at', 'deleted_at', 'image'];

            for(const key in data) {
                if (!blacklist.includes(key)) {
                    if(key === 'file') {
                        if(data.file) {
                            fd.append('file', data.file);
                        }
                    }
                    else {
                        fd.append(key, data[key]);
                    }
                }
            }

            return api[data.hasOwnProperty('id') ? '$put' : '$post']('/product/artist', fd);
        }
    };


    api.nexus = {
        delete(id) {
            return api.$delete('/nexus', { id });
        },

        list(params) {
            return api.$get('/nexus/list', params);
        },

        get(id) {
            return api.$get('/nexus', { id });
        },

        upsert(data) {
            return api[data.hasOwnProperty('id') ? '$put' : '$post']('/nexus', data);
        }
    };


    api.tenant = {
        contactUs(params) {
            return api.$post('/tenant/contactus', params);
        },

        member: {
            add(data) {
                return api.$post('/tenant/member', data);
            },

            login(data) {
                return api.$post('/tenant/member/login', data);
            },

            logout() {
                return api.$post('/tenant/member/logout');
            }
        }
    };


    api.appConfig = () => {
        return api.$get('/app_config')
    };


    inject('api', { ...api });

};
