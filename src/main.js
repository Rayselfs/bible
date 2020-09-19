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
import 'element-ui/lib/theme-chalk/index.css';
import {
    Select,
    Option,
    Button,
    Container,
    Header,
    Aside,
    Main,
    Footer,
    Tabs,
    TabPane,
    Slider,
    Input,
    Dropdown,
    DropdownMenu,
    DropdownItem,
    Tooltip,
    Popover
} from 'element-ui';
Vue.use(Select);
Vue.use(Option);
Vue.use(Button);
Vue.use(Container);
Vue.use(Header);
Vue.use(Aside);
Vue.use(Main);
Vue.use(Footer);
Vue.use(Tabs);
Vue.use(TabPane);
Vue.use(Slider);
Vue.use(Input);
Vue.use(Dropdown);
Vue.use(DropdownMenu);
Vue.use(DropdownItem);
Vue.use(Tooltip);
Vue.use(Popover);

/**
 * axios
 */
import axios from 'axios';
import VueAxios from 'vue-axios';
Vue.use(VueAxios, axios);

Vue.config.productionTip = false;

Vue.config.errorHandler = function(err) {
    axios
        .post(
            '/services/T01BD3XG34H/B01B0M4C8EP/tVmlOr2VDHXL4W0yjYi06kzG',
            {
                username: '聖經系統-錯誤',
                text: JSON.stringify(err)
            },
            {
                baseURL: 'https://hooks.slack.com',
                headers: { 'Content-type': 'application/x-www-form-urlencoded' }
            }
        )
        .catch((err) => {
            console.error(err);
        });
};

new Vue({
    router,
    render: (h) => h(App)
}).$mount('#app');
