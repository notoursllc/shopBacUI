<script>
import {
    FigButton,
    FigFormInput,
    FigOverlay,
    FigVictoryIcon
} from '@notoursllc/figleaf';

export default {
    name: 'LoginPage',

    layout: 'login',

    components: {
        FigButton,
        FigFormInput,
        FigOverlay,
        FigVictoryIcon
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
            this.loading = true;

            try {
                await this.$api.tenantMembers.login(this.userInfo);

                this.$store.dispatch('ui/login');

                this.$router.push({
                    name: 'product'
                });
            }
            catch(e) {
                this.$store.dispatch('ui/logout');

                this.$errorToast({
                    title: this.$t('Error'),
                    text: e.message
                });
            }

            this.loading = false;
        }
    }
};
</script>

<template>
    <div>

        <div>
            <div class="flex items-center justify-center">
                <fig-victory-icon :width="100" :height="60" fill="#4e4e4f" />
            </div>

            <h2 class="mt-1 text-center text-3xl font-medium text-gray-800">
                Sign in to your account
            </h2>
        </div>

        <fig-overlay :show="loading">
            <form class="mt-8 space-y-4" @submit.prevent="onSubmit">
                <div>
                    <fig-form-input
                        v-model="userInfo.email"
                        :placeholder="$t('Email address')" />
                </div>

                <div>
                    <fig-form-input
                        v-model="userInfo.password"
                        :placeholder="$t('Password')"
                        type="password" />
                </div>

                <div>
                    <fig-button
                        type="submit"
                        variant="primary"
                        icon="lock"
                        size="md"
                        block
                        @click="onSubmit">{{ $t('Sign in') }}</fig-button>
                </div>
            </form>
        </fig-overlay>

    </div>
</template>
