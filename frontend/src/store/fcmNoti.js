function initState() {
    return {
        notiCount: 0,
    }
}

const fcmNotiManagement = {
    state: initState,
    mutations: {
        mutateNotiCount(state, num) {
            state.notiCount = num;
        },
    },
    actions: {
        updateNotiCount(context, num) {
            context.commit('mutateNotiCount', num);
        },
    },
    getters: {
        getNotiCount: state => state.notiCount,
    },
}

export default fcmNotiManagement