export default async (ctx) => {
    if(!ctx.store.state.ui.isAuthenticated) {
        return;
    }

    const promises = [
        ctx.app.$api.masterType.all({
            where: ['object', '=', 'product_type']
        }),
        ctx.app.$api.masterType.all({
            where: ['object', '=', 'product_sub_type']
        }),
        ctx.app.$api.masterType.all({
            where: ['object', '=', 'product_gender_type']
        }),
        ctx.app.$api.masterType.all({
            where: ['object', '=', 'product_basic_color_type']
        }),
        ctx.app.$api.masterType.all({
            where: ['object', '=', 'product_size_type']
        }),
        ctx.app.$api.masterType.all({
            where: ['object', '=', 'product_fit_type']
        }),
        ctx.app.$api.masterType.all({
            where: ['object', '=', 'product_sleeve_length_type']
        })
    ];

    const [
        types,
        subTypes,
        genderTypes,
        basicColorTypes,
        sizeTypes,
        fitTypes,
        sleeveLengthTypes
    ] = await Promise.all(promises);

    ctx.store.dispatch('MASTER_TYPES', { object: 'product_type', value: types?.data});
    ctx.store.dispatch('MASTER_TYPES', { object: 'product_sub_type', value: subTypes?.data});
    ctx.store.dispatch('MASTER_TYPES', { object: 'product_gender_type', value: genderTypes?.data});
    ctx.store.dispatch('MASTER_TYPES', { object: 'product_basic_color_type', value: basicColorTypes?.data});
    ctx.store.dispatch('MASTER_TYPES', { object: 'product_size_type', value: sizeTypes?.data});
    ctx.store.dispatch('MASTER_TYPES', { object: 'product_fit_type', value: fitTypes?.data});
    ctx.store.dispatch('MASTER_TYPES', { object: 'product_sleeve_length_type', value: sleeveLengthTypes?.data});
};
