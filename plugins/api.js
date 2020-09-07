import Cart from '@/api/cart';
import MasterTypes from '@/api/master_types';
import Media from '@/api/media';
import Payments from '@/api/payments';
import Products from '@/api/products';
import ProductCollections from '@/api/product_collections';
import ProductSkus from '@/api/product_skus';
import ProductSkuVariantTypes from '@/api/product_sku_variant_types';
import ProductDataTables from '@/api/product_data_tables';
import Shipping from '@/api/shipping';
import Storage from '@/api/storage';
import TenantMembers from '@/api/tenant_members';


export default (context, inject) => {

    // Initialize API repositories
    const repositories = {
        cart: Cart(context.$axios),
        masterTypes: MasterTypes(context.$axios),
        media: Media(context.$axios),
        payments: Payments(context.$axios),
        products: Products(context.$axios),
        productCollections: ProductCollections(context.$axios),
        productSkus: ProductSkus(context.$axios),
        productSkuVariantTypes: ProductSkuVariantTypes(context.$axios),
        productDataTables: ProductDataTables(context.$axios),
        shipping: Shipping(context.$axios),
        storage: Storage(context.$axios),
        // tenantMembers: TenantMembers(context.$http)
        tenantMembers: TenantMembers(context.$axios)
    };

    inject('api', repositories);

};
