import { BreadvanApi } from '@notoursllc/breadvan-api';

export default (context, inject) => {

    context.$axios.onError(async (error) => {
        const errorCode = parseInt(error.response && error.response.status);

        switch(errorCode) {
            case 401:
                await context.store.dispatch('ui/logout');

                // https://nuxtjs.org/docs/internals-glossary/context/#redirect
                context.redirect({
                    name: 'tenantmember-login'
                });
                break;
        }
    });


    const api = BreadvanApi(context.$axios);

    api.getErrorMessage = (err) => {
        let message = err.message;

        if(err?.response?.data?.message) {
            message = err.response.data.message;
        }

        return message;
    };

    inject('api', { ...api });

};
