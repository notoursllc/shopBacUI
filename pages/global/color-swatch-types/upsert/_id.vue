<script>
import { required } from 'vuelidate/lib/validators';

import {
    FigButton,
    FigFormInput,
    FigFormTextarea,
    FigFormGroup,
    FigCol,
    FigRow,
    FigMetaDataBuilder
} from '@notoursllc/figleaf';

export default {
    components: {
        FigButton,
        FigFormInput,
        FigFormTextarea,
        FigFormGroup,
        FigCol,
        FigRow,
        FigMetaDataBuilder
    },

    data() {
        return {
            type: null,
            form: {
                hex: '#000000',
                label: null,
                description: null,
                metadata: null
            }
        };
    },

    validations: {
        form: {
            hex: {
                required
            },
            label: {
                required
            }
        }
    },


    async mounted() {
        try {
            let pageTitle = this.$t('Add swatch');
            this.form.id = this.$route.params.id || null;

            if(this.$route.params.id) {
                await this.fetchSwatch(this.$route.params.id);
                pageTitle = this.$t('Edit swatch: {name}', {name: this.form.label});
            }

            this.$store.dispatch('ui/title', pageTitle);
        }
        catch(e) {
            this.$figleaf.errorToast({
                title: this.$t('Error'),
                text: e.message
            });
        }
    },

    methods: {
        async fetchSwatch(id) {
            try {
                const { data } = await this.$api.product.colorSwatch.get(id);
                this.form = data;
            }
            catch(e) {
                this.$figleaf.errorToast({
                    title: this.$t('Error'),
                    text: e.message
                });
            }
        },

        async onSave() {
            try {
                if(!this.form.id) {
                    delete this.form.id;
                }

                const { data } = await this.$api.product.colorSwatch.upsert(this.form);

                if(!data) {
                    throw new Error(this.$t('Error updating Master Type'));
                }

                this.$figleaf.successToast({
                    title: this.$t('Success'),
                    text: this.$t(this.form.id ? 'updated_name' : 'added_name', { name: data.label })
                });

                this.goToList();
            }
            catch(e) {
                this.$figleaf.errorToast({
                    title: this.$t('Error'),
                    text: e.message
                });
            }
        },

        goToList() {
            this.$router.push({
                name: 'product-color-swatch-types'
            });
        }
    }
};
</script>


<template>
    <div>
        <!-- Swatch -->
        <fig-row sm="1/2" md="1/3" lg="1/4" default="full" default-gap="2" sm-gap="2">
            <fig-col>
                <fig-form-group>
                    <label slot="label" for="input_swatch">{{ $t('Swatch') }}</label>
                    <fig-form-input
                        type="color"
                        v-model="form.hex"
                        id="input_swatch" />

                    <div v-if="form.hex" class="text-sm color-gray-500 text-right">{{ form.hex }}</div>

                    <div
                        v-if="$v.form.hex.$invalid"
                        slot="error">{{ $t('Required') }}</div>
                </fig-form-group>
            </fig-col>
        </fig-row>

        <!-- Label -->
        <fig-row sm="1/2" md="1/3" lg="1/4" default="full" default-gap="2" sm-gap="2">
            <fig-col>
                <fig-form-group>
                    <label slot="label" for="input_label">{{ $t('Label') }}</label>
                    <fig-form-input
                        v-model="form.label"
                        id="input_label" />

                    <div
                        v-if="$v.form.label.$invalid"
                        slot="error">{{ $t('Required') }}</div>
                </fig-form-group>
            </fig-col>
        </fig-row>

        <!-- Description -->
        <fig-row sm="1/2" md="1/3" lg="1/4" default="full" default-gap="2" sm-gap="2">
            <fig-col>
                <fig-form-group>
                    <label slot="label" for="input_desc">{{ $t('Description') }}</label>
                    <fig-form-textarea
                        v-model="form.description"
                        :rows="2"
                        id="input_desc" />
                </fig-form-group>
            </fig-col>
        </fig-row>

        <!-- Meta data -->
        <fig-row sm="full" md="1/2" lg="1/3" default="full" default-gap="2" sm-gap="2">
            <fig-col>
                <fig-form-group>
                    <label slot="label">{{ $t('Meta data') }}</label>
                    <fig-meta-data-builder v-model="form.metadata" />
                </fig-form-group>
            </fig-col>
        </fig-row>

        <!-- buttons -->
        <div class="mt-6 ml-2">
            <fig-button
                variant="primary"
                @click="onSave"
                class="mr-3"
                :disabled="$v.form.$invalid">{{ $t('Save') }}</fig-button>

            <fig-button
                variant="plain"
                @click="goToList">{{ $t('Cancel') }}</fig-button>
        </div>
    </div>
</template>

