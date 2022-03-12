<script>
import product_mixin from '@/mixins/product_mixin';
import BooleanTag from '@/components/BooleanTag';
import ProductArtistUpsertForm from '@/components/product/artist/ProductArtistUpsertForm.vue';

import {
    FigButtonFab,
    FigTableSimple,
    FigTh,
    FigTr,
    FigTd,
    FigTrNoResults,
    FigOperationsDropdown,
    FigOverlay,
    FigPaginationWrapper,
    FigNuxtImgBunny,
    FigModal
} from '@notoursllc/figleaf';

export default {
    components: {
        BooleanTag,
        ProductArtistUpsertForm,
        FigButtonFab,
        FigTableSimple,
        FigTh,
        FigTr,
        FigTd,
        FigTrNoResults,
        FigOperationsDropdown,
        FigOverlay,
        FigPaginationWrapper,
        FigNuxtImgBunny,
        FigModal
    },

    mixins: [
        product_mixin
    ],

    data() {
        return {
            loading: false,
            artists: [],
            masterTypes: {},
            pagination: {
                _page: 1,
                _pageSize: 100
            },
            table: {
                _sort: 'updated_at:asc'
            },
            totalResults: 0,
            form: {
                id: null
            }
        };
    },

    created() {
        this.$store.dispatch('ui/title', this.$t('Product artists'));
        this.fetchData();
    },

    methods: {
        async fetchData() {
            try {
                this.loading = true;

                const { data, pagination } = await this.$api.product_artists.list({
                    ...this.pagination,
                    ...this.table
                });

                this.artists = data;
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

        sortChanged(val) {
            this.table._sort = val;
            this.fetchData();
        },

        onPaginationChange(data) {
            this.pagination = { ...data };
            this.fetchData();
        },

        async onDelete(obj) {
            const confirmed = await this.$showConfirm(
                this.$t('delete_name?', {name: obj.name}),
                'warning'
            );

            if(!confirmed) {
                return;
            }

            try {
                await this.$api.product_artists.delete(obj.id);

                this.$figleaf.successToast({
                    title: this.$t('Success'),
                    text: `"${obj.name}" deleted`
                });

                this.fetchData();
            }
            catch(e) {
                this.$figleaf.errorToast({
                    title: this.$t('Error'),
                    text: e.message
                });
            }
        },

        showModal(show) {
            show === false
                ? this.$refs.upsert_modal.hide()
                : this.$refs.upsert_modal.show();
        },

        onUpsert(id) {
            this.form.id = id;
            this.showModal();
        },

        onFormSaved() {
            this.fetchData();
            this.showModal(false);
        }
    }
};
</script>


<template>
    <div>
        <fig-button-fab icon="plus" @click="onUpsert()" />

        <fig-overlay :show="loading">
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
                            <fig-th sortable prop="name" colspan="2">{{ $t('Name') }}</fig-th>
                            <fig-th sortable prop="published">{{ $t('Published') }}</fig-th>
                            <fig-th sortable prop="website">{{ $t('Website') }}</fig-th>
                            <fig-th sortable prop="city">{{ $t('City') }}</fig-th>
                            <fig-th sortable prop="state">{{ $t('State/Province/Region') }}</fig-th>
                            <fig-th sortable prop="countryCodeAlpha2">{{ $t('Country') }}</fig-th>
                            <fig-th sortable prop="countryCodeAlpha2" class="text-center">{{ $t('Actions') }}</fig-th>
                        </fig-tr>
                    </template>

                    <fig-tr v-for="(obj, idx) in artists" :key="idx">
                        <!-- image -->
                        <fig-td>
                            <fig-nuxt-img-bunny
                                v-if="obj.image"
                                :src="obj.image"
                                preset="w150"
                                loading="lazy"
                                class="shadow" />
                        </fig-td>

                        <!-- title -->
                        <fig-td>
                            {{ obj.name }}
                        </fig-td>

                        <!-- published -->
                        <fig-td>
                            <boolean-tag :value="obj.published" />
                        </fig-td>

                        <!-- website -->
                        <fig-td>
                            <a :href="obj.website" target="_blank">{{ obj.website }}</a>
                        </fig-td>

                        <!-- city -->
                        <fig-td>
                            {{ obj.city }}
                        </fig-td>

                        <!-- state -->
                        <fig-td>
                            {{ obj.state }}
                        </fig-td>

                        <!-- country -->
                        <fig-td>
                            {{ obj.countryCodeAlpha2 }}
                        </fig-td>

                        <!-- actions -->
                        <fig-td class="text-center">
                            <fig-operations-dropdown
                                :show-view="false"
                                @edit="onUpsert(obj.id)"
                                @delete="onDelete(obj)"
                                class="ml-1" />
                        </fig-td>
                    </fig-tr>

                    <fig-tr-no-results v-if="!artists.length" :colspan="8" />
                </fig-table-simple>
            </fig-pagination-wrapper>
        </fig-overlay>

        <!-- add/upsert modal -->
        <fig-modal
            ref="upsert_modal"
            size="md">

            <template v-slot:header>
                {{ form.id ? $t('Edit artist') : $t('Add artist') }}
            </template>

            <product-artist-upsert-form
                :id="form.id"
                @saved="onFormSaved" />
        </fig-modal>
    </div>
</template>
