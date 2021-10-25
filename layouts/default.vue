<script>
import { mapState } from 'vuex';
import NavigationList from '@/components/navigationList/NavigationList.vue';
import NavigationItem from '@/components/navigationList/NavigationItem.vue';
import NavigationCollapse from '@/components/navigationList/NavigationCollapse.vue';

import {
    FigIconSprite,
    FigVictoryIcon,
    FigButton
} from '@notoursllc/figleaf';

export default {
    components: {
        FigIconSprite,
        FigVictoryIcon,
        FigButton,
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
                await this.$api.tenant.members.logout();

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
    <div class="flex min-h-screen relative">
        <fig-icon-sprite />
        <fig-toaster />

        <aside
            class="layout-sidenav"
            :class="{'layout-sidenav-opened': sidebarOpened, 'layout-sidenav-closed': !sidebarOpened}">

            <div class="layout-sidenav-toggle" @click="$store.dispatch('ui/toggleSidebar')">
                <button>
                    <fig-icon
                        :icon="sidebarOpened ? 'chevron-left': 'chevron-right'"
                        :width="18"
                        :height="18"
                        :stroke-width="1.5"
                        stroke="#000" />
                </button>
            </div>

            <div class="layout-sidenav-header">
                <!-- logo -->
                <nuxt-link
                    :to="{ name: 'product' }"
                    tag="nav">
                    <fig-victory-icon :width="44" :height="30" fill="#fff" />
                </nuxt-link>
            </div>

            <div class="px-2">
                <navigation-list>
                    <navigation-item :route="{ name: 'product' }">
                        <template v-slot:icon>
                            <fig-icon
                                icon="triangle-square-circle"
                                :width="20"
                                :height="20"
                                stroke="#fff"
                                :stroke-width="1"
                                class="mr-1" />
                        </template>
                        {{ $t('Products') }}
                    </navigation-item>

                    <navigation-collapse :fuzzy-route-match="['reports-']">
                        <template v-slot:icon>
                            <fig-icon
                                icon="chart-bar"
                                :width="20"
                                :height="20"
                                stroke="#fff"
                                :stroke-width="1"
                                class="mr-1" />
                        </template>
                        <template v-slot:label>{{ $t('Reports') }}</template>
                        <navigation-item :route="{ name: 'reports-orders-list' }">{{ $t('Orders') }}</navigation-item>
                    </navigation-collapse>

                    <navigation-collapse :fuzzy-route-match="['global-']">
                        <template v-slot:icon>
                            <fig-icon
                                icon="world"
                                :width="20"
                                :height="20"
                                stroke="#fff"
                                :stroke-width="1"
                                class="mr-1" />
                        </template>
                        <template v-slot:label>{{ $t('Global settings') }}</template>

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
                        <template v-slot:icon>
                            <fig-icon
                                icon="coin"
                                :width="20"
                                :height="20"
                                stroke="#fff"
                                :stroke-width="1"
                                class="mr-1" />
                        </template>
                        {{ $t('Sales Tax Nexus') }}
                    </navigation-item>
                </navigation-list>
            </div>
        </aside>

        <div
            class="layout-sidenav-overlay"
            v-if="sidebarOpened"
            @click="$store.dispatch('ui/toggleSidebar')"></div>


        <!-- main content -->
        <div class="main-content flex-1">
            <!-- header -->
            <div class="flex items-center justify-between px-6 py-3 border-b border-gray-200 shadow-sm bg-white">
                <div class="flex items-center font-bold">{{ pageTitle }}</div>
                <div>
                    <nuxt-link
                        v-if="!isLoggedIn"
                        :to="{ name: 'tenantmember-login' }"
                        tag="a">{{ $t('Login') }}</nuxt-link>

                    <a
                        v-else
                        @click="logout">Logout</a>
                </div>
            </div>


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
    @apply text-blue-100 w-48 inset-y-0 left-0 transform transition duration-200 ease-in-out z-10 relative;
    background: #232b38;
}

.layout-sidenav-toggle {
    @apply flex-shrink-0 w-2 absolute border-l-4 border-transparent h-full;
    transition: border-color .2s ease 0s;
    cursor: ew-resize;
    right: -8px;
    top: 0;
    z-index: 1;
}
.layout-sidenav-toggle:hover {
    @apply border-blue-400;
}
.layout-sidenav-toggle:hover > button {
    @apply bg-blue-500 border-blue-500;
}
.layout-sidenav-toggle > button {
    @apply cursor-pointer bg-white border border-gray-300 rounded-full absolute shadow-sm flex items-center justify-center focus:outline-none;
    top: 58px;
    right: -6px;
    width: 26px;
    height: 26px;
    z-index: 4;
    padding: 0;
    transition: background-color .2s ease 0s;
}
.layout-sidenav-toggle > button svg {
    /* left: -1px; */
    position: relative;
}
.layout-sidenav-toggle:hover svg {
    stroke: #fff;
}

.layout-sidenav-toggle-btn {
    position: absolute;
    top: 50px;
    right: -10px;
}

.layout-sidenav-header {
    @apply flex justify-center items-center bg-purple-600 bg-opacity-40 mb-4 py-2;
    height: 48px;
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


</style>
