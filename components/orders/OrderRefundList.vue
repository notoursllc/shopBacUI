<script>
import {
    FigTableSimple,
    FigTr,
    FigTh,
    FigTd,
    FigTrNoResults,
    FigPaginationWrapper,
    FigMoney
} from '@notoursllc/figleaf';

export default {
    components: {
        FigTableSimple,
        FigTr,
        FigTh,
        FigTd,
        FigTrNoResults,
        FigPaginationWrapper,
        FigMoney
    },

    props: {
        cartId: {
            type: String,
            default: null
        }
    },

    data() {
        return {
            refunds: [],
            loading: false,
            pagination: {
                _page: 1,
                _pageSize: 100
            },
            table: {
                _sort: 'created_at:asc'
            },
            totalResults: 0
        };
    },

    watch: {
        cartId: {
            handler() {
                this.fetchData();
            },
            immediate: true
        }
    },

    methods: {
        async fetchData(paramsObj) {
            try {
                this.loading = true;

                const { data, pagination } = await this.$api.cart.refund.list({
                    cart_id: this.cartId,
                    ...this.pagination,
                    ...this.table
                });

                this.refunds = data;
                this.totalResults = pagination.rowCount;
            }
            catch(e) {
                this.$figleaf.errorToast({
                    title: this.$t('Error'),
                    text: e.message
                });
            }

            this.loading = false;
        },

        onPaginationChange(data) {
            this.pagination = { ...data };
            this.fetchData();
        },

        sortChanged(val) {
            this.table._sort = val;
            this.fetchData();
        }
    }
};
</script>


<template>
    <fig-pagination-wrapper
        bottom
        :total-records="totalResults"
        @perPage="onPaginationChange"
        @pageNumber="onPaginationChange">

        <fig-table-simple
            striped
            hover
            @sort="sortChanged">
            <template slot="head">
                <fig-tr>
                    <fig-th sortable prop="created_at">{{ $t('Created') }}</fig-th>
                    <fig-th sortable prop="amount" right>{{ $t('Amount') }}</fig-th>
                    <fig-th sortable prop="reason">{{ $t('Reason') }}</fig-th>
                    <fig-th>{{ $t('Description') }}</fig-th>
                    <fig-th sortable prop="stripe_refund_id">{{ $t('Stripe Refund ID') }}</fig-th>
                    <fig-th sortable prop="paypal_refund_id">{{ $t('Paypal Refund ID') }}</fig-th>
                </fig-tr>
            </template>

            <fig-tr v-for="(refund, idx) in refunds" :key="idx">
                <!-- Created -->
                <fig-td>
                    {{ refund.created_at | format8601 }}
                </fig-td>

                <!-- amount -->
                <fig-td class="text-right">
                    <fig-money :cents="refund.amount" />
                </fig-td>

                <!-- reason -->
                <fig-td>
                    {{ refund.reason }}
                </fig-td>

                <!-- description-->
                <fig-td>
                    {{ refund.description }}
                </fig-td>

                <!-- stripe refund id -->
                <fig-td>
                    {{ refund.stripe_refund_id }}
                </fig-td>

                <!-- paypal refund id -->
                <fig-td>
                    {{ refund.paypal_refund_id }}
                </fig-td>
            </fig-tr>

            <fig-tr-no-results v-if="!refunds.length" :colspan="6" />
        </fig-table-simple>

    </fig-pagination-wrapper>
</template>