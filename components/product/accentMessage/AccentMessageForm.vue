<script>
import {
    FigButton,
    FigFormInput
} from '@notoursllc/figleaf';

export default {
    components: {
        FigButton,
        FigFormInput
    },

    props: {
        id: {
            type: String,
            default: null
        }
    },

    data() {
        return {
            data: {}
        };
    },

    watch: {
        id: {
            handler(newVal) {
                if(newVal) {
                    this.fetchData();
                }
            },
            immediate: true
        }
    },

    methods: {
        async fetchData() {
            try {
                this.data = await this.$api.productAccentMessages.get(this.id);
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
                const response = await this.$api.productAccentMessages.upsert(this.data);

                if(!response) {
                    throw new Error(this.$t('Error updating item'));
                }

                this.$figleaf.successToast({
                    title: this.$t('Success'),
                    text: this.id ? this.$t('Item updated successfully') : this.$t('Item added successfully')
                });

                this.$emit('success');
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
    <form>
        <!-- Name -->
        <div class="formRow">
            <label>{{ $t('Accent Message') }}:</label>
            <span>
                <fig-form-input
                    v-model="data.message" />
            </span>
        </div>

        <!-- buttons -->
        <div class="formRow">
            <label></label>
            <span class="pt-5">
                <fig-button
                    variant="primary"
                    @click="onFormSave">{{ $t('Save') }}</fig-button>
            </span>
        </div>
    </form>
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
