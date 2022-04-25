export default async (ctx) => {
    if(!ctx.store.state.ui.isAuthenticated) {
        return;
    }

    const results = await Promise.all([
        ctx.app.$api.masterType.all({
            _sort: 'ordinal:asc'
        }),

        ctx.app.$api.product.getStipeTaxCodes()
    ]);

    for(const type in results[0].data) {
        ctx.store.dispatch('MASTER_TYPES', { object: type, value: results[0].data[type]});
    }

    ctx.store.dispatch('TAX_CODES', results[1].data);
};
