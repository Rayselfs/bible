import Vue from 'vue';
import VueRouter from 'vue-router';
import Bible from '@/views/Bible.vue';
import Slide from '@/views/Slide';

Vue.use(VueRouter);

const routes = [
    {
        path: '/',
        name: 'Bible',
        component: Bible
    },
    {
        path: '/slide',
        name: 'Slide',
        component: Slide
    }
];

const router = new VueRouter({
    mode: 'history',
    routes
});

export default router;
