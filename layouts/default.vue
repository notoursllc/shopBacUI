<script>
import { mapState } from 'vuex';

import {
    FigIconSprite,
    FigVictoryIcon,
    FigButton,
    FigTooltip
} from '@notoursllc/figleaf';

export default {
    components: {
        FigIconSprite,
        FigVictoryIcon,
        FigButton,
        FigTooltip
    },

    data() {
        return {
            selectedGutter: 'products'
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
        },

        subNavVisible() {
            if (['products', 'global', 'reports'].includes(this.selectedGutter)) {
                if(this.sidebarOpened === false) {
                    return false;
                }
                return true;
            }

            return false;
        },

        canShowHamburger() {
            return ['products', 'global', 'reports'].includes(this.selectedGutter);
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

        onGutterNavClick(item) {
            this.selectedGutter = item;
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
    <div class="flex flex-row h-screen">
        <fig-icon-sprite />
        <fig-toaster />

        <!-- left icon gutter -->
        <div class="gutter">
            <div class="flex flex-col justify-center">

                <!-- logo -->
                <nuxt-link
                    :to="{ name: 'product' }"
                    tag="button"
                    class="gutter-btn-logo"
                    @click.native="onGutterNavClick('products')">
                    <fig-victory-icon :width="44" :height="30" fill="#fff" />
                </nuxt-link>

                <div class="p-2 text-center">
                    <!-- products -->
                    <nuxt-link
                        :to="{ name: 'product' }"
                        tag="button"
                        class="gutter-btn"
                        @click.native="onGutterNavClick('products')">
                        <fig-tooltip placement="right">
                            <fig-icon
                                slot="toggler"
                                icon="triangle-square-circle"
                                :width="28"
                                :height="28"
                                :stroke-width="1.5" />
                            {{ $t('Products') }}
                        </fig-tooltip>
                    </nuxt-link>

                    <!-- master types -->
                    <nuxt-link
                        :to="{ name: 'global' }"
                        tag="button"
                        class="gutter-btn"
                        @click.native="onGutterNavClick('global')">
                        <fig-tooltip placement="right">
                            <fig-icon
                                slot="toggler"
                                icon="world"
                                :width="28"
                                :height="28"
                                :stroke-width="1.5" />
                            {{ $t('Global values') }}
                        </fig-tooltip>
                    </nuxt-link>

                    <!-- payments -->
                    <nuxt-link
                        :to="{ name: 'order-list' }"
                        tag="button"
                        class="gutter-btn"
                        @click.native="onGutterNavClick('payments')">
                        <fig-tooltip placement="right">
                            <fig-icon
                                slot="toggler"
                                icon="credit-card"
                                :width="28"
                                :height="28"
                                :stroke-width="1.5" />
                            {{ $t('Payments') }}
                        </fig-tooltip>
                    </nuxt-link>

                    <!-- reports -->
                    <nuxt-link
                        :to="{ name: 'reports' }"
                        tag="button"
                        class="gutter-btn"
                        @click.native="onGutterNavClick('reports')">
                        <fig-tooltip placement="right">
                            <fig-icon
                                slot="toggler"
                                icon="chart-bar"
                                :width="28"
                                :height="28"
                                :stroke-width="1.5" />
                            {{ $t('Reports') }}
                        </fig-tooltip>
                    </nuxt-link>
                </div>
            </div>
        </div>

        <!-- submenu -->
        <transition name="slide">
            <div
                v-if="subNavVisible"
                class="subnav">

                <template v-if="selectedGutter === 'products'">
                    <div class="subnav-title">{{ $t('Products') }}</div>

                    <div class="mt-5 flex flex-col justify-start text-sm">
                        <nuxt-link
                            :to="{ name: 'product' }"
                            tag="button"
                            class="subnav-btn">{{ $t('Product list') }}</nuxt-link>
                    </div>
                </template>

                <!-- global sub nav -->
                <template v-if="selectedGutter === 'global'">
                    <div class="subnav-title">{{ $t('Global values') }}</div>

                    <div class="mt-5 flex flex-col justify-start text-sm">
                        <nuxt-link
                            :to="{ name: 'global-types' }"
                            tag="button"
                            class="subnav-btn">{{ $t('Types') }}</nuxt-link>

                        <nuxt-link
                            :to="{ name: 'global-sub-types' }"
                            tag="button"
                            class="subnav-btn">{{ $t('Sub-Types') }}</nuxt-link>

                        <nuxt-link
                            :to="{ name: 'global-sales-channel-types' }"
                            tag="button"
                            class="subnav-btn">{{ $t('Sales Channels') }}</nuxt-link>

                        <nuxt-link
                            :to="{ name: 'global-vendors' }"
                            tag="button"
                            class="subnav-btn">{{ $t('Vendors') }}</nuxt-link>

                        <nuxt-link
                            :to="{ name: 'global-collections' }"
                            tag="button"
                            class="subnav-btn">{{ $t('Collections') }}</nuxt-link>

                        <nuxt-link
                            :to="{ name: 'global-gender-types' }"
                            tag="button"
                            class="subnav-btn">{{ $t('Genders') }}</nuxt-link>

                        <nuxt-link
                            :to="{ name: 'global-basic-color-types' }"
                            tag="button"
                            class="subnav-btn">{{ $t('Basic colors') }}</nuxt-link>

                        <nuxt-link
                            :to="{ name: 'global-size-types' }"
                            tag="button"
                            class="subnav-btn">{{ $t('Sizes') }}</nuxt-link>

                        <nuxt-link
                            :to="{ name: 'global-feature-types' }"
                            tag="button"
                            class="subnav-btn">{{ $t('Product features') }}</nuxt-link>

                        <nuxt-link
                            :to="{ name: 'global-fit-types' }"
                            tag="button"
                            class="subnav-btn">{{ $t('Fits') }}</nuxt-link>

                        <nuxt-link
                            :to="{ name: 'global-sleeve-length-types' }"
                            tag="button"
                            class="subnav-btn">{{ $t('Sleeve length') }}</nuxt-link>

                        <nuxt-link
                            :to="{ name: 'global-datatables-list' }"
                            tag="button"
                            class="subnav-btn">{{ $t('Data Tables') }}</nuxt-link>

                        <nuxt-link
                            :to="{ name: 'global-accent-messages-list' }"
                            tag="button"
                            class="subnav-btn">{{ $t('Accent Messages') }}</nuxt-link>

                        <nuxt-link
                            :to="{ name: 'global-color-swatch-types' }"
                            tag="button"
                            class="subnav-btn">{{ $t('Color swatches') }}</nuxt-link>
                    </div>
                </template>


                <!-- reports sub nav -->
                <template v-if="selectedGutter === 'reports'">
                    <div class="subnav-title">{{ $t('Reports') }}</div>

                    <div class="mt-5 flex flex-col justify-start text-sm">
                        <nuxt-link
                            :to="{ name: 'product' }"
                            tag="button"
                            class="subnav-btn">Test report</nuxt-link>
                    </div>
                </template>
            </div>
        </transition>


        <!-- main content -->
        <div class="main-content">
            <!-- header -->
            <div class="flex items-center justify-between px-4 py-3 border-b border-gray-200 shadow-sm bg-white">
                <div class="flex items-center">
                    <!-- hamburger -->
                    <fig-button
                        v-if="canShowHamburger"
                        variant="plain"
                        :icon="subNavVisible ? 'chevrons-left': 'chevrons-right'"
                        size="sm"
                        class="mr-3"
                        @click="$store.dispatch('ui/toggleSidebar')" />

                    <div class="font-bold">{{ pageTitle }}</div>
                </div>
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
.gutter {
    @apply flex flex-col flex-none w-16;
    background: #232b38;
}

.gutter-btn-logo {
    @apply flex justify-center py-4 w-full bg-purple-700;
}
.gutter-btn {
    @apply flex justify-center rounded p-2 my-2;
}
.gutter-btn.nuxt-link-active,
.gutter-btn.nuxt-link-exact-active {
  background: #3d4f6b;
}

.gutter-btn svg {
    stroke: #c5c7c9;
}
.gutter-btn.nuxt-link-active svg {
    stroke: #fff;
}

.subnav {
    @apply flex-none w-56 px-2 py-4 overflow-y-auto bg-gray-50 border-r border-gray-200;
}
.subnav-title {
    @apply text-base font-bold px-2;
}
.subnav-btn {
    @apply text-left py-1 rounded-sm px-2;
}
.subnav-btn.nuxt-link-exact-active {
    @apply bg-gray-200;
}

.main-content {
    @apply flex-auto bg-gray-50 shadow-lg overflow-auto;
}

.slide-leave-active {
    transition: all .2s ease-out;
}

.slide-enter,
.slide-leave-to {
    width: 0;
    transform: scale(0);
}
.slide-leave,
.slide-enter-to {
    @apply w-56;
    transform: scale(1);
}
.slide-enter-active {
    transition: all .3s ease-in;
}
</style>
