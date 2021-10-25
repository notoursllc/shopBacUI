import { BreadvanApi } from '@notoursllc/figleaf';

export default (context, inject) => {

    context.$axios.onError((error) => {
        const errorCode = parseInt(error.response && error.response.status);

        switch(errorCode) {
            case 401:
                window.location = '/tenantmember/login';
                break;
        }
    });


    const api = BreadvanApi(context.$axios);
    inject('api', { ...api });

};
