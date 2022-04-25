import isObject from 'lodash.isobject';

export const state = () => ({
    user: null,
    masterTypes: {},
    taxCodes: []
});


export const mutations = {
    SET_USER (state, user) {
        state.user = user || null;
    },

    MASTER_TYPES: (state, obj) => {
        if(isObject(obj) && obj.hasOwnProperty('object')) {
            state.masterTypes[obj.object] = obj.value;
        }
    },

    TAX_CODES: (state, arr) => {
        if(Array.isArray(arr)) {
            state.taxCodes = arr;
        }
    }
};


export const actions = {
    MASTER_TYPES ({ commit }, obj) {
        commit('MASTER_TYPES', obj);
    },

    TAX_CODES ({ commit }, arr) {
        commit('TAX_CODES', arr);
    }
};


export const getters = {

};
