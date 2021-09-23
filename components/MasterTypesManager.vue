<script>
import draggable from 'vuedraggable';
import isObject from 'lodash.isobject';
import slugify from 'slugify';

import BooleanTag from '@/components/BooleanTag';
import MetaDataBuilder from '@/components/MetaDataBuilder';

import {
    FigButton,
    FigButtonFab,
    FigFormCheckbox,
    FigFormInput,
    FigFormTextarea,
    FigModal,
    FigTableSimple,
    FigTh,
    FigTd,
    FigOverlay,
    FigOperationsDropdown,
    FigLabelValueGroup,
    FigLabelValue
} from '@notoursllc/figleaf';

export default {
    components: {
        draggable,
        BooleanTag,
        MetaDataBuilder,
        FigButton,
        FigButtonFab,
        FigFormCheckbox,
        FigFormInput,
        FigFormTextarea,
        FigModal,
        FigTableSimple,
        FigTh,
        FigTd,
        FigOverlay,
        FigOperationsDropdown,
        FigLabelValueGroup,
        FigLabelValue
    },

    props: {
        object: {
            type: String,
            required: true
        }
    },

    data() {
        return {
            form: {
                name: null,
                slug: null,
                published: true,
                description: null,
                metadata: null
            },
            formHasMetaData: false,
            types: [],
            updatingSortOrder: false,
            loading: false
        };
    },

    computed: {
        slugIdea() {
            if(this.form.name) {
                return slugify(this.form.name, { lower: true });
            }
            return '';
        }
    },

    watch: {
        object: {
            async handler(newVal) {
                this.form.object = newVal;
                await this.fetchTypes();
                this.refreshState();
            },
            immediate: true
        }
    },

    methods: {
        refreshState() {
            return this.$store.dispatch('MASTER_TYPES', { object: this.object, value: this.types});
        },

        async fetchTypes(paramsObj) {
            this.loading = true;

            if(!isObject(paramsObj)) {
                paramsObj = {};
            }

            paramsObj.sortBy = paramsObj.sortBy || 'ordinal';
            paramsObj.sortDesc = paramsObj.hasOwnProperty('sortDesc') ? paramsObj.sortDesc : false;

            try {
                this.types = await this.$api.masterTypes.list({
                    where: ['object', '=', this.object],
                    // whereRaw: ['sub_type & ? > 0', [productTypeId]],
                    // andWhere: [
                    //     ['total_inventory_count', '>', 0]
                    // ],
                    ...paramsObj
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

        sortChanged(val) {
            this.fetchTypes({
                sortBy: val.by,
                sortDesc: !val.isAsc
            });
        },

        async onDeleteClick(data) {
            try {
                const confirmed = await this.$showConfirm(
                    this.$t('delete_name?', {name: data.name}),
                    'warning'
                );

                if(!confirmed) {
                    return;
                }

                const typeJson = await this.$api.masterTypes.delete(data.id);

                if(!typeJson) {
                    throw new Error(this.$t('Master type not found'));
                }

                await this.fetchTypes();
                this.refreshState();

                this.$figleaf.successToast({
                    title: this.$t('Success'),
                    text: this.$t('deleted_name', { name: data.name })
                });

            }
            catch(err) {
                this.$figleaf.errorToast({
                    title: this.$t('Error'),
                    text: err.message
                });
            }
        },


        async onUpsertClick(data) {
            try {
                this.clearForm();

                if(isObject(data) && data.id) {
                    const masterType = await this.$api.masterTypes.get(data.id);

                    if(!masterType) {
                        throw new Error(this.$t('Master Type not found'));
                    }

                    Object.keys(masterType).forEach((key) => {
                        this.form[key] = masterType[key];
                    });

                    this.formHasMetaData = Array.isArray(this.form.metadata);
                }
                else {
                    const masterTypes = await this.$api.masterTypes.all({
                        where: ['object', '=', this.object]
                    });
                    this.form.published = true;
                    this.form.value = this.$api.masterTypes.getNextAvailableTypeValue(masterTypes);
                }

                this.showDialog();
            }
            catch(e) {
                this.$figleaf.errorToast({
                    title: this.$t('Error'),
                    text: e.message
                });
            }
        },

        clearForm() {
            Object.keys(this.form).forEach((key) => {
                if(key !== 'object') {
                    this.form[key] = null;
                }
            });
        },

        async onUpsertFormSave() {
            try {
                this.form.object = this.object;

                if(!this.formHasMetaData) {
                    this.form.metadata = null;
                }

                const mt = await this.$api.masterTypes.upsert(this.form);

                if(!mt) {
                    throw new Error(this.$t('Error updating Master Type'));
                }

                this.$figleaf.successToast({
                    title: this.$t('Success'),
                    text: this.$t(this.form.id ? 'updated_name' : 'added_name', { name: mt.name })
                });

                this.showDialog(false);
                await this.fetchTypes();
                this.refreshState();
            }
            catch(e) {
                this.$figleaf.errorToast({
                    title: this.$t('Error'),
                    text: e.message
                });
            }
        },

        showDialog(show) {
            show === false ? this.$refs.type_upsert_modal.hide() : this.$refs.type_upsert_modal.show();
        },

        onUpsertFormCancel() {
            this.showDialog(false);
        },

        onUseSlugSuggestion() {
            this.form.slug = this.slugIdea;
        },

        setOrdinals() {
            this.updatingSortOrder = true;

            this.types.forEach((obj, index) => {
                obj.ordinal = index;
            });
        },

        async saveOrdinals() {
            this.loading = true;

            try {
                await this.$api.masterTypes.ordinals({
                    ordinals: this.types.map(
                        (obj) => {
                            return { id: obj.id, ordinal: obj.ordinal };
                        }
                    )
                });

                this.updatingSortOrder = false;

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
        }
    }
};
</script>


<template>
    <div>
        <fig-button-fab icon="plus" @click="onUpsertClick()" />

        <div
            v-if="updatingSortOrder"
            class="mb-4">
            <fig-button
                variant="primary"
                size="sm"
                @click="saveOrdinals"
                :disabled="loading">{{ $t('Save sorting changes') }}</fig-button>
        </div>

        <fig-overlay :show="loading">
            <fig-table-simple
                striped
                hover
                @sort="sortChanged">
                <template slot="head">
                    <tr>
                        <fig-th v-if="types.length > 1" class="handle-cell"></fig-th>
                        <fig-th sortable prop="name">{{ $t('Name') }}</fig-th>
                        <fig-th sortable prop="slug">{{ $t('Slug') }}</fig-th>
                        <fig-th sortable prop="published">{{ $t('Published') }}</fig-th>
                    </tr>
                </template>

                <draggable
                    v-model="types"
                    ghost-class="ghost"
                    handle=".handle"
                    @update="setOrdinals"
                    tag="tbody">
                    <tr
                        v-for="(type, idx) in types"
                        :key="idx">
                        <!-- handle -->
                        <fig-td v-if="types.length > 1" class="align-middle">
                            <i class="handle">
                                <fig-icon icon="dots-vertical-double" />
                            </i>
                        </fig-td>

                        <fig-td>
                            {{ type.name }}
                            <fig-operations-dropdown
                                :show-view="false"
                                @edit="onUpsertClick(type)"
                                @delete="onDeleteClick(type)"
                                class="ml-1" />
                        </fig-td>

                        <fig-td>
                            {{ type.slug }}
                        </fig-td>

                        <fig-td>
                            <boolean-tag :value="type.published" />
                        </fig-td>
                    </tr>

                    <fig-tr-no-results v-if="!types.length" :colspan="4" />
                </draggable>
            </fig-table-simple>
        </fig-overlay>


        <fig-modal
            ref="type_upsert_modal"
            size="xl">

            <div slot="header">
                {{ form.id
                    ? $t(`Edit Master Type ({name})`, {'name': object})
                    : $t(`Add Master Type ({name})`, {'name': object}) }}
            </div>

            <fig-label-value-group density="lg">
                <!-- Published -->
                <fig-label-value>
                    <template v-slot:label>{{ $t('Published') }}:</template>
                    <fig-form-checkbox v-model="form.published" />
                </fig-label-value>

                <!-- Name -->
                <fig-label-value>
                    <template v-slot:label>{{ $t('Name') }}:</template>
                    <fig-form-input v-model="form.name" />
                </fig-label-value>

                <!-- Slug -->
                <fig-label-value>
                    <template v-slot:label>{{ $t('Slug') }}:</template>
                    <fig-form-input v-model="form.slug" />
                    <div class="text-xs" v-show="slugIdea">
                        <span class="text-gray-500">{{ $t('Suggestion') }}:</span>&nbsp;&nbsp;{{ slugIdea }}&nbsp;
                        (<a @click="onUseSlugSuggestion" class="underlineDotted">{{ $t('use this') }}</a>)
                    </div>
                </fig-label-value>

                <!-- Description -->
                <fig-label-value>
                    <template v-slot:label>{{ $t('Description') }}:</template>
                    <fig-form-textarea
                        v-model="form.description"
                        :rows="2" />
                </fig-label-value>

                <!-- Meta data -->
                <fig-label-value>
                    <template v-slot:label>{{ $t('Meta data') }}:</template>
                    <fig-form-checkbox v-model="formHasMetaData">{{ $t('This item has additional meta data') }}</fig-form-checkbox>
                    <div class="mt-3" v-show="formHasMetaData">
                        <meta-data-builder v-model="form.metadata" />
                    </div>
                </fig-label-value>


                <!-- buttons -->
                <fig-label-value>
                    <template v-slot:label>&nbsp;</template>
                    <div class="pt-5">
                        <fig-button
                            variant="primary"
                            @click="onUpsertFormSave"
                            class="mr-3">{{ $t('Save') }}</fig-button>

                        <fig-button
                            variant="plain"
                            @click="onUpsertFormCancel">{{ $t('Cancel') }}</fig-button>
                    </div>
                </fig-label-value>
            </fig-label-value-group>

        </fig-modal>
    </div>
</template>

<style scoped>
.handle-cell {
    width: 30px;
}
.handle {
    cursor: grab;
}
</style>
