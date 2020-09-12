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

Vue.config.productionTip = false;

new Vue({
    router,
    render: (h) => h(App)
}).$mount('#app');
