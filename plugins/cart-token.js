import * as Cookies from 'js-cookie';

export default ({ $http, store, $config }) => {
    // TODO: store.state.shoppingcart.token is not set on www.gobreadvan.com
    if(store.state.shoppingcart.token) {
        Cookies.set(
            'cart-jwt',
            store.state.shoppingcart.token,
            {
                secure: $config.COOKIE_SECURE || false
            }
        );
    }
};
