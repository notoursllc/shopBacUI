import { BreadvanApi } from '@notoursllc/breadvan-api';

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

    api.getErrorMessage = (err) => {
        let message = err.message;

        if(err.response && err.response.data && err.response.data.message) {
            message = err.response.data.message;
        }

        return message;
    };

    inject('api', { ...api });

};
