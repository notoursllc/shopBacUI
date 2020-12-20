<script>
import { mapState } from 'vuex';
import NavigationList from '@/components/navigationList/NavigationList';
import NavigationItem from '@/components/navigationList/NavigationItem';
import NavigationCollapse from '@/components/navigationList/NavigationCollapse';

import {
    FigIconSprite,
    FigVictoryIcon,
    FigButton
} from '@notoursllc/figleaf';

export default {
    components: {
        FigIconSprite,
        FigVictoryIcon,
        FigButton
    },

    computed: {
        ...mapState({
            sidebarOpened: (state) => {
                return state.ui.sidebarOpened;
            }
        }),

        isLoggedIn() {
            return this.$store.state.ui.isAuthenticated;
        },

        pageTitle() {
            return this.$store.state.ui.pageTitle;
        }
    },

    watch: {
        $route() {
            this.$store.dispatch('ui/CLOSE_MESSAGE_INSTANCES');
        }
    },

    mounted() {
        if (process.browser) {
            window.addEventListener('resize', this.handleResize);
        }
    },

    destroyed () {
        if (process.browser) {
            window.removeEventListener('resize', this.handleResize);
        }
    },

    methods: {
        handleResize() {
            this.$store.dispatch('ui/windowResize');
        },

        menuItemClick() {
            if(this.$store.state.ui.isMobile) {
                this.$store.dispatch('ui/closeSidebar');
            }
        },

        async logout() {
            try {
                await this.$api.tenantMembers.logout();

                this.$store.dispatch('ui/logout');

                this.$router.push({
                    name: 'tenantmember-login'
                });
            }
            catch(e) {
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
    <div class="layoutContainer">
        <fig-icon-sprite />
        <fig-toaster />

        <div class="h-full">
            <aside
                class="sidenav border-r border-white fixed m-0 left-0 top-0 h-full p-2 overflow-y-auto z-10 duration-500 text-gray-50 bg-gray-500 font-semibold"
                :class="{'sidenav-fixed': $store.state.ui.sidebarOpened}">
                <div class="flex items-center justify-center">
                    <fig-victory-icon :width="60" :height="40" fill="#fff" />
                </div>

                <div class="pt-3">
                    <nuxt-link
                        :to="{ name: 'product' }"
                        tag="button"
                        class="nav-btn font-bold">
                        <fig-icon icon="triangle-square-circle" :width="22" :height="22" :stroke-width="1" stroke="#fff" />{{ $t('Products') }}
                    </nuxt-link>

                    <div class="pl-3">
                        <nuxt-link
                            :to="{ name: 'product-types' }"
                            tag="button"
                            class="nav-btn">{{ $t('Types') }}</nuxt-link>

                        <nuxt-link
                            :to="{ name: 'product-sub-types' }"
                            tag="button"
                            class="nav-btn">{{ $t('Sub-Types') }}</nuxt-link>

                        <nuxt-link
                            :to="{ name: 'product-sales-channel-types' }"
                            tag="button"
                            class="nav-btn">{{ $t('Sales Channels') }}</nuxt-link>

                        <nuxt-link
                            :to="{ name: 'product-vendors' }"
                            tag="button"
                            class="nav-btn">{{ $t('Vendors') }}</nuxt-link>

                        <nuxt-link
                            :to="{ name: 'product-collections' }"
                            tag="button"
                            class="nav-btn">{{ $t('Collections') }}</nuxt-link>

                        <nuxt-link
                            :to="{ name: 'product-gender-types' }"
                            tag="button"
                            class="nav-btn">{{ $t('Gender Types') }}</nuxt-link>

                        <nuxt-link
                            :to="{ name: 'product-basic-color-types' }"
                            tag="button"
                            class="nav-btn">{{ $t('Basic color types') }}</nuxt-link>

                        <nuxt-link
                            :to="{ name: 'product-feature-types' }"
                            tag="button"
                            class="nav-btn">{{ $t('Feature types') }}</nuxt-link>

                        <nuxt-link
                            :to="{ name: 'product-fit-types' }"
                            tag="button"
                            class="nav-btn">{{ $t('Fit types') }}</nuxt-link>

                        <nuxt-link
                            :to="{ name: 'product-sleeve-length-types' }"
                            tag="button"
                            class="nav-btn">{{ $t('Sleeve length types') }}</nuxt-link>

                        <nuxt-link
                            :to="{ name: 'product-datatables-list' }"
                            tag="button"
                            class="nav-btn">{{ $t('Data Tables') }}</nuxt-link>

                        <nuxt-link
                            :to="{ name: 'product-accent-messages-list' }"
                            tag="button"
                            class="nav-btn">{{ $t('Accent Messages') }}</nuxt-link>

                        <nuxt-link
                            :to="{ name: 'product-color-swatch-types' }"
                            tag="button"
                            class="nav-btn">{{ $t('Color swatches') }}</nuxt-link>
                    </div>

                    <nuxt-link
                        :to="{ name: 'order-list' }"
                        tag="button"
                        class="nav-btn font-bold">
                        <fig-icon icon="credit-card" :width="22" :height="22" :stroke-width="1" stroke="#fff" />{{ $t('Payments') }}
                    </nuxt-link>


                    <nuxt-link
                        :to="{ name: 'reports' }"
                        tag="button"
                        class="nav-btn font-bold">
                        <fig-icon icon="chart-bar" :width="22" :height="22" :stroke-width="1" stroke="#fff" />{{ $t('Reports') }}
                    </nuxt-link>
                </div>
            </aside>

            <div
                class="sidenav-overlay z-10 fixed inset-0 opacity-0 md:opacity-100 h-screen hidden bg-gray-700 bg-opacity-25"
                v-if="$store.state.ui.sidebarOpened"
                @click="$store.dispatch('ui/closeSidebar')"></div>
        </div>

        <header
            role="banner"
            class="header flex flex-row flex-nowrap w-full px-6 py-3 bg-white relative text-gray-700 border-b border-gray-200"
            :class="{'sidenav-opened': $store.state.ui.sidebarOpened}">
            <fig-button
                v-if="!$store.state.ui.sidebarOpened"
                :aria-hidden="!$store.state.ui.sidebarOpened"
                variant="plain"
                icon="chevrons-right"
                size="sm"
                class="mr-2"
                @click="$store.dispatch('ui/toggleSidebar')" />

            <div class="pl-5 max-w-md truncate">{{ pageTitle }}</div>

            <nav class="navigation p-0 flex flex-grow items-center justify-end">
                <ul class="navigation-list">
                    <li v-if="!isLoggedIn">
                        <nuxt-link
                            :to="{ name: 'tenantmember-login' }"
                            tag="a">{{ $t('Login') }}</nuxt-link>
                    </li>
                    <li v-else>
                        <a @click="logout">Logout</a>
                    </li>
                </ul>
            </nav>
        </header>

        <main :class="{'sidenav-opened': $store.state.ui.sidebarOpened}">
            <div class="pt-5 lg:px-10 md:px-6 sm:px-4 pb-24">
                <nuxt />
            </div>
        </main>
    </div>
</template>

<style lang="postcss">
.nav-btn {
    @apply text-sm px-3 py-2 rounded-md w-full text-left flex flex-row items-center;
}
.nav-btn > svg {
    @apply mr-1;
}
.nav-btn:focus {
    @apply outline-none shadow-outline
}

.nav-btn.nuxt-link-active,
.nav-btn.nuxt-link-exact-active {
  @apply text-white bg-pink-700 shadow-inner;
}
</style>

<style lang="postcss" scoped>

</style>



<style lang="scss">
$sidenav-width: 225px;
$header-height: 50px;

@import "~assets/css/components/_variables.scss";
@import "~assets/css/components/_mixins.scss";


.layoutContainer header,
.layoutContainer main {
    transition: .5s;
}

@media #{$large-and-up} {
    .sidenav-opened {
        padding-left: $sidenav-width;
        transition: .5s;
    }
}

.sidenav {
    width: $sidenav-width;
    transform: translateX(-105%);
}

.sidenav-fixed {
    transform: translateX(0);
    transition: .5s;
}

// Fixed Sidenav hide on smaller
@media #{$medium-and-down} {
    .sidenav.sidenav-fixed {
        // transform: translateX(-105%);
        z-index: 999;
    }

    .sidenav-overlay {
        opacity: 1;
        display: block;
    }
}

</style>
