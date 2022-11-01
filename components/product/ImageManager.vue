<script>
import draggable from 'vuedraggable';
import product_mixin from '@/mixins/product_mixin';
import { getImage } from '@/node_modules/@notoursllc/figleaf/components/nuxtImgBunny/bunnyProvider.js';

import {
    FigFormGroup,
    FigFormInput,
    FigButton,
    FigTooltip,
    FigOverlay,
    FigModal,
    FigTableSimple,
    FigTh,
    FigTd,
    FigPopConfirm,
    FigTag
} from '@notoursllc/figleaf';

export default {
    name: 'ImageManager',

    components: {
        draggable,
        FigFormGroup,
        FigFormInput,
        FigButton,
        FigTooltip,
        FigOverlay,
        FigModal,
        FigTableSimple,
        FigTh,
        FigTd,
        FigPopConfirm,
        FigTag
    },

    mixins: [
        product_mixin
    ],

    props: {
        value: {
            type: Array,
            default: () => {
                return [];
            }
        },

        maxNumImages: {
            type: Number,
            default: 10
        }
    },

    data() {
        return {
            loading: false,
            dialogImageUrl: '',
            fileList: [],
            accept: 'image/png, image/jpeg, image/gif',
            fileInputErrorMessage: ''
        };
    },

    computed: {
        numRemainingUploads() {
            return this.maxNumImages - this.fileList.length;
        }
    },

    watch: {
        value: {
            handler(newVal) {
                if(Array.isArray(newVal)) {
                    this.fileList = newVal;
                }
            },
            immediate: true
        }
    },

    methods: {
        emitInput() {
            this.$emit('input', this.fileList);
        },

        emitDelete(id) {
            this.$emit('delete', id);
        },

        onPreview(url) {
            const img = getImage(url, {
                preset: 'w1280'
            });

            this.dialogImageUrl = img.url;
            this.$refs.image_preview_modal.show();
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

        async onFileChange(event) {
            // event.target.files is a FileList object
            // https://developer.mozilla.org/en-US/docs/Web/API/FileList
            const files = event.target.files;
            const numUploadedFiles = files.length;

            // console.log("ON FILE CHAGNE", files);
            // console.log("ON FILE CHAGNE refs", this.$refs['file-input']);

            if (!files.length) {
                return;
            }

            try {
                if(!this.filesAreAcceptedTypes(files)) {
                    throw new Error(this.$t('File type not allowed'));
                }

                const imageOverage = (this.fileList.length + numUploadedFiles) - this.maxNumImages;

                if(imageOverage > 0) {
                    const numRemaining = this.maxNumImages - this.fileList.length;
                    this.fileInputErrorMessage = numRemaining === 1
                        ? this.$t('You can choose only one more image')
                        : this.$t('You can choose only _num_ more images', {number: numRemaining});
                    return;
                }

                this.fileInputErrorMessage = '';

                const resizePromises = [];
                const newFileListIndexes = [];

                for (let i=0; i<numUploadedFiles; i++) {
                    resizePromises.push(
                        this.$api.media.addImage(files[i])
                    );

                    newFileListIndexes.push(this.fileList.length);
                    const newOrdinal = this.fileList.length;

                    // this adds a new entry to the table so the user can see a loading
                    // indicator for the new image(s)
                    this.fileList.push({
                        id: null,
                        alt_text: null,
                        ordinal: newOrdinal,
                        url: null,
                        loading: true
                    });
                }

                const responses = await Promise.all(resizePromises);

                responses.forEach((res, index) => {
                    const fileListIndex = newFileListIndexes[index];
                    const responseData = res.data;

                    this.fileList[fileListIndex].id = responseData.id;
                    this.fileList[fileListIndex].url = responseData.url || null;
                    this.fileList[fileListIndex].loading = false;
                });

                // this.createTempImages(files);
                this.emitInput();
            }
            catch(e) {
                this.$figleaf.errorToast({
                    title: this.$t('Error'),
                    text: e.message
                });
            }
        },

        onDeleteImage(obj, index) {
            if(obj.id) {
                this.emitDelete(obj.id);
            }

            // If this is a newly uploaded image then all we need to do
            // is splice it from the fileList
            this.fileList.splice(index, 1);
            this.setOrdinals();
        },

        setOrdinals() {
            this.fileList.forEach((obj, index) => {
                obj.ordinal = index;
            });

            this.emitInput();
        },

        getBunnyBgImage(url) {
            const img = getImage(url, {
                preset: 'w375'
            });
            return img.url;
        }

        // fileInputValueFormatter(files) {
        //     const numFiles = files.length;
        //     return this.$tc('_num_ images selected', numFiles, {number: numFiles});
        // }
    }
};
</script>


<template>
    <div>

        <!-- upload form -->
        <div class="mb-4">
            <fig-form-group>
                <input
                    v-show="numRemainingUploads > 0"
                    ref="file-input"
                    :accept="accept"
                    :multiple="true"
                    type="file"
                    :placeholder="$t('No file chosen')"
                    id="file_input"
                    @input="onFileChange">

                <div slot="error" v-if="fileInputErrorMessage">{{ fileInputErrorMessage }}</div>
                <div slot="description">{{ $t('You can upload num more images', {number: numRemainingUploads} ) }}</div>
            </fig-form-group>
        </div>

        <!-- image table -->
        <draggable
            v-model="fileList"
            ghost-class="ghost"
            handle=".handle"
            @update="setOrdinals"
            tag="div"
            class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            <div
                v-for="(obj, index) in fileList" :key="index"
                class="shadow-sm rounded-lg bg-gray-50 border border-gray-200 flex-shrink-0 h-full">
                    <div class="flex flex-col h-full">
                        <div v-if="fileList.length > 1"  class="flex items-center justify-center w-full p-1">
                            <i class="handle">
                                <fig-icon icon="dots" />
                            </i>
                        </div>

                        <fig-overlay :show="obj.loading" class="p-2 flex-1">
                            <div @click="onPreview(obj.url)"
                                class="cursor-pointer relative flex-grow">
                                <div style="padding:0 0 100% 0;">
                                    <div class="absolute top-0 right-0 left-0 bottom-0"
                                        :style="`background-image: url(${getBunnyBgImage(obj.url)}); background-size: contain; background-position: 50% 50%; background-repeat: no-repeat;`">

                                        <fig-tag
                                            v-if="index === 0"
                                            size="sm"
                                            variant="dark"
                                            class="absolute top-0 left-0 mt-1 ml-1">{{ $t('Primary') }}</fig-tag>
                                    </div>
                                </div>
                            </div>

                            <div class="mt-2 flex w-full items-center">
                                <div class="flex-grow">
                                    <fig-form-input
                                        v-model="obj.alt_text"
                                        class="w-full"
                                        :placeholder="$t('Image alt text')"
                                        @input="emitInput" />
                                </div>

                                <div>
                                    <fig-tooltip placement="top">
                                        <div slot="toggler" class="ml-1 cursor-pointer">
                                            <fig-icon icon="info-circle" width="20" height="20" />
                                        </div>
                                        {{ $t('Image_alt_text_description') }}
                                    </fig-tooltip>
                                </div>
                            </div>
                        </fig-overlay>

                        <div class="flex justify-end w-full pr-1 pb-1">
                            <fig-pop-confirm
                                @confirm="onDeleteImage(obj, index)"
                                v-if="!obj.loading">
                                {{ $t('Delete this item?') }}

                                <fig-button
                                    slot="reference"
                                    variant="plain"
                                    dotted
                                    icon="trash"
                                    size="sm" />
                            </fig-pop-confirm>
                        </div>
                    </div>
            </div>
        </draggable>


        <fig-modal
            ref="image_preview_modal"
            size="xl">
            <div slot="header"></div>
            <img :src="dialogImageUrl" alt="">
        </fig-modal>
    </div>
</template>

<style>
.ghost {
    opacity: 0.5;
    background: #c8ebfb;
}
</style>
