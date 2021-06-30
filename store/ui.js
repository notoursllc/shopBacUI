export const state = () => ({
    isAuthenticated: false,
    sidebarOpened: true,
    isMobile: false,
    locales: ['en', 'fr'],
    locale: 'en',
    pageTitle: null
});

export const mutations = {
    CLOSE_SIDEBAR: (state) => {
        state.sidebarOpened = false;
    },

    OPEN_SIDEBAR: (state) => {
        state.sidebarOpened = true;
    },

    TOGGLE_SIDEBAR: (state) => {
        state.sidebarOpened = !state.sidebarOpened;
    },

    LOCATION_CHANGE: (state) => {
        state.sidebarOpened = false;
    },

    WINDOW_RESIZE: (state) => {
        const { innerWidth } = window;
        const isDesktop = innerWidth > 1024;
        state.isMobile = !isDesktop;
        // state.sidebarOpened = isDesktop;
    },

    SET_LANG(state, locale) {
        if (state.locales.indexOf(locale) !== -1) {
            state.locale = locale;
        }
    },

    LOGIN: (state) => {
        state.isAuthenticated = true;
    },

    LOGOUT: (state) => {
        state.isAuthenticated = false;
    },

    PAGE_TITLE: (state, title) => {
        state.pageTitle = title;
    }
};

export const actions = {
    openSidebar ({ commit }) {
        commit('OPEN_SIDEBAR');
    },

    closeSidebar ({ commit }) {
        commit('CLOSE_SIDEBAR');
    },

    toggleSidebar ({ commit }) {
        commit('TOGGLE_SIDEBAR');
    },

    windowResize ({ commit }) {
        commit('WINDOW_RESIZE');
    },

    login({ commit }) {
        commit('LOGIN');
    },

    logout({ commit }) {
        commit('LOGOUT');
    },

    title({ commit }, title) {
        commit('PAGE_TITLE', title);
    }
};