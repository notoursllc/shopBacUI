import Cart from '@/api/cart';
import MasterTypes from '@/api/master_types';
import Media from '@/api/media';
import PackageTypes from '@/api/package_types';
import Payments from '@/api/payments';
import Products from '@/api/products';
import ProductCollections from '@/api/product_collections';
import ProductAccentMessages from '@/api/product_accent_messages';
import ProductColorSwatches from '@/api/product_color_swatches';
import ProductDataTables from '@/api/product_data_tables';
import Shipping from '@/api/shipping';
import Storage from '@/api/storage';
import TenantMembers from '@/api/tenant_members';


export default (context, inject) => {

    context.$axios.onError((error) => {
        const errorCode = parseInt(error.response && error.response.status);

        switch(errorCode) {
            case 401:
                window.location = '/tenantmember/login';
                break;
        }
    });


    // Initialize API repositories
    const repositories = {
        cart: Cart(context.$axios),
        masterTypes: MasterTypes(context.$axios),
        media: Media(context.$axios),
        packageTypes: PackageTypes(context.$axios),
        payments: Payments(context.$axios),
        products: Products(context.$axios),
        productCollections: ProductCollections(context.$axios),
        productAccentMessages: ProductAccentMessages(context.$axios),
        productColorSwatches: ProductColorSwatches(context.$axios),
        productDataTables: ProductDataTables(context.$axios),
        shipping: Shipping(context.$axios),
        storage: Storage(context.$axios),
        // tenantMembers: TenantMembers(context.$http)
        tenantMembers: TenantMembers(context.$axios)
    };

    inject('api', repositories);

};
