// export default ($http) => ({

//     async add(userData) {
//         const { data } = await $http.$post('/tenant/member', userData);
//         return data;
//     },

//     async login(userData) {
//         const { data } = await $http.$post('/tenant/member/login', userData, {withCredentials: true});
//         return data;
//     },

//     async logout() {
//         const { data } = await $http.$post('/tenant/member/logout');
//         return data;
//     }

// });

export default ($axios) => ({

    async add(userData) {
        const { data } = await $axios.$post('/tenant/member', userData);
        return data;
    },

    async login(userData) {
        const { data } = await $axios.$post('/tenant/member/login', userData);
        return data;
    },

    // async login(userData) {
    //     const { data } = await $axios.post('/tenant/member/login', userData, {
    //         withCredentials: true
    //     });
    //     return data;
    // },

    async logout() {
        const { data } = await $axios.$post('/tenant/member/logout');
        return data;
    }

});
