<template>
    <el-container class="bible">
        <el-main class="list">
            <div class="content">
                <div
                    v-for="(item, index) in list"
                    :key="index"
                    :id="'section_' + (index + 1)"
                    class="d-flex text-justify"
                    :style="{ 'font-size': fontSize }"
                >
                    <div>{{ index + 1 }}.</div>
                    <div>{{ item }}</div>
                </div>
            </div>
        </el-main>
        <div v-show="!playStatus" class="layout"></div>
    </el-container>
</template>

<script>
import { bible } from '@/assets/js/bible';
export default {
    created() {
        // 監聽storage
        window.addEventListener('storage', this.localStorageChange);

        window.addEventListener('beforeunload', function() {
            localStorage.setItem('bibleWindowNotification', 0);
        });

        this.setFontSize();
        this.setInfo();

        if (this.info) {
            this.play();
        }
    },
    mounted() {
        if (this.info) {
            this.jumpToSection();
        }

        this.$message({
            showClose: true,
            message: '請將投影視窗拉至第二投影螢幕，並按下 F11 全螢幕',
            duration: 6000
        });
    },
    data: () => ({
        info: null,
        fontSize: '16px',
        list: [],
        playStatus: true
    }),
    methods: {
        /**
         * 設定字體大小
         */
        setFontSize() {
            this.fontSize = localStorage.getItem('slideFontSize')
                ? localStorage.getItem('slideFontSize') + 'px'
                : '50px';
        },
        setInfo() {
            this.info = JSON.parse(localStorage.getItem('bibleSlideInfo'));
        },
        localStorageChange(e) {
            // console.log(e);
            const key = e.key;
            const value = JSON.parse(e.newValue);

            switch (key) {
                case 'bibleSlideInfo':
                    this.setInfo();
                    this.play(value);
                    break;
                case 'biblePlayStatus':
                    this.checkPlayStatus(value);
                    break;
                case 'bibleNowSection':
                    this.controlSection(value);
                    break;
                case 'slideFontSize':
                    this.setFontSize();
                    break;
                default:
                    break;
            }
        },
        /**
         * 檢查播放狀態
         */
        checkPlayStatus(status) {
            this.playStatus = status === 0 ? false : true;
        },
        play() {
            this.list = [];
            for (let index = this.info.alphaSection; index < this.info.omegaSection; index++) {
                this.list.push(bible[index].split(' ')[1]);
            }
        },
        jumpToSection() {
            setTimeout(() => {
                this.controlSection(this.info.section);
            }, 2000);
        },
        controlSection(section) {
            window.location.hash = '#section_' + section;
        }
    }
};
</script>

<style lang="scss" scoped>
.title {
    line-height: 60px;
}

.list {
    height: 100vh !important;
    overflow: hidden;
    scroll-behavior: smooth;
}

.layout {
    position: absolute;
    background-color: #000000;
    width: 100%;
    height: 100vh;
    left: 0;
    top: 0;
}

.content {
    padding-bottom: 100vh;
}
</style>
