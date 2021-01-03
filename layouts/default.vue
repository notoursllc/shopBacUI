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
            if (['products', 'reports'].includes(this.selectedGutter)) {
                if(this.sidebarOpened === false) {
                    return false;
                }
                return true;
            }

            return false;
        },

        canShowHamburger() {
            return ['products', 'reports'].includes(this.selectedGutter);
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
        <div class="flex flex-col flex-none w-16 bg-gray-300">
            <div class="flex flex-col justify-center">
                <!-- logo -->
                <nuxt-link
                    :to="{ name: 'product' }"
                    tag="button"
                    class="flex justify-center pb-4 pt-3 w-full"
                    @click.native="onGutterNavClick('products')">
                    <fig-victory-icon :width="44" :height="30" fill="#000" />
                </nuxt-link>

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
                            :width="30"
                            :height="30"
                            :stroke-width="1.5" />
                        {{ $t('Products') }}
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
                            :width="30"
                            :height="30"
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
                            :width="30"
                            :height="30"
                            :stroke-width="1.5" />
                        {{ $t('Reports') }}
                    </fig-tooltip>
                </nuxt-link>
            </div>
        </div>

        <!-- submenu -->
        <transition name="slide">
            <div
                v-if="subNavVisible"
                class="subnav">

                <template v-if="selectedGutter === 'products'">
                    <div class="text-lg font-bold">{{ $t('Products') }}</div>

                    <div class="mt-5 flex flex-col justify-start text-sm">
                        <nuxt-link
                            :to="{ name: 'product' }"
                            tag="button"
                            class="subnav-btn">{{ $t('Product list') }}</nuxt-link>

                        <nuxt-link
                            :to="{ name: 'product-types' }"
                            tag="button"
                            class="subnav-btn">{{ $t('Types') }}</nuxt-link>

                        <nuxt-link
                            :to="{ name: 'product-sub-types' }"
                            tag="button"
                            class="subnav-btn">{{ $t('Sub-Types') }}</nuxt-link>

                        <nuxt-link
                            :to="{ name: 'product-sales-channel-types' }"
                            tag="button"
                            class="subnav-btn">{{ $t('Sales Channels') }}</nuxt-link>

                        <nuxt-link
                            :to="{ name: 'product-vendors' }"
                            tag="button"
                            class="subnav-btn">{{ $t('Vendors') }}</nuxt-link>

                        <nuxt-link
                            :to="{ name: 'product-collections' }"
                            tag="button"
                            class="subnav-btn">{{ $t('Collections') }}</nuxt-link>

                        <nuxt-link
                            :to="{ name: 'product-gender-types' }"
                            tag="button"
                            class="subnav-btn">{{ $t('Gender Types') }}</nuxt-link>

                        <nuxt-link
                            :to="{ name: 'product-basic-color-types' }"
                            tag="button"
                            class="subnav-btn">{{ $t('Basic color types') }}</nuxt-link>

                        <nuxt-link
                            :to="{ name: 'product-feature-types' }"
                            tag="button"
                            class="subnav-btn">{{ $t('Feature types') }}</nuxt-link>

                        <nuxt-link
                            :to="{ name: 'product-fit-types' }"
                            tag="button"
                            class="subnav-btn">{{ $t('Fit types') }}</nuxt-link>

                        <nuxt-link
                            :to="{ name: 'product-sleeve-length-types' }"
                            tag="button"
                            class="subnav-btn">{{ $t('Sleeve length types') }}</nuxt-link>

                        <nuxt-link
                            :to="{ name: 'product-datatables-list' }"
                            tag="button"
                            class="subnav-btn">{{ $t('Data Tables') }}</nuxt-link>

                        <nuxt-link
                            :to="{ name: 'product-accent-messages-list' }"
                            tag="button"
                            class="subnav-btn">{{ $t('Accent Messages') }}</nuxt-link>

                        <nuxt-link
                            :to="{ name: 'product-color-swatch-types' }"
                            tag="button"
                            class="subnav-btn">{{ $t('Color swatches') }}</nuxt-link>
                    </div>
                </template>

                <!-- reports sub nav -->
                <template v-if="selectedGutter === 'reports'">
                    <div class="text-lg font-bold">{{ $t('Reports') }}</div>

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
        <div class="flex-auto bg-white shadow-lg overflow-auto">
            <!-- header -->
            <div class="flex items-center justify-between px-4 py-3 border-b border-gray-200 shadow-sm">
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
.gutter-btn {
    @apply flex justify-center py-4 w-full;
}
.gutter-btn.nuxt-link-active,
.gutter-btn.nuxt-link-exact-active {
  @apply bg-gray-100;
}

.subnav {
    @apply flex-none w-56 bg-gray-100 px-4 py-4 overflow-y-auto;
}
.subnav-btn {
    @apply text-left py-1;
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
