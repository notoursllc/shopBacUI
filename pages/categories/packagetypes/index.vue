<script>
import shipping_mixin from '@/mixins/shipping_mixin';
import OperationsDropdown from '@/components/OperationsDropdown';

import {
    FigButtonFab,
    FigTableSimple,
    FigTh,
    FigTd
} from '@notoursllc/figleaf';

export default {
    components: {
        OperationsDropdown,
        // ShippingPackageTypeUpsertForm: () => import('@/components/shipping/ShippingPackageTypeUpsertForm')
        FigButtonFab,
        FigTableSimple,
        FigTh,
        FigTd
    },

    mixins: [
        shipping_mixin
    ],

    data() {
        return {
            dialog: {
                show: false,
                packageTypeId: null
            },
            shippingPackageTypes: []
        };
    },

    created() {
        this.fetchPackageTypes();
    },

    methods: {
        async fetchPackageTypes(paramsObj) {
            try {
                this.shippingPackageTypes = await this.$api.shipping.listPackageTypes(paramsObj);
            }
            catch(e) {
                this.$errorToast({
                    title: this.$t('Error'),
                    text: e.message
                });
            }
        },

        sortChanged(val) {
            this.fetchPackageTypes({
                sortBy: val.by,
                sortDesc: !val.isAsc
            });
        },

        async deleteType(data) {
            const confirmed = await this.$confirmModal(
                `Remove this package type? "${data.label}"`,
                'warning'
            );

            if(!confirmed) {
                return;
            }

            try {
                const packageTypeJson = await this.$api.shipping.deletePackageType(data.id);

                if(!packageTypeJson) {
                    throw new Error(this.$t('Package Type not found'));
                }

                this.fetchPackageTypes();

                this.$successToast({
                    title: this.$t('Success'),
                    text: `Package Type deleted: ${data.label}`
                });
            }
            catch(e) {
                this.$errorToast({
                    title: this.$t('Error'),
                    text: e.message
                });
            }
        },

        onUpsertClick(id) {
            this.dialog.packageTypeId = id || null;
            this.dialog.show = true;
        },

        onUpsertSuccess() {
            this.dialog.show = false;
            this.fetchPackageTypes();
        }
    }
};
</script>


<template>
    <div>
        <fig-button-fab icon="plus" @click="onUpsertClick()" />


        <fig-table-simple
            striped
            hover
            @sort="sortChanged">
            <template slot="head">
                <tr>
                    <fig-th sortable prop="label">{{ $t('Label') }}</fig-th>
                    <fig-th sortable prop="length">{{ $t('Length') }}</fig-th>
                    <fig-th sortable prop="width">{{ $t('Width') }}</fig-th>
                    <fig-th sortable prop="height">{{ $t('Height') }}</fig-th>
                    <fig-th sortable prop="distance_unit">{{ $t('Distance Unit') }}</fig-th>
                    <fig-th sortable prop="weight">{{ $t('Weight (oz)') }}</fig-th>
                </tr>
            </template>

            <tr v-for="(obj, idx) in shippingPackageTypes" :key="idx">
                <fig-td>
                    {{ obj.label }}
                    <operations-dropdown
                        :show-view="false"
                        @edit="onUpsertClick(obj.id)"
                        @delete="deleteType(obj)"
                        class="ml-1" />
                </fig-td>

                <!-- length -->
                <fig-td>
                    {{ obj.length }}
                </fig-td>

                <!-- width -->
                <fig-td>
                    {{ obj.width }}
                </fig-td>

                <!-- height -->
                <fig-td>
                    {{ obj.height }}
                </fig-td>

                <!-- distance_unit -->
                <fig-td>
                    {{ obj.distance_unit }}
                </fig-td>

                <!-- weight -->
                <fig-td>
                    {{ obj.weight }}
                </fig-td>
            </tr>
        </fig-table-simple>
    </div>
</template>
