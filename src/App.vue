<template>
    <div id="app" class="position-relative" :class="{ 'overflow-hidden': menu }">
        <router-view />
        <div class="position-absolute menu" :class="{ active: menu }">
            <div class="mt-2 pb-2 mb-3 pl-4 menu-border"><header-title></header-title></div>
            <div class="pl-4 pt-2 pb-2 menut-item d-flex cursor-pointer">
                <div class="menu-item-icon">
                    <p class="mb-0 menu-text"><fa icon="bible" class="mr-3" /></p>
                </div>
                <div><p class="mb-0 menu-text">聖經</p></div>
            </div>
            <div class="pl-4 pt-2 pb-2 menut-item d-flex cursor-pointer">
                <div class="menu-item-icon">
                    <p class="mb-0 menu-text"><fa icon="photo-video" class="mr-3" /></p>
                </div>
                <div><p class="mb-0 menu-text">媒體</p></div>
            </div>
            <div class="pl-4 pt-2 pb-2 menut-item d-flex cursor-pointer">
                <div class="menu-item-icon">
                    <p class="mb-0 menu-text"><fa icon="file-powerpoint" class="mr-3" /></p>
                </div>
                <div><p class="mb-0 menu-text">歌詞</p></div>
            </div>
        </div>
        <div class="position-absolute menu-layout" :class="{ active: menu }" @click="$store.commit('openMenu')"></div>
    </div>
</template>

<script>
import { mapGetters } from 'vuex';
import HeaderTitle from '@/components/HeaderTitle';

export default {
    components: {
        HeaderTitle: HeaderTitle
    },
    computed: {
        ...mapGetters(['menu'])
    }
};
</script>

<style lang="scss">
@import '@/assets/css/main.scss';

#app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    color: $mainText;
}
</style>

<style lang="scss" scoped>
@import '@/assets/css/main.scss';

.menu {
    height: 100vh;
    width: 250px;
    left: -250px;
    top: 0;
    z-index: 1000;
    background: $secondBackground;
    -webkit-transition: 0.3s ease-in-out;
    -moz-transition: 0.3s ease-in-out;
    -o-transition: 0.3s ease-in-out;
    transition: 0.3s ease-in-out;
}

.menu.active {
    left: 0px;
}

.menu-layout {
    width: 100%;
    height: 100vh;
    top: 0;
    left: 0;
    z-index: -1;
    background: rgba(0, 0, 0, 0);
    -webkit-transition: 0.3s ease-in-out;
    -moz-transition: 0.3s ease-in-out;
    -o-transition: 0.3s ease-in-out;
    transition: 0.3s ease-in-out;
}

.menu-layout.active {
    background: rgba(0, 0, 0, 0.6);
    z-index: 999;
    display: block;
}

.menu-border {
    border-bottom: 1px solid #666666;
}

.menut-item:hover {
    background: $thirdBackground;
}

.menu-item-icon {
    width: 35px;
}

.menu-text {
    font-size: 1.1rem;
}
</style>
