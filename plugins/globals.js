export default async (ctx) => {
    if(!ctx.store.state.ui.isAuthenticated) {
        return;
    }

    const { data } = await ctx.app.$api.masterType.all({
        _sort: 'ordinal:asc'
    });

    for(const type in data) {
        ctx.store.dispatch('MASTER_TYPES', { object: type, value: data[type]});
    }
};
