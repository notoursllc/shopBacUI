<script>
import {
    FigButton,
    FigOverlay,
    FigModal,
    FigPopConfirm,
    FigBunnyVideoPlayer
} from '@notoursllc/figleaf';

export default {
    name: 'ProductVideoManager',

    props: {
        data: {
            type: Object,
            default: null
        }
    },

    components: {
        FigButton,
        FigOverlay,
        FigModal,
        FigPopConfirm,
        FigBunnyVideoPlayer
    },

    data: function() {
        return {
            // https://help.encoding.com/knowledge-base/article/correct-mime-types-for-serving-video-files/
            videoAccept: 'video/mp4, application/x-mpegURL, video/MP2T, video/quicktime, video/x-ms-wmv, video/3gpp',
            video: {},
            loading: false
        };
    },

    watch: {
        data: {
            handler(newVal) {
                this.video = newVal || {};
            },
            immediate: true
        }
    },

    methods: {
        filesAreVideoTypes(FileList) {
            const acceptedTypes = this.videoAccept.split(',').map((type) => { return type.trim() });
            let isAcceptedType = true;

            for (let i=0; i<FileList.length; i++) {
                if (acceptedTypes.indexOf(FileList[i].type) === -1) {
                    isAcceptedType = false;
                }
            }

            return isAcceptedType;
        },

        async onVideoFileChange(event) {
            // event.target.files is a FileList object
            // https://developer.mozilla.org/en-US/docs/Web/API/FileList
            const files = event.target.files;

            if (!files.length) {
                return;
            }

            try {
                this.loading = true;

                if(!this.filesAreVideoTypes(files)) {
                    throw new Error(this.$t('File type not allowed'));
                }

                const response = await this.$api.media.video.add(files[0]);
                console.log("VID UPLOAD RES", response.data)

                this.video = {
                    ...response.data
                }

                this.$emit('upload', this.video)
            }
            catch(e) {
                this.$figleaf.errorToast({
                    title: this.$t('Error'),
                    text: e.message
                });
            }
            finally {
                this.loading = false;
            }
        },

        async onDelete() {
            try {
                this.loading = true;

                await this.$api.media.video.del(this.video.id);
                this.video = {};

                this.$emit('delete', this.video.id)
            }
            catch(e) {
                this.$figleaf.errorToast({
                    title: this.$t('Error'),
                    text: e.message
                });
            }
            finally {
                this.loading = false;
            }
        }
    }
};
</script>


<template>
    <fig-overlay :show="loading">
        <template v-if="video.third_party_id">
            <fig-pop-confirm @confirm="onDelete">
                <fig-button
                    slot="reference"
                    variant="plain"
                    size="sm"
                    icon="trash">{{ $t('Delete video') }}</fig-button>
                    {{ $t('Delete this video?') }}
            </fig-pop-confirm>

            <fig-bunny-video-player
                :video-id="video.third_party_id"
                :video-library-id="video.streamLibraryId" />
        </template>

        <template v-else>
            <input
                v-if="!video.id"
                :accept="videoAccept"
                :multiple="false"
                type="file"
                :placeholder="$t('No file chosen')"
                @input="onVideoFileChange" />
        </template>
    </fig-overlay>
</template>
