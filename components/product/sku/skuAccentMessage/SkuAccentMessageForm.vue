<script>
export default {
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
                this.data = await this.$api.productSkuAccentMessages.get(this.id);
            }
            catch(e) {
                this.$errorToast(e.message);
            }
        },

        async onFormSave() {
            try {
                const response = await this.$api.productSkuAccentMessages.upsert(this.data);

                if(!response) {
                    throw new Error(this.$t('Error updating item'));
                }

                const title = this.id ? this.$t('Item updated successfully') : this.$t('Item added successfully');
                this.$successToast(title);
                this.$emit('success');
            }
            catch(e) {
                this.$errorToast(e.message);
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
                <b-form-input
                    v-model="data.message" />
            </span>
        </div>

        <!-- buttons -->
        <div class="formRow">
            <label></label>
            <span class="ptl">
                <b-button
                    variant="primary"
                    @click="onFormSave">{{ $t('Save') }}</b-button>
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
