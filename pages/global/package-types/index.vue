<script>
import { required } from 'vuelidate/lib/validators';

import {
    FigOperationsDropdown,
    FigButton,
    FigButtonFab,
    FigFormInput,
    FigFormTextarea,
    FigFormInputNumber,
    FigFormGroup,
    FigTableSimple,
    FigTh,
    FigTd,
    FigTrNoResults,
    FigModal,
    FigOverlay
} from '@notoursllc/figleaf';

export default {
    components: {
        FigOperationsDropdown,
        FigButton,
        FigButtonFab,
        FigFormInput,
        FigFormTextarea,
        FigFormInputNumber,
        FigFormGroup,
        FigTableSimple,
        FigTh,
        FigTd,
        FigTrNoResults,
        FigModal,
        FigOverlay
    },

    data() {
        return {
            loading: false,
            loadingForm: false,
            packageTypes: [],
            dialog: {
                packageTypeId: null
            },
            form: {
                id: null,
                label: null,
                description: null,
                code: null,
                // code_for_carrier: null,
                length_cm: null,
                width_cm: null,
                height_cm: null,
                weight_oz: null,
                max_weight_oz: null
            }
        };
    },

    validations: {
        form: {
            label: {
                required
            },
            length_cm: {
                required
            },
            width_cm: {
                required
            },
            height_cm: {
                required
            }
        }
    },

    computed: {
        labelSuggestion() {
            const parts = [];

            if(this.form.length_cm) {
                parts.push(this.form.length_cm);
            }
            if(this.form.width_cm) {
                parts.push(this.form.width_cm);
            }
            if(this.form.height_cm) {
                parts.push(this.form.height_cm);
            }

            if(parts.length > 1) {
                return parts.join('x');
            }

            return '';
        }
    },

    created() {
        this.fetchData();
        this.$store.dispatch('ui/title', this.$t('Package Types'));
    },

    methods: {
        async fetchData(paramsObj) {
            this.loading = true;

            try {
                this.packageTypes = await this.$api.packageTypes.list(paramsObj);
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
            this.fetchData({
                sortBy: val.by,
                sortDesc: !val.isAsc
            });
        },

        async onDelete(data) {
            const confirmed = await this.$showConfirm(
                this.$t('remove_label?', {label: data.label}),
                'warning'
            );

            if(!confirmed) {
                return;
            }

            this.loading = true;

            try {
                const response = await this.$api.packageTypes.delete(data.id);

                if(!response) {
                    throw new Error(this.$t('Item not found'));
                }

                this.loading = false;

                this.fetchData();

                this.$figleaf.successToast({
                    title: this.$t('Success'),
                    text: this.$t('item_deleted_label', {label: data.label})
                });
            }
            catch(e) {
                this.loading = false;

                this.$figleaf.errorToast({
                    title: this.$t('Error'),
                    text: e.message
                });
            }
        },

        async onUpsertClick(id) {
            this.form.id = id || null;

            if(id) {
                this.form = await this.$api.packageTypes.get(id);
            }

            this.showDialog();
        },

        onClickAdd() {
            this.clearForm();
            this.showDialog();
        },

        showDialog(show) {
            show === false ? this.$refs.type_upsert_modal.hide() : this.$refs.type_upsert_modal.show();
        },

        async onUpsertFormSave() {
            this.loadingForm = true;

            try {
                const obj = await this.$api.packageTypes.upsert(this.form);

                if(!obj) {
                    throw new Error(this.$t('Error updating Package Type'));
                }

                this.$figleaf.successToast({
                    title: this.$t('Success'),
                    text: this.$t(this.form.id ? 'updated_name' : 'added_name', { name: obj.label })
                });

                this.showDialog(false);
                this.fetchData();
                this.clearForm();
            }
            catch(e) {
                this.$figleaf.errorToast({
                    title: this.$t('Error'),
                    text: e.message
                });
            }

            this.loadingForm = false;
        },

        onUpsertFormCancel() {
            this.showDialog(false);
        },

        clearForm() {
            for(const key in this.form) {
                this.form[key] = null;
            }
        },

        useLabelSuggestion() {
            this.form.label = this.labelSuggestion;
        }
    }
};
</script>


<template>
    <div>
        <fig-button-fab icon="plus" @click="onClickAdd()" />

        <fig-overlay :show="loading">
            <fig-table-simple
                striped
                hover
                @sort="sortChanged">
                <template slot="head">
                    <tr>
                        <fig-th sortable prop="label">{{ $t('Label') }}</fig-th>
                        <fig-th sortable prop="code">{{ $t('Carrier package type code') }}</fig-th>
                        <fig-th sortable prop="length_cm" right>{{ $t('Length (cm)') }}</fig-th>
                        <fig-th sortable prop="width_cm" right>{{ $t('Width (cm)') }}</fig-th>
                        <fig-th sortable prop="height_cm" right>{{ $t('Height (cm)') }}</fig-th>
                        <fig-th sortable prop="weight_oz" right>{{ $t('Weight (oz)') }}</fig-th>
                        <fig-th sortable prop="max_weight_oz" right>{{ $t('Max weight (oz)') }}</fig-th>
                    </tr>
                </template>

                <tr v-for="(obj, idx) in packageTypes" :key="idx">
                    <fig-td>
                        {{ obj.label }}
                        <fig-operations-dropdown
                            :show-view="false"
                            @edit="onUpsertClick(obj.id)"
                            @delete="onDelete(obj)"
                            class="ml-1" />
                    </fig-td>

                    <!-- code -->
                    <fig-td>
                        {{ obj.code }}
                    </fig-td>

                    <!-- length -->
                    <fig-td class="text-right">
                        {{ $n(obj.length_cm) }}
                    </fig-td>

                    <!-- width -->
                    <fig-td class="text-right">
                        {{ $n(obj.width_cm) }}
                    </fig-td>

                    <!-- height -->
                    <fig-td class="text-right">
                        {{ $n(obj.height_cm) }}
                    </fig-td>

                    <!-- weight -->
                    <fig-td class="text-right">
                        {{ $n(obj.weight_oz) }}
                    </fig-td>

                    <!-- max weight -->
                    <fig-td class="text-right">
                        {{ $n(obj.max_weight_oz) }}
                    </fig-td>
                </tr>

                <fig-tr-no-results
                    v-if="!packageTypes.length"
                    colspan="7" />
            </fig-table-simple>
        </fig-overlay>


        <fig-modal
            ref="type_upsert_modal"
            size="lg">
            <div slot="header">
                {{ form.id
                    ? $t(`Edit Package Type: {name}`, {'name': object})
                    : $t('Add Package Type') }}
            </div>

            <fig-overlay :show="loadingForm">
                <div>
                    <div class="flex flex-wrap sm:-mx-3">
                        <div class="w-full sm:my-3 sm:px-3 sm:w-1/3">
                            <!-- length -->
                            <fig-form-group class="mb-3">
                                <label slot="label" for="input_length">{{ $t('Length (cm)') }}</label>
                                <fig-form-input-number
                                    v-model="form.length_cm"
                                    id="input_length"
                                    :step="1"
                                    :min="0"
                                    controls-right
                                    size="md" />

                                <div
                                    v-if="$v.form.length_cm.$invalid"
                                    slot="error">{{ $t('Required') }}</div>
                            </fig-form-group>
                        </div>

                        <div class="w-full sm:my-3 sm:px-3 sm:w-1/3">
                            <!-- width -->
                            <fig-form-group class="mb-3">
                                <label slot="label" for="input_width">{{ $t('Width (cm)') }}</label>
                                <fig-form-input-number
                                    v-model="form.width_cm"
                                    id="input_width"
                                    :step="1"
                                    :min="0"
                                    controls-right
                                    size="md" />

                                <div
                                    v-if="$v.form.width_cm.$invalid"
                                    slot="error">{{ $t('Required') }}</div>
                            </fig-form-group>
                        </div>


                        <div class="w-full sm:my-3 sm:px-3 sm:w-1/3">
                            <!-- height -->
                            <fig-form-group class="mb-3">
                                <label slot="label" for="input_width">{{ $t('Height (cm)') }}</label>
                                <fig-form-input-number
                                    v-model="form.height_cm"
                                    id="input_width"
                                    :step="1"
                                    :min="0"
                                    controls-right
                                    size="md" />

                                <div
                                    v-if="$v.form.height_cm.$invalid"
                                    slot="error">{{ $t('Required') }}</div>
                            </fig-form-group>
                        </div>
                    </div>

                    <div class="flex flex-wrap sm:-mx-3">
                        <div class="w-full sm:my-3 sm:px-3 sm:w-1/2">
                            <!-- label -->
                            <fig-form-group class="mb-3">
                                <label slot="label" for="input_label">{{ $t('Label') }}</label>
                                <fig-form-input
                                    v-model="form.label"
                                    id="input_label" />
                                <div v-if="labelSuggestion && labelSuggestion !== form.label" class="flex items-center mt-1">
                                    <span class="text-gray-600 text-sm pr-2">{{ $t('Suggestion') }}:</span>
                                    <fig-button
                                        variant="plain"
                                        size="sm"
                                        @click="useLabelSuggestion">{{ labelSuggestion }}</fig-button>
                                </div>

                                <div
                                    v-if="$v.form.label.$invalid"
                                    slot="error">{{ $t('Required') }}</div>
                            </fig-form-group>
                        </div>

                        <div class="w-full sm:my-3 sm:px-3 sm:w-1/2">
                            <!-- code -->
                            <fig-form-group class="mb-3">
                                <label slot="label" for="input_code">{{ $t('Carrier package type code') }}</label>
                                <fig-form-input
                                    v-model="form.code"
                                    id="input_code" />
                            </fig-form-group>
                        </div>
                    </div>

                    <!-- description -->
                    <fig-form-group class="mb-3">
                        <label slot="label" for="input_desc">{{ $t('Description') }}</label>
                        <fig-form-textarea
                            v-model="form.description"
                            :rows="2"
                            id="input_desc" />
                    </fig-form-group>


                    <div class="flex flex-wrap sm:-mx-3">
                        <div class="w-full sm:my-3 sm:px-3 sm:w-1/2">
                            <!-- weight -->
                            <fig-form-group class="mb-3">
                                <label slot="label" for="input_weight">{{ $t('Weight (oz)') }}</label>
                                <fig-form-input-number
                                    v-model="form.weight_oz"
                                    id="input_weight"
                                    :step="1"
                                    :min="0"
                                    controls-right
                                    size="md" />
                            </fig-form-group>
                        </div>

                        <div class="w-full sm:my-3 sm:px-3 sm:w-1/2">
                            <!-- max weight -->
                            <fig-form-group>
                                <label slot="label" for="input_maxweight">{{ $t('Max weight (oz)') }}</label>
                                <fig-form-input-number
                                    v-model="form.max_weight_oz"
                                    id="input_maxweight"
                                    :step="1"
                                    :min="0"
                                    controls-right
                                    size="md" />
                            </fig-form-group>
                        </div>
                    </div>
                </div>


                <!-- buttons -->
                <div class="mt-6 ml-2 flex items-center">
                    <fig-button
                        variant="primary"
                        @click="onUpsertFormSave"
                        class="mr-3"
                        :disabled="$v.form.$invalid">{{ $t('Save') }}</fig-button>

                    <fig-button
                        variant="plain"
                        @click="onUpsertFormCancel">{{ $t('Cancel') }}</fig-button>
                </div>
            </fig-overlay>
        </fig-modal>
    </div>
</template>
