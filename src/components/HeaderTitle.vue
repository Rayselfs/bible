<template>
    <div class="header-title d-flex">
        <div class="mr-4 cursor-pointer" @click="$store.commit('openMenu')"><fa icon="bars" class="menu title" /></div>
        <div class="title mr-2">
            <img src="@/assets/media/hhc-icon.png" alt="" srcset="" height="40px" />
        </div>
        <div><h4 class="title mb-0">HHC</h4></div>
    </div>
</template>

<script>
export default {
    name: 'header-title'
};
</script>

<style lang="scss" scoped>
@import '@/assets/css/main.scss';

.header-title {
    color: $mainText;
}

.menu {
    font-size: 1.5rem;
}

.title {
    height: 40px;
    line-height: 40px;
}
</style>
