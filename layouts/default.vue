<script>
import { mapState } from 'vuex';
import FigIconSprite from '@notoursllc/figleaf/components/icon/FigIconSprite';
import NavigationList from '@/components/navigationList/NavigationList';
import NavigationItem from '@/components/navigationList/NavigationItem';
import NavigationCollapse from '@/components/navigationList/NavigationCollapse';

export default {
    components: {
        FigIconSprite
    },

    computed: {
        ...mapState({
            sidebarOpened: (state) => {
                return state.ui.sidebarOpened;
            }
        }),

        isLoggedIn() {
            return this.$store.state.ui.isAuthenticated;
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

        <div class="sidenav-container">
            <aside class="sidenav" :class="{'sidenav-fixed': $store.state.ui.sidebarOpened}">
                <div class="sidenav-header pt-3">
                    <fig-icon icon="bv-logo" :width="60" style="fill: #fff;" />
                </div>

                <div class="pt-3">
                    <nuxt-link
                        :to="{ name: 'product-list' }"
                        tag="button"
                        class="nav-btn font-bold focus:outline-none focus:shadow-outline">{{ $t('Products') }}</nuxt-link>

                    <div class="pl-3">
                        <nuxt-link
                            :to="{ name: 'product-types' }"
                            tag="button"
                            class="nav-btn focus:outline-none focus:shadow-outline">{{ $t('Types') }}</nuxt-link>

                        <nuxt-link
                            :to="{ name: 'product-sub-types' }"
                            tag="button"
                            class="nav-btn focus:outline-none focus:shadow-outline">{{ $t('Sub-Types') }}</nuxt-link>

                        <nuxt-link
                            :to="{ name: 'product-fit-types' }"
                            tag="button"
                            class="nav-btn focus:outline-none focus:shadow-outline">{{ $t('Fit Types') }}</nuxt-link>

                        <nuxt-link
                            :to="{ name: 'product-sales-channel-types' }"
                            tag="button"
                            class="nav-btn focus:outline-none focus:shadow-outline">{{ $t('Sales Channels') }}</nuxt-link>

                        <nuxt-link
                            :to="{ name: 'product-vendors' }"
                            tag="button"
                            class="nav-btn focus:outline-none focus:shadow-outline">{{ $t('Vendors') }}</nuxt-link>

                        <nuxt-link
                            :to="{ name: 'product-collections' }"
                            tag="button"
                            class="nav-btn focus:outline-none focus:shadow-outline">{{ $t('Collections') }}</nuxt-link>

                        <nuxt-link
                            :to="{ name: 'product-datatables-list' }"
                            tag="button"
                            class="nav-btn focus:outline-none focus:shadow-outline">{{ $t('Data Tables') }}</nuxt-link>

                        <nuxt-link
                            :to="{ name: 'product-accent-messages-list' }"
                            tag="button"
                            class="nav-btn focus:outline-none focus:shadow-outline">{{ $t('Accent Messages') }}</nuxt-link>
                    </div>

                    <nuxt-link
                        :to="{ name: 'order-list' }"
                        tag="button"
                        class="nav-btn font-bold focus:outline-none focus:shadow-outline">{{ $t('Payments') }}</nuxt-link>


                    <nuxt-link
                        :to="{ name: 'reports' }"
                        tag="button"
                        class="nav-btn font-bold focus:outline-none focus:shadow-outline">{{ $t('Reports') }}</nuxt-link>


                </div>
            </aside>

            <div
                class="sidenav-overlay"
                v-if="$store.state.ui.sidebarOpened"
                @click="$store.dispatch('ui/closeSidebar')"></div>
        </div>

        <header role="banner" class="header" :class="{'sidenav-opened': $store.state.ui.sidebarOpened}">
            <div class="header-container">
                <i class="text-gray-500 text-xl cursor-pointer"
                   aria-hidden="true"
                   @click="$store.dispatch('ui/toggleSidebar')">toggle sidebar</i>

                <nav class="navigation">
                    <ul class="navigation-list">
                        <li v-if="!isLoggedIn">
                            <!-- <template v-if="$auth.loggedIn">
                                {{ $auth.user.email }}
                                <el-button
                                    type="text"
                                    @click="logout"
                                    class="text-black">{{ $t('LOGOUT') }}</el-button>
                            </template> -->
                            <!-- <template v-else> -->
                                <nuxt-link
                                    :to="{ name: 'tenantmember-login' }"
                                    tag="a">{{ $t('Login') }}</nuxt-link>
                            <!-- </template> -->
                        </li>
                        <li v-else>
                            <a @click="logout">Logout</a>
                        </li>
                    </ul>
                </nav>
            </div>
        </header>

        <main :class="{'sidenav-opened': $store.state.ui.sidebarOpened}">
            <div class="mainContent">
                <nuxt />
            </div>
        </main>
    </div>
</template>

<style lang="postcss">
.nav-btn {
    @apply text-white text-sm px-3 py-2 rounded-md block w-full text-left;
}
</style>

<style lang="scss">
$sidenav-width: 225px;
$header-height: 50px;

@import "~assets/css/components/_variables.scss";
@import "~assets/css/components/_mixins.scss";
@import "~assets/css/components/_sidenav.scss";


.layoutContainer {
    header, main {
        transition: .5s;
    }

    .mainContent {
        padding: 20px 20px 100px 20px; // need some bottom padding to accommodate FAB buttons
    }

    .header {
        background-color: #fff;
        position: relative;
        color: #333;
        line-height: $header-height;
    }

    .header-container {
        @include flexbox();
        @include flex-wrap(nowrap);
        @include flex-direction(row);
        padding: 0 20px;
    }

    .navigation {
        background-color: white;
        padding: 0;
        color: #010101;
        width: auto;
        @include order(2);
        @include flex-grow(2);
        @include align-items(center);
        @include justify-content(flex-end);
        @include flexbox();
    }
}


.nav-menu-bar-container {
    > .nav-navigation-item > label {
        font-weight: 700;
    }
}

.nav-menu-bar {
    border: 0;
    list-style: none;
    position: relative;
    margin: 0;
    padding: 0;
    display: block;

    .nav-navigation-item {
        list-style: none;
        margin: 0;
        padding: 0;

        label * {
            vertical-align: middle;
        }

        label {
            height: 30px;
            line-height: 30px;
            padding: 0 20px;
            font-size: 14px;
            position: relative;
            white-space: nowrap;
            cursor: pointer;
            box-sizing: border-box;
            transition: border-color .3s, background-color .3s, color .3s;
            display: block;

            .nav-navigation-item-arrow {
                position: absolute;
                top: 50%;
                right: 20px;
                margin-top: -7px;
                transition: transform .3s;
                font-size: 12px;
                line-height: 1;
                display: inline-block;
            }
        }

        &.not-collapsed > label .nav-navigation-item-arrow {
            transform: rotateZ(180deg);
        }
    }

    .nav-navigation-item > .nav-menu-bar {
        margin-left: 10px;
    }

    label.not-collapsed .nav-navigation-item-arrow {
        transform: rotateZ(180deg);
    }

    .not-collapsed:focus,
    .collapsed:focus {
        outline: none;
    }
}
</style>
