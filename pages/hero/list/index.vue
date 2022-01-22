<script>
import draggable from 'vuedraggable';
import HeroUpsertForm from '@/components/hero/HeroUpsertForm.vue';
import BooleanTag from '@/components/BooleanTag';

import {
    FigButtonFab,
    FigTableSimple,
    FigTh,
    FigTd,
    FigTrNoResults,
    FigPaginationWrapper,
    FigOperationsDropdown,
    FigModal,
    FigNuxtImgBunny,
    FigIcon,
    FigOverlay
} from '@notoursllc/figleaf';


export default {
    components: {
        draggable,
        FigButtonFab,
        FigTableSimple,
        FigTh,
        FigTd,
        FigTrNoResults,
        FigPaginationWrapper,
        FigOperationsDropdown,
        FigModal,
        FigNuxtImgBunny,
        FigIcon,
        FigOverlay,
        HeroUpsertForm,
        BooleanTag
    },

    data() {
        return {
            heros: [],
            pagination: {
                _page: 1,
                _pageSize: 100
            },
            table: {
                _sort: 'ordinal:asc'
            },
            totalResults: 0,
            form: {
                heroId: null
            },
            updatingSortOrder: false,
            loading: false
        };
    },

    created() {
        this.$store.dispatch('ui/title', this.$t('Hero slides'));
        this.fetchData();
    },

    methods: {
        async fetchData() {
            try {
                const { data, pagination } = await this.$api.hero.list({
                    ...this.pagination,
                    ...this.table
                });

                this.heros = data;
                this.totalResults = pagination.rowCount;
            }
            catch(e) {
                this.$figleaf.errorToast({
                    title: this.$t('Error'),
                    text: e.message
                });
            }
        },

        async onDelete(hero) {
            const confirmed = await this.$showConfirm(
                this.$t('remove_label?', { label: hero.title }),
                'warning'
            );

            if(!confirmed) {
                return;
            }

            try {
                const response = await this.$api.hero.delete(hero.id);

                if(!response) {
                    throw new Error(this.$t('Item not found'));
                }

                this.init();

                this.$figleaf.successToast({
                    title: this.$t('Success'),
                    text: this.$t('item_deleted_label', { label: hero.title })
                });
            }
            catch(e) {
                this.$figleaf.errorToast({
                    title: this.$t('Error'),
                    text: e.message
                });
            }
        },

        onUpsert(id) {
            this.form.heroId = id;
            this.showModal();
        },

        showModal(show) {
            show === false ? this.$refs.hero_upsert_modal.hide() : this.$refs.hero_upsert_modal.show();
        },

        onPaginationChange(data) {
            this.pagination = { ...data };
            this.fetchData();
        },

        sortChanged(val) {
            this.table._sort = val;
            this.fetchData();
        },

        onNexusFormSaved() {
            this.fetchData();
            this.showModal(false);
        },

        async setOrdinals() {
            try {
                this.loading = true;

                this.heros.forEach((obj, index) => {
                    obj.ordinal = index;
                });

                await this.$api.hero.ordinals({
                    ordinals: this.heros.map(
                        (obj) => {
                            return { id: obj.id, ordinal: obj.ordinal };
                        }
                    )
                });

                this.$figleaf.successToast({
                    title: this.$t('Success'),
                    text: this.$t('Sort order updated')
                });
            }
            catch(e) {
                this.$figleaf.errorToast({
                    title: this.$t('Error'),
                    text: e.message
                });
            }

            this.loading = false;
        },

        init() {
            this.fetchData();
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
                        <tr>
                            <fig-th v-if="heros.length > 1" class="handle-cell"></fig-th>
                            <fig-th>{{ $t('Image') }}</fig-th>
                            <fig-th sortable prop="title">{{ $t('Title') }}</fig-th>
                            <fig-th sortable prop="caption">{{ $t('Caption') }}</fig-th>
                            <fig-th>{{ $t('Image alt text') }}</fig-th>
                            <fig-th sortable prop="published">{{ $t('Published') }}</fig-th>
                            <fig-th>{{ $t('Actions') }}</fig-th>
                        </tr>
                    </template>

                    <draggable
                        v-model="heros"
                        ghost-class="ghost"
                        handle=".handle"
                        @update="setOrdinals"
                        tag="tbody">
                        <tr v-for="(obj, idx) in heros" :key="idx">
                            <!-- handle -->
                            <fig-td v-if="heros.length > 1" class="align-middle">
                                <i class="handle">
                                    <fig-icon icon="dots-vertical-double" />
                                </i>
                            </fig-td>

                            <!-- image-->
                            <fig-td>
                                <fig-nuxt-img-bunny
                                    v-if="obj.url"
                                    :src="obj.url"
                                    preset="w150"
                                    loading="lazy"
                                    class="shadow" />
                            </fig-td>

                            <!-- title -->
                            <fig-td>
                                {{ obj.title }}
                            </fig-td>

                            <!-- caption -->
                            <fig-td>
                                {{ obj.caption }}
                            </fig-td>

                            <!-- alt_text -->
                            <fig-td>
                                {{ obj.alt_text }}
                            </fig-td>

                            <!-- published -->
                            <fig-td>
                                <boolean-tag :value="obj.published" />
                            </fig-td>

                            <!-- actions -->
                            <fig-td class="text-center">
                                <fig-operations-dropdown
                                    :show-view="false"
                                    @edit="onUpsert(obj.id)"
                                    @delete="onDelete(obj)"
                                    class="ml-1" />
                            </fig-td>
                        </tr>

                        <fig-tr-no-results v-if="!heros.length" :colspan="7" />
                    </draggable>
                </fig-table-simple>
            </fig-pagination-wrapper>
        </fig-overlay>


        <!-- add/upsert modal -->
        <fig-modal
            ref="hero_upsert_modal"
            size="md">

            <template v-slot:header>
                {{ form.heroId ? $t('Edit hero slide') : $t('Add hero slide') }}
            </template>

            <hero-upsert-form
                :id="form.heroId"
                @saved="onNexusFormSaved" />
        </fig-modal>
    </div>
</template>
