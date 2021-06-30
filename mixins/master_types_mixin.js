import isObject from 'lodash.isobject';

export default {

    methods: {
        async mt_mix_getType(id) {
            const masterType = await this.$api.masterTypes.get(id);

            if(!masterType) {
                throw new Error(this.$t('Master Type not found'));
            }
        },

        mt_mix_getAllTypes(type) {
            return this.$api.masterTypes.all({
                where: ['object', '=', type]
            });
        },

        async mt_mix_getNextAvailableValue(type) {
            const masterTypes = await this.mt_mix_getAllTypes(type);
            return this.$api.masterTypes.getNextAvailableTypeValue(masterTypes);
        },

        mt_mix_fetchTypes(type, paramsObj) {
            return this.$api.masterTypes.list({
                where: ['object', '=', type],
                // whereRaw: ['sub_type & ? > 0', [productTypeId]],
                // andWhere: [
                //     ['total_inventory_count', '>', 0]
                // ],
                ...paramsObj
            });
        },

        async mt_mix_deleteType(data) {
            const confirmed = await this.$showConfirm(
                this.$t('delete_name?', {name: data.name}),
                'warning'
            );

            if(!confirmed) {
                return false;
            }

            const typeJson = await this.$api.masterTypes.delete(data.id);

            if(!typeJson) {
                throw new Error(this.$t('Master type not found'));
            }

            this.$figleaf.successToast({
                title: this.$t('Success'),
                text: this.$t('deleted_name', { name: data.name })
            });

            return true;
        },


        // async mt_mix_upsertType(data) {
        //     try {
        //         if(isObject(data) && data.id) {
        //             const masterType = await this.$api.masterTypes.get(data.id);

        //             if(!masterType) {
        //                 throw new Error(this.$t('Master Type not found'));
        //             }
        //         }
        //         else {
        //             const masterTypes = await this.$api.masterTypes.all({
        //                 where: ['object', '=', this.object]
        //             });
        //             this.form.published = true;
        //             this.form.value = this.$api.masterTypes.getNextAvailableTypeValue(masterTypes);
        //         }

        //         this.showDialog();
        //     }
        //     catch(e) {
        //         this.$figleaf.errorToast({
        //             title: this.$t('Error'),
        //             text: e.message
        //         });
        //     }
        // },

        async mt_mix_saveType(data) {
            try {
                const mt = await this.$api.masterTypes.upsert(data);

                if(!mt) {
                    throw new Error(this.$t('Error updating Master Type'));
                }

                this.$figleaf.successToast({
                    title: this.$t('Success'),
                    text: this.$t(data.id ? 'updated_name' : 'added_name', { name: mt.name })
                });
            }
            catch(e) {
                this.$figleaf.errorToast({
                    title: this.$t('Error'),
                    text: e.message
                });
            }
        }
    }
};



