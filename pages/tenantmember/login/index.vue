<script>
import {
    FigButton,
    FigFormInput,
    FigOverlay
} from '@notoursllc/figleaf';

export default {
    name: 'LoginPage',

    components: {
        FigButton,
        FigFormInput,
        FigOverlay
    },

    data() {
        return {
            loading: false,
            userInfo: {
                email: null,
                password: null
            }
        };
    },

    methods: {
        async onSubmit() {
            try {
                await this.$api.tenantMembers.login(this.userInfo);

                this.$store.dispatch('ui/login');

                this.$router.push({
                    name: 'product-list'
                });
            }
            catch(e) {
                this.$store.dispatch('ui/logout');

                this.$errorToast({
                    title: this.$t('Error'),
                    text: e.message
                });
            }
        }
    }
};
</script>

<template>
    <div>
        <h1>Login</h1>

        <fig-overlay :show="loading">
            <form @submit.prevent>
                <!-- email -->
                <div class="inputGroup mr-5 mb-3">
                    <label>{{ $t('Email address') }}</label>
                    <fig-form-input
                        v-model="userInfo.email" />
                </div>

                <!-- password -->
                <div class="inputGroup mr-5 mb-3">
                    <label>{{ $t('Password') }}</label>
                    <!-- TODO: create password input component -->
                    <fig-form-input
                        v-model="userInfo.password"
                        type="password" />
                </div>

                <fig-button
                    variant="primary"
                    @click="onSubmit">{{ $t('Submit') }}</fig-button>
            </form>
        </fig-overlay>
    </div>
</template>


<style lang="scss" scoped>
@import "~assets/css/components/_formRow.scss";
</style>
