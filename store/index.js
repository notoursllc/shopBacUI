import isObject from 'lodash.isobject';

export const state = () => ({
    user: null,
    masterTypes: {}
});


export const mutations = {
    SET_USER (state, user) {
        state.user = user || null;
    },

    MASTER_TYPES: (state, obj) => {
        if(isObject(obj) && obj.hasOwnProperty('object')) {
            state.masterTypes[obj.object] = obj.value;
        }
    }
};


export const actions = {
    MASTER_TYPES ({ commit }, obj) {
        commit('MASTER_TYPES', obj);
    }
};


export const getters = {

};
