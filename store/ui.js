const domainName = 'goBreadVan.com';

// This doens't need to be reactive, so not in state
const messageInstances = [];

export const state = () => ({
    isAuthenticated: false,
    sidebarOpened: true,
    isMobile: false,
    locales: ['en', 'fr'],
    locale: 'en',
    visibleToasts: [],
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

    ADD_MESSAGE_INSTANCE: (state, messageInstance) => {
        messageInstances.push(messageInstance);
    },

    CLOSE_MESSAGE_INSTANCES: (state) => {
        messageInstances.forEach((messageInstance) => {
            messageInstance.close();
        });
    },

    ADD_TOAST: (state, id) => {
        state.visibleToasts.push(id);
    },

    DELETE_TOAST: (state, id) => {
        state.visibleToasts.splice(state.visibleToasts.indexOf(id), 1);
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

    ADD_MESSAGE_INSTANCE: ({ commit }, messageInstance) => {
        commit('ADD_MESSAGE_INSTANCE', messageInstance);
    },

    CLOSE_MESSAGE_INSTANCES: ({ commit }) => {
        commit('CLOSE_MESSAGE_INSTANCES');
    },

    addToast: ({ commit }, id) => {
        commit('ADD_TOAST', id);
    },

    deleteToast: ({ commit }, id) => {
        commit('DELETE_TOAST', id);
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


export const getters = {
    inCheckoutFlow: (state) => {
        return state.inCheckoutFlow;
    }
};
