<script>
import {
    FigTableSimple,
    FigTh,
    FigTd,
    FigTrNoResults
} from '@notoursllc/figleaf';


export default {
    components: {
        FigTableSimple,
        FigTh,
        FigTd,
        FigTrNoResults
    },

    data() {
        return {
            products: []
        };
    },

/*
    async asyncData({ params, store, app }) {
        const payments = await app.$api.payments.list.call(app, {
            // where: ['is_available', '=', true],
            // andWhere: [
            //     ['total_inventory_count', '>', 0]
            // ],
            orderBy: 'updated_at',
            orderDir: 'DESC'
        });

        return {
            payments
        };
    },
*/

    methods: {
        async fetchOrders(paramsObj) {
            this.payments = await this.$api.payments.list(paramsObj);
        },

        sortChanged(val) {
            this.fetchOrders({
                sortBy: val.by,
                sortDesc: !val.isAsc
            });
        }
    }
};
</script>


<template>
    <fig-table-simple
        striped
        hover
        @sort="sortChanged">
        <template slot="head">
            <tr>
                <fig-th sortable prop="updated_at">{{ $t('Updated') }}</fig-th>
                <fig-th>{{ $t('Status') }}</fig-th>
                <fig-th>{{ $t('Shipping total') }}</fig-th>
                <fig-th>{{ $t('Grand total') }}</fig-th>
            </tr>
        </template>

        <tr v-for="(obj, idx) in payments" :key="idx">
            <fig-td>
                <nuxt-link
                    :to="{ name: 'order-id', params: { id: obj.id } }"
                    tag="a">{{ obj.updated_at | format8601 }}</nuxt-link>
            </fig-td>

            <!-- success -->
            <fig-td>
                <div v-for="item in obj.transaction.tenders" :key="item.id">
                    {{ item.card_details.status }}
                </div>
            </fig-td>

            <!-- shipping total -->
            <fig-td>
                {{ obj.shoppingCart.shipping_total }}
            </fig-td>

            <!-- grand total -->
            <fig-td>
                {{ obj.shoppingCart.grand_total }}
            </fig-td>
        </tr>

        <fig-tr-no-results v-if="!products.length" :colspan="4" />
    </fig-table-simple>
</template>

