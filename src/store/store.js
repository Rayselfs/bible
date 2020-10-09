/**
 * vuex
 */
import Vue from 'vue';
import Vuex from 'vuex';
Vue.use(Vuex);

export const store = new Vuex.Store({
    state: {
        menuStatus: false
    },
    mutations: {
        openMenu() {
            this.state.menuStatus = !this.state.menuStatus;
        }
    },
    getters: {
        menu: (state) => {
            return state.menuStatus;
        }
    }
});
