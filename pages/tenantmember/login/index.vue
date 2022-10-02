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

    computed: {
        buttonIsEnabled() {
            return this.userInfo.email?.trim().length && this.userInfo.password?.trim().length;
        }
    },

    methods: {
        async onSubmit() {
            try {
                this.loading = true;

                const response = await this.$api.tenant.member.login(this.userInfo);

                if(!response) {
                    throw new Error('Unauthorized');
                }

                await this.$store.dispatch('ui/login');

                this.$router.push({
                    name: 'reports-orders-list'
                });

                this.$figleaf.clearToasts();
            }
            catch(e) {
                await this.$store.dispatch('ui/logout');

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
    <div>

        <div>
            <div class="flex items-center justify-center">
                <fig-victory-icon :width="100" :height="60" fill="#4e4e4f" />
            </div>
        </div>

        <fig-overlay :show="loading">
            <form class="mt-4 space-y-4" @submit.prevent="onSubmit">
                <div>
                    <fig-form-input
                        v-model="userInfo.email"
                        :placeholder="$t('Email address')"
                        type="email"
                        size="lg" />
                </div>

                <div>
                    <fig-form-input
                        v-model="userInfo.password"
                        :placeholder="$t('Password')"
                        type="password"
                        :autocomplete="false"
                        size="lg" />
                </div>

                <div>
                    <fig-button
                        type="submit"
                        variant="primary"
                        icon="lock"
                        size="md"
                        block
                        :disabled="!buttonIsEnabled"
                        @click="onSubmit">{{ $t('Sign in') }}</fig-button>
                </div>
            </form>
        </fig-overlay>

    </div>
</template>
