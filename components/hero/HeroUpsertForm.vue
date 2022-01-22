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
    FigMetaDataBuilder
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
        FigMetaDataBuilder
    },

    props: {
        id: {
            type: String
        }
    },

    data() {
        return {
            loading: false,
            form: {
                published: true,
                file: null,
                title: null,
                caption: null,
                alt_text: null,
                metadata: null
            },
            fileError: null,
            accept: 'image/png, image/jpeg, image/gif'
        };
    },

    mounted() {
        if(this.id) {
            this.fetchHero();
        }
    },

    methods: {
        async fetchHero() {
            try {
                this.loading = true;

                const { data } = await this.$api.hero.get(this.id);

                if(!data) {
                    throw new Error(this.$t('Item not found'));
                }

                if(data.metadata) {
                    data.metadata = JSON.parse(data.metadata);
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
            const acceptedTypes = this.accept.split(',').map((type) => { return type.trim() });
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
            }
        },

        async onSave(event) {
            try {
                this.loading = true;

                await this.$api.hero.upsert({
                    ...this.form,
                    id: this.id
                });

                this.$emit('saved');
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
                        @input="onFileChange" >

                    <template v-slot:error>
                        <div v-if="fileError">{{ fileError }}</div>
                    </template>

                    <div class="pt-2 text-gray-500">{{ $t('hero_image_aspect_ratio_recommendation') }}</div>
                </fig-label-value>

                <!-- image alt text -->
                <fig-label-value>
                    <template v-slot:label>{{ $t('Image alt text') }}:</template>
                    <fig-form-input v-model="form.alt_text" />
                </fig-label-value>

                <!-- title -->
                <fig-label-value>
                    <template v-slot:label>{{ $t('Title') }}:</template>
                    <fig-form-input v-model="form.title" />
                </fig-label-value>

                <!-- caption -->
                <fig-label-value>
                    <template v-slot:label>{{ $t('Caption') }}:</template>
                    <fig-form-textarea
                        v-model="form.caption"
                        rows="5" />
                </fig-label-value>


                <!-- Meta data -->
                <fig-label-value>
                    <template v-slot:label>{{ $t('Meta data') }}:</template>
                    <div class="mt-3">
                        <fig-meta-data-builder v-model="form.metadata" />
                    </div>
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
