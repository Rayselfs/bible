import Vue from 'vue';
import App from './App.vue';
import router from './router';

import '@/assets/css/main.scss';

/**
 * bootstrap-vue
 */
import BootstrapVue from 'bootstrap-vue';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';
Vue.use(BootstrapVue);

/**
 * vue animate
 */
import 'vue2-animate/dist/vue2-animate.min.css';

/**
 * element-ui
 */
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';

Vue.use(ElementUI);

/**
 * axios
 */
import axios from 'axios';
import VueAxios from 'vue-axios';
Vue.use(VueAxios, axios);

import { library } from '@fortawesome/fontawesome-svg-core';
import { faFolder, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

library.add(faFolder, faEdit, faTrash);

Vue.component('fa', FontAwesomeIcon);

Vue.config.productionTip = false;

Vue.config.errorHandler = function(err) {
    if (process.env.NODE_ENV === 'development') {
        console.error(err.message);
    } else {
        axios
            .post(
                '/services/T01BD3XG34H/B01B0M4C8EP/tVmlOr2VDHXL4W0yjYi06kzG',
                {
                    username: '聖經系統-錯誤',
                    text: err.message
                },
                {
                    baseURL: 'https://hooks.slack.com',
                    headers: { 'Content-type': 'application/x-www-form-urlencoded' }
                }
            )
            .catch((err) => {
                console.error(err);
            });
    }
};

new Vue({
    router,
    render: (h) => h(App)
}).$mount('#app');
