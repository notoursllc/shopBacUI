<script>
import draggable from 'vuedraggable';
import product_mixin from '@/mixins/product_mixin';

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
    FigCol,
    FigRow,
    FigPopConfirm
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
        FigCol,
        FigRow,
        FigPopConfirm
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
        emitChange() {
            this.$emit('input', this.fileList);
        },

        emitDelete(id) {
            this.$emit('delete', id);
        },

        onPreview(url) {
            this.dialogImageUrl = url;
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
                        this.$api.media.postImage(files[i])
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

                    this.fileList[fileListIndex].id = res.id;
                    this.fileList[fileListIndex].url = res.url;
                    this.fileList[fileListIndex].loading = false;
                });

                // this.createTempImages(files);
                this.emitChange();
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
            this.emitChange();
        },

        setOrdinals() {
            this.fileList.forEach((obj, index) => {
                obj.ordinal = index;
            });
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
        <fig-table-simple
            hover
            small
            responsive
            v-if="fileList.length"
            table-class="bread-table mb-5">
            <template slot="head">
                <tr>
                    <fig-th v-if="fileList.length > 1" class="w-5"></fig-th>
                    <fig-th class="w-24"></fig-th>
                    <fig-th>
                        <div class="flex items-center">
                            {{ $t('Alt text') }}

                            <fig-tooltip placement="top">
                                <div slot="toggler" class="ml-1 cursor-pointer">
                                    <fig-icon icon="info-circle" width="20" height="20" />
                                </div>
                                {{ $t('Image_alt_text_description') }}
                            </fig-tooltip>
                        </div>
                    </fig-th>
                    <fig-th class="w-24"></fig-th>
                </tr>
            </template>

            <draggable
                v-model="fileList"
                ghost-class="ghost"
                handle=".handle"
                @update="setOrdinals"
                tag="tbody">

                <tr v-for="(obj, index) in fileList" :key="index">
                    <!-- handle -->
                    <fig-td v-if="fileList.length > 1" class="align-middle">
                        <i class="handle">
                            <fig-icon icon="dots-vertical-double" />
                        </i>
                    </fig-td>

                    <!-- thumbnail -->
                    <fig-td>
                        <fig-overlay :show="obj.loading">
                            <span @click="onPreview(obj.url)" class="cursor-pointer">
                                <nuxt-img
                                    v-if="obj.url"
                                    :src="obj.url"
                                    preset="prod_thumb"
                                    :alt="obj.alt_text" />
                            </span>
                        </fig-overlay>
                    </fig-td>

                    <!-- alt text -->
                    <fig-td class="align-middle">
                        <fig-form-input
                            v-model="obj.alt_text"
                            class="w-full"
                            placeholder="Image alt text"
                            @input="emitChange" />
                    </fig-td>

                    <!-- actions -->
                    <fig-td class="text-center align-middle">
                        <fig-pop-confirm
                            @confirm="onDeleteImage(obj, index)"
                            v-if="!obj.loading">
                            {{ $t('Delete this item?') }}

                            <fig-button
                                slot="reference"
                                variant="plain"
                                dotted
                                icon="trash" />
                        </fig-pop-confirm>
                    </fig-td>
                </tr>
            </draggable>
        </fig-table-simple>


        <fig-modal
            ref="image_preview_modal"
            size="xl">
            <div slot="header"></div>
            <img :src="dialogImageUrl" alt="">
        </fig-modal>
    </div>
</template>

<style lang="scss">
@import "~assets/css/components/_mixins.scss";

.el-upload-list--picture .el-upload-list__item {
    border: 0 !important;
    margin: 5px 0;
    padding: 0;
    height: auto;
}

.ghost {
    opacity: 0.5;
    background: #c8ebfb;
}

.image-row {
    @include flexbox();
    @include flex-direction(column);
}
.image-row-fields {
    @include flexbox();
}
.image-row-handle {
    @include flexbox();
    @include align-items(center);
    @include flex(0 0 30px);
    padding: 2px 5px 2px 0;

    svg {
        cursor: grab;
    }
}
.image-row-pic {
    @include flex(0 0 120px);
    padding: 2px 5px 2px 0;

    img {
        width: 120px;
        max-height: 120px;
    }
}
.image-row-input {
    @include flexbox();
    @include flex(1 1 auto);
    @include align-items(flex-start);
    padding: 2px 5px 2px 0;

    .input-tip {
        font-size: 12px;
        line-height: 12px;
        padding-top: 5px;
    }
}
</style>
