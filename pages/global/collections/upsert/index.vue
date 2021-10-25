<script>
import { getNextAvailableTypeValue } from '@/utils/common';

import {
    FigTextCard,
    FigButton,
    FigFormCheckbox,
    FigFormInput,
    FigFormTextarea,
    FigFormInputEndcapper
} from '@notoursllc/figleaf';

export default {
    components: {
        FigTextCard,
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
        this.$store.dispatch('ui/title', this.$t('Product collections'));

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
                const { data } = await this.$api.product.collection.get(id);
                this.collection = data;

                if(!this.collection) {
                    throw new Error(this.$t('Collection not found'));
                }
            }
            catch(e) {
                this.$figleaf.errorToast({
                    title: this.$t('Error'),
                    text: e.message
                });
            }
        },

        async setNextAvailableValue() {
            try {
                const { data } = await this.$api.product.collection.list();
                this.collection.value = getNextAvailableTypeValue(data);
            }
            catch(e) {
                this.$figleaf.errorToast({
                    title: this.$t('Error'),
                    text: e.message
                });
            }
        },

        async onFormSave() {
            try {
                const { data } = await this.$api.product.collection.upsert(this.collection);

                if(!data) {
                    throw new Error(this.$t('Error updating Collection'));
                }

                this.$figleaf.successToast({
                    title: data.id ? this.$t('Collection updated successfully') : this.$t('Collection added successfully'),
                    text: data.name
                });

                this.goToProductCollectionList();

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
</script>


<template>
    <div>
        <fig-text-card class="mb-5">
            <div slot="header-left">{{ $t('General Info') }}</div>

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
        </fig-text-card>

        <!-- SEO -->
        <fig-text-card>
            <div slot="header-left">{{ $t('Search engine listing') }}</div>

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
        </fig-text-card>

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
