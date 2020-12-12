<script>
import { getNextAvailableTypeValue } from '@/utils/common';
import TextCard from '@/components/TextCard';

import {
    FigButton,
    FigFormCheckbox,
    FigFormInput,
    FigFormTextarea,
    FigFormInputEndcapper
} from '@notoursllc/figleaf';

export default {
    components: {
        TextCard,
        FigButton,
        FigFormCheckbox,
        FigFormInput,
        FigFormTextarea,
        FigFormInputEndcapper
    },

    data() {
        return {
            collection: {},
            domainName: this.$config.DOMAIN_NAME
        };
    },

    async mounted() {
        if(this.$route.params.id) {
            this.fetchCollection(this.$route.params.id);
        }
        else {
            await this.setNextAvailableValue();
        }
    },

    methods: {
        goToProductCollectionList() {
            this.$router.push({
                name: 'product-collections'
            });
        },

        async fetchCollection(id) {
            try {
                this.collection = await this.$api.productCollections.get(id);

                if(!this.collection) {
                    throw new Error(this.$t('Collection not found'));
                }
            }
            catch(e) {
                this.$errorToast({
                    title: this.$t('Error'),
                    text: e.message
                });
            }
        },

        async setNextAvailableValue() {
            try {
                const collections = await this.$api.productCollections.list();
                this.collection.value = getNextAvailableTypeValue(collections);
            }
            catch(e) {
                this.$errorToast({
                    title: this.$t('Error'),
                    text: e.message
                });
            }
        },

        async onFormSave() {
            try {
                const collection = await this.$api.productCollections.upsert(this.collection);

                if(!collection) {
                    throw new Error(this.$t('Error updating Collection'));
                }

                this.$successToast({
                    title: collection.id ? this.$t('Collection updated successfully') : this.$t('Collection added successfully'),
                    text: collection.name
                });

                this.goToProductCollectionList();

            }
            catch(e) {
                this.$errorToast({
                    title: this.$t('Error'),
                    text: e.message
                });
            }
        }
    }
};
</script>


<template>
    <div>
        <text-card class="mb-5">
            <div slot="header">{{ $t('General Info') }}</div>

            <!-- Available -->
            <div class="inputRow">
                <span>
                    <fig-form-checkbox
                        v-model="collection.published">{{ $t('Published') }}</fig-form-checkbox>
                </span>
            </div>

            <!-- Name -->
            <div class="inputRow">
                <label>{{ $t('Name') }}:</label>
                <span>
                    <fig-form-input
                        v-model="collection.name" />
                </span>
            </div>

            <!-- Description -->
            <div class="inputRow">
                <label>{{ $t('Description') }}:</label>
                <span>
                    <fig-form-textarea
                        v-model="collection.description"
                        rows="2" />
                </span>
            </div>

            <!-- Value -->
            <div class="inputRow">
                <label>{{ $t('Value') }}:</label>
                <span> {{ collection.value }}</span>
            </div>
        </text-card>

        <!-- SEO -->
        <text-card>
            <div slot="header">{{ $t('Search engine listing') }}</div>

            <!-- page title -->
            <div class="inputRow">
                <label>{{ $t('Page title') }}:</label>
                <span>
                    <fig-form-input
                        v-model="collection.seo_page_title" />
                </span>
            </div>

            <!-- description -->
            <div class="inputRow">
                <label>{{ $t('Description') }}:</label>
                <span>
                    <fig-form-textarea
                        v-model="collection.seo_page_desc"
                        rows="2" />
                </span>
            </div>

            <!-- URI -->
            <div class="inputRow">
                <label>{{ $t('URL and handle') }}:</label>
                <span>
                    <fig-form-input-endcapper>
                        <template slot="prefix">{{ `https://${domainName}` }}</template>

                        <fig-form-input
                            v-model="collection.seo_uri"
                            maxlength="50"
                            square-left />
                    </fig-form-input-endcapper>
                </span>
            </div>
        </text-card>

        <!-- buttons -->
        <div class="pt-5">
            <fig-button
                variant="primary"
                @click="onFormSave"
                class="mr-2">{{ $t('Save') }}</fig-button>

            <fig-button
                variant="plain"
                @click="goToProductCollectionList">{{ $t('Cancel') }}</fig-button>
        </div>
    </div>
</template>


<style lang="scss">
    @import "~assets/css/components/_table.scss";
    @import "~assets/css/components/_formRow.scss";

    .formContainer {
        width: 500px;

        .formRow > label {
            white-space: nowrap;
        }

        .formRow > span {
            width: 100%;
        }
    }
</style>
