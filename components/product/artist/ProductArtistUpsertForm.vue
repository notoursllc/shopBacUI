<script>
import Vue from 'vue';

import {
    FigButton,
    FigOverlay,
    FigLabelValueGroup,
    FigLabelValue,
    FigFormInput,
    FigFormTextarea,
    FigFormCheckbox,
    FigSelectCountry,
    FigSelectStateProvince
} from '@notoursllc/figleaf';


export default Vue.extend({
    components: {
        FigButton,
        FigOverlay,
        FigLabelValueGroup,
        FigLabelValue,
        FigFormInput,
        FigFormTextarea,
        FigFormCheckbox,
        FigSelectCountry,
        FigSelectStateProvince
    },

    props: {
        id: {
            type: String
        },

        showIsGlobal: {
            type: Boolean,
            default: false
        },

        defaults: {
            type: Object,
            default() {
                return {};
            }
        }
    },

    data() {
        return {
            loading: false,
            form: {
                published: true,
                is_global: true,
                file: null,
                name: null,
                description: null,
                website: null,
                city: null,
                state: null,
                countryCodeAlpha2: null
            },
            fileError: null,
            accept: 'image/png, image/jpeg, image/gif'
        };
    },

    mounted() {
        if(this.id) {
            this.fetchArtist();
        }
    },


    watch: {
        defaults: {
            async handler(newVal) {
                for(const key in newVal) {
                    if (this.form.hasOwnProperty(key) && key !== 'file') {
                        this.form[key] = newVal[key];
                    }
                }
            },
            immediate: true
        }
    },

    methods: {
        async fetchArtist() {
            try {
                this.loading = true;

                const { data } = await this.$api.product_artists.get(this.id);

                if(!data) {
                    throw new Error(this.$t('Item not found'));
                }

                this.form = {
                    ...data
                };
            }
            catch(e) {
                this.$figleaf.errorToast({
                    title: this.$t('Error'),
                    text: e.message
                });
            }

            this.loading = false;
        },

        /**
         * Checks to see if every File in FileList is of the accepted file type
         *
         * https://developer.mozilla.org/en-US/docs/Web/API/FileList
         * @returns boolean
         */
        filesAreAcceptedTypes(FileList) {
            const acceptedTypes = this.accept.split(',').map((type) => type.trim());
            let isAcceptedType = true;

            for (let i=0; i<FileList.length; i++) {
                if (acceptedTypes.indexOf(FileList[i].type) === -1) {
                    isAcceptedType = false;
                }
            }

            return isAcceptedType;
        },

        onFileChange(event) {
            // event.target.files is a FileList object
            // https://developer.mozilla.org/en-US/docs/Web/API/FileList
            const files = event.target.files;


            if(!this.filesAreAcceptedTypes(files)) {
                this.fileError = this.$t('File type not allowed');
                this.form.file = null;
            }
            else {
                this.fileError = null;
                this.form.file = files[0];
                console.log("FILES", this.form.file);
            }
        },

        async onSave() {
            try {
                this.loading = true;

                const args = {
                    ...this.form
                };
                if(this.id) {
                    args.id = this.id;
                }

                const response = await this.$api.product_artists.upsert(args);
                this.$emit('saved', response.data);
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
});
</script>


<template>
    <fig-overlay :show="loading">
        <form @submit.prevent="onSave">
            <fig-label-value-group density="lg" display="table" class="w-full">
                <!-- Published -->
                <fig-label-value>
                    <template v-slot:label>{{ $t('Published') }}:</template>
                    <fig-form-checkbox v-model="form.published" />
                </fig-label-value>

                <!-- Is global -->
                <fig-label-value v-if="showIsGlobal">
                    <template v-slot:label>{{ $t('Is global') }}:</template>
                    <fig-form-checkbox v-model="form.is_global" />
                </fig-label-value>

                <!-- image upload -->
                <fig-label-value>
                    <template v-slot:label><label for="country_code">{{ $t('Image') }}:</label></template>
                    <input
                        ref="file-input"
                        :accept="accept"
                        :multiple="false"
                        type="file"
                        :placeholder="$t('No file chosen')"
                        id="file_input"
                        @input="onFileChange">

                    <template v-slot:error>
                        <div v-if="fileError">{{ fileError }}</div>
                    </template>
                </fig-label-value>

                <!-- Name -->
                <fig-label-value>
                    <template v-slot:label>{{ $t('Name') }}:</template>
                    <fig-form-input v-model="form.name" />
                </fig-label-value>

                <!-- description -->
                <fig-label-value>
                    <template v-slot:label>{{ $t('Description') }}:</template>
                    <fig-form-textarea
                        v-model="form.description"
                        rows="5" />
                </fig-label-value>

                <!-- website -->
                <fig-label-value>
                    <template v-slot:label>{{ $t('Website') }}:</template>
                    <fig-form-input v-model="form.website" />
                </fig-label-value>

                <!-- city -->
                <fig-label-value>
                    <template v-slot:label>{{ $t('City') }}:</template>
                    <fig-form-input v-model="form.city" />
                </fig-label-value>

                <!-- country -->
                <fig-label-value>
                    <template v-slot:label>{{ $t('Country') }}:</template>
                    <fig-select-country
                        v-model="form.countryCodeAlpha2"
                        :clearable="false"
                        id="country_code" />
                </fig-label-value>

                <!-- state -->
                <fig-label-value>
                    <template v-slot:label>{{ $t('State/Province/Region') }}:</template>
                    <fig-select-state-province
                        v-model="form.state"
                        :country="form.countryCodeAlpha2"
                        :clearable="false"
                        id="state" />
                </fig-label-value>
            </fig-label-value-group>

            <div class="pt-4 text-center">
                <fig-button
                    type="submit"
                    variant="primary"
                    size="lg">{{ $t('Save') }}</fig-button>
            </div>
        </form>
    </fig-overlay>
</template>
