<script>
import { mapState } from 'vuex';
import NavigationList from '@/components/navigationList/NavigationList.vue';
import NavigationItem from '@/components/navigationList/NavigationItem.vue';
import NavigationCollapse from '@/components/navigationList/NavigationCollapse.vue';

import {
    FigIconSprite,
    FigVictoryIcon,
} from '@notoursllc/figleaf';

export default {
    components: {
        FigIconSprite,
        FigVictoryIcon,
        NavigationList,
        NavigationItem,
        NavigationCollapse
    },

    data() {
        return {
        };
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
            this.$figleaf.clearToasts();
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
                await this.$api.tenant.member.logout();

                this.$store.dispatch('ui/logout');

                this.$router.push({
                    name: 'tenantmember-login'
                });
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
    <div class="flex min-h-screen relative text-sm">
        <fig-icon-sprite />
        <fig-toaster />

        <aside
            class="layout-sidenav"
            :class="{'layout-sidenav-opened': sidebarOpened, 'layout-sidenav-closed': !sidebarOpened}">

            <div class="layout-sidenav-toggle" @click="$store.dispatch('ui/toggleSidebar')"></div>

            <div class="layout-sidenav-content">
                <div class="layout-sidenav-header">
                    <!-- logo -->
                    <nuxt-link
                        :to="{ name: 'product' }"
                        tag="nav">
                        <fig-victory-icon :width="50" :height="35" fill="#4f46e4" />
                    </nuxt-link>
                </div>

                <div class="grow px-2">
                    <navigation-list text-color="#484747">
                        <navigation-item :route="{ name: 'product' }">
                            <!-- <template v-slot:icon>
                                <fig-icon
                                    icon="triangle-square-circle"
                                    :width="22"
                                    :height="22"
                                    stroke="#444242"
                                    :stroke-width="1.5"
                                    class="mr-1" />
                            </template> -->
                            <span class="nav-item-main">{{ $t('Products') }}</span>
                        </navigation-item>

                        <navigation-item :route="{ name: 'hero-list' }">
                            <!-- <template v-slot:icon>
                                <fig-icon
                                    icon="coin"
                                    :width="22"
                                    :height="22"
                                    stroke="#444242"
                                    :stroke-width="1.5"
                                    class="mr-1" />
                            </template> -->
                            <span class="nav-item-main">{{ $t('Hero slides') }}</span>
                        </navigation-item>

                        <navigation-collapse :fuzzy-route-match="['reports-']">
                            <!-- <template v-slot:icon>
                                <fig-icon
                                    icon="chart-bar"
                                    :width="22"
                                    :height="22"
                                    stroke="#444242"
                                    :stroke-width="1.5"
                                    class="mr-1" />
                            </template> -->
                            <template v-slot:label>
                                <span class="nav-item-main">{{ $t('Reports') }}</span>
                            </template>
                            <navigation-item :route="{ name: 'reports-orders-list' }">{{ $t('Orders') }}</navigation-item>
                        </navigation-collapse>

                        <navigation-collapse :fuzzy-route-match="['global-']">
                            <!-- <template v-slot:icon>
                                <fig-icon
                                    icon="world"
                                    :width="22"
                                    :height="22"
                                    stroke="#444242"
                                    :stroke-width="1.5"
                                    class="mr-1" />
                            </template> -->
                            <template v-slot:label>
                                <span class="nav-item-main">{{ $t('Global settings') }}</span>
                            </template>

                            <navigation-item :route="{ name: 'global-types' }">{{ $t('Types') }}</navigation-item>
                            <navigation-item :route="{ name: 'global-sub-types' }">{{ $t('Sub-Types') }}</navigation-item>
                            <navigation-item :route="{ name: 'global-sales-channel-types' }">{{ $t('Sales Channels') }}</navigation-item>
                            <navigation-item :route="{ name: 'global-vendors' }">{{ $t('Vendors') }}</navigation-item>
                            <navigation-item :route="{ name: 'global-collections' }">{{ $t('Collections') }}</navigation-item>
                            <navigation-item :route="{ name: 'global-gender-types' }">{{ $t('Genders') }}</navigation-item>
                            <navigation-item :route="{ name: 'global-basic-color-types' }">{{ $t('Basic colors') }}</navigation-item>
                            <navigation-item :route="{ name: 'global-size-types' }">{{ $t('Sizes') }}</navigation-item>
                            <navigation-item :route="{ name: 'global-feature-types' }">{{ $t('Product features') }}</navigation-item>
                            <navigation-item :route="{ name: 'global-fit-types' }">{{ $t('Fits') }}</navigation-item>
                            <navigation-item :route="{ name: 'global-sleeve-length-types' }">{{ $t('Sleeve length') }}</navigation-item>
                            <navigation-item :route="{ name: 'global-accent-messages-list' }">{{ $t('Accent Messages') }}</navigation-item>
                            <navigation-item :route="{ name: 'global-color-swatch-types' }">{{ $t('Color swatches') }}</navigation-item>
                            <navigation-item :route="{ name: 'global-package-types' }">{{ $t('Package types') }}</navigation-item>
                        </navigation-collapse>

                        <navigation-item :route="{ name: 'tax-nexus-list' }">
                            <!-- <template v-slot:icon>
                                <fig-icon
                                    icon="coin"
                                    :width="22"
                                    :height="22"
                                    stroke="#444242"
                                    :stroke-width="1.5"
                                    class="mr-1" />
                            </template> -->
                            <span class="nav-item-main">{{ $t('Sales Tax Nexus') }}</span>
                        </navigation-item>
                    </navigation-list>
                </div>

                <!-- sidenav footer -->
                <div class="flex items-center p-2" :class="{'justify-center': !sidebarOpened, 'justify-end': sidebarOpened}">
                    <button
                        class="layout-sidenav-toggle-button"
                        @click="$store.dispatch('ui/toggleSidebar')">
                        <fig-icon
                            :icon="sidebarOpened ? 'chevrons-left': 'chevrons-right'"
                            :width="30"
                            :height="30"
                            :stroke-width="1.5" />
                    </button>
                </div>
            </div>
        </aside>

        <div
            class="layout-sidenav-overlay"
            v-if="sidebarOpened"
            @click="$store.dispatch('ui/toggleSidebar')"></div>


        <!-- main content -->
        <div class="main-content flex-1">
            <!-- header -->
            <header class="layout-header">
                <div class="flex items-center font-semibold text-base">{{ pageTitle }}</div>
                <div>
                    <nuxt-link
                        v-if="!isLoggedIn"
                        :to="{ name: 'tenantmember-login' }"
                        tag="a">{{ $t('Login') }}</nuxt-link>

                    <a
                        v-else
                        @click="logout">Logout</a>
                </div>
            </header>

            <div class="w-full">
                <div class="md:p-6 sm:p-4">
                    <nuxt />
                </div>
            </div>
        </div>
    </div>
</template>


<style lang="postcss">
.layout-sidenav {
    @apply text-gray-700 w-48 inset-y-0 left-0 transform transition duration-200 ease-in-out z-10 relative border-r border-gray-300 shrink-0;
    background: #f3f4f6;
}

.layout-sidenav-toggle {
    @apply shrink-0 w-2 absolute border-l-4 border-transparent h-full;
    transition: border-color .2s ease 0s;
    cursor: ew-resize;
    right: -8px;
    top: 0;
    z-index: 1;
}
.layout-sidenav-toggle:hover {
    @apply border-blue-400;
}

.layout-sidenav-toggle-button {
    @apply rounded p-1;
}
.layout-sidenav-toggle-button:hover {
    @apply bg-gray-200;
}

.layout-sidenav-header {
    @apply flex justify-center items-center bg-opacity-40 mb-4 py-2;
    height: 48px;
}

.layout-sidenav-content {
    @apply flex flex-col h-full grow;
}

.layout-sidenav-overlay {
    @apply fixed inset-0 bg-gray-500 bg-opacity-50 transition-opacity md:hidden;
}

.layout-sidenav-opened {
    @apply absolute translate-x-0 md:relative;
}

.layout-sidenav-closed {
    /* @apply absolute -translate-x-full md:relative md:translate-x-0; */
    /* @apply absolute -translate-x-full; */
    @apply absolute;
    transform: translateX(-94%);
}

.layout-header {
    @apply flex items-center justify-between px-6 py-3;
}

.navigation-item {
    @apply text-xs;
}
.navigation-item .nav-item-main {
    @apply font-semibold uppercase;
}
</style>
