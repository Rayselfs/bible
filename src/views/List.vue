<template>
    <el-container class="bible position-relative">
        <el-header class="d-flex justify-content-center bible-wrapper">
            <p class="bible-info mb-0">
                <span class="mr-3">{{ bookName }}</span>
                <span v-show="chapter" class="mr-3">第 {{ chapter }} {{ chapterLabel }}</span>
                <span v-show="section">第 {{ section }} 節</span>
            </p>
        </el-header>
        <el-container>
            <el-main class="list scroll-behavior-smooth">
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
        </el-container>
        <div v-show="!playStatus" class="layout"></div>
    </el-container>
</template>

<script>
import { bible } from '@/assets/js/bible';
import { book } from '@/assets/js/function';
import { collect } from 'collect.js';
export default {
    created() {
        // 監聽storage
        window.addEventListener('storage', this.localStorageChange);

        window.addEventListener('beforeunload', function() {
            localStorage.setItem('bibleWindowNotification', 0);
        });

        this.setFontSize();
        this.setInfo();
        this.setBookTitle();

        if (this.info) {
            this.play();
            return;
        }
        this.playStatus = false;
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
        playStatus: true,
        bookName: '',
        chapter: null,
        section: null,
        chapterLabel: '章',
        loading: 0
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
            this.setBookTitle();
        },
        jumpToSection() {
            setTimeout(() => {
                this.controlSection(this.info.section);
            }, 2000);
        },
        controlSection(section) {
            window.location.hash = '#section_' + section;
            this.section = section;
        },
        /**
         * set book title
         */
        setBookTitle() {
            if (!this.info) return;

            const bookItem = collect(book).first((item) => item.value == this.info.book);
            this.bookName = bookItem.label;
            this.chapter = this.info.chapter;
            this.section = this.info.section;

            this.chapterLabel = this.info.book === 18 ? '篇' : '章';
        }
    }
};
</script>

<style lang="scss" scoped>
@import '@/assets/css/main.scss';

.title {
    line-height: 60px;
}

.list {
    overflow: hidden;
}

.layout {
    position: absolute;
    background-color: $mainBackground;
    width: 100%;
    height: 100vh;
    left: 0;
    top: 0;
}

.bible-wrapper {
    background: #ffffff !important;
    color: #111111;
}

.bible-info {
    font-size: 2.5rem;
    font-weight: 600;
    line-height: 60px;
}

.content {
    padding-bottom: 100vh;
}
</style>
