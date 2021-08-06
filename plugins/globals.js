export default async (ctx) => {
    const promises = [
        ctx.app.$api.masterTypes.all({
            where: ['object', '=', 'product_type']
        }),
        ctx.app.$api.masterTypes.all({
            where: ['object', '=', 'product_sub_type']
        }),
        ctx.app.$api.masterTypes.all({
            where: ['object', '=', 'product_gender_type']
        }),
        ctx.app.$api.masterTypes.all({
            where: ['object', '=', 'product_basic_color_type']
        }),
        ctx.app.$api.masterTypes.all({
            where: ['object', '=', 'product_size_type']
        }),
        ctx.app.$api.masterTypes.all({
            where: ['object', '=', 'product_fit_type']
        }),
        ctx.app.$api.masterTypes.all({
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

    ctx.store.dispatch('MASTER_TYPES', { object: 'product_type', value: types});
    ctx.store.dispatch('MASTER_TYPES', { object: 'product_sub_type', value: subTypes});
    ctx.store.dispatch('MASTER_TYPES', { object: 'product_gender_type', value: genderTypes});
    ctx.store.dispatch('MASTER_TYPES', { object: 'product_basic_color_type', value: basicColorTypes});
    ctx.store.dispatch('MASTER_TYPES', { object: 'product_size_type', value: sizeTypes});
    ctx.store.dispatch('MASTER_TYPES', { object: 'product_fit_type', value: fitTypes});
    ctx.store.dispatch('MASTER_TYPES', { object: 'product_sleeve_length_type', value: sleeveLengthTypes});
};
