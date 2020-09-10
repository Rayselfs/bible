<template>
    <el-container class="bible">
        <el-header>
            <b-row class="navbar" align-h="between">
                <b-col cols="4"></b-col>
                <b-col cols="4" class="d-flex justify-content-center">
                    <el-select v-model="bookFilterSelectorModel" placeholder="請選擇" class="mr-3" @change="filterBook">
                        <el-option
                            v-for="item in bookFilterSelector"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value"
                        ></el-option>
                    </el-select>
                    <el-button type="info" @click="openBibleSelector()">選擇經文章節</el-button>
                </b-col>
                <b-col cols="4" class="d-flex justify-content-end">
                    <el-input
                        style="width: 250px"
                        placeholder="請搜尋經文"
                        suffix-icon="el-icon-search"
                        v-model="searchKey"
                        @change="search"
                        @blur="clearSearchKey"
                    >
                    </el-input>
                </b-col>
            </b-row>
        </el-header>
        <el-container class="pl-3 pr-3 position-relative">
            <!-- 預覽區 -->
            <el-aside width="50%" class="pt-3 pb-3">
                <h4 class="mb-3 ml-3">
                    預覽 (
                    <span class="mr-2">{{ bookName }}</span>
                    <span class="mr-2" v-show="chapterModel">第{{ chapterModel }}{{ chapterUnit }}</span>
                    <span v-show="sectionModel">第{{ sectionModel }}節</span>)
                </h4>
                <div ref="preview" class="preview-wrapper box-bk">
                    <div class="preview-content p-3">
                        <div
                            v-for="(item, index) in previewList"
                            :key="index"
                            :id="'section_' + item.section"
                            class="mb-3 w-100 d-flex preview-item"
                            :class="{ 'preview-selected': item.section === sectionModel }"
                            @click="playSlide(item, index)"
                        >
                            <div>{{ item.content }}</div>
                        </div>
                    </div>
                </div>
            </el-aside>
            <el-container>
                <el-main>
                    <!-- 歷史紀錄與自訂 -->
                    <div class="history">
                        <el-tabs v-model="tabName" type="card">
                            <el-tab-pane label="歷史紀錄" name="history">
                                <transition-group name="fadeLeft" tag="div" class="p-3">
                                    <div
                                        v-for="item in historyList"
                                        :key="`${item.book}_${item.timestamp}`"
                                        class="d-flex mb-3 preview-item"
                                    >
                                        <div>
                                            <i class="el-icon-caret-right"></i>
                                        </div>
                                        <div>
                                            <p class="mb-2">{{ item.content }}</p>
                                            <p class="mb-0">( {{ item.info }}, {{ item.time }} )</p>
                                        </div>
                                    </div>
                                </transition-group>
                            </el-tab-pane>
                            <el-tab-pane label="自訂紀錄" name="folder">
                                <div class="p-3">開發中</div>
                            </el-tab-pane>
                        </el-tabs>
                    </div>
                    <div class="action mb-3">
                        <h4 class="mb-3 ml-3">操作</h4>
                        <div class="box-bk p-3">
                            <b-row align-v="center">
                                <b-col cols="8">
                                    <b-row align-v="center">
                                        <b-col cols="4">
                                            <el-button
                                                class="w-100 button-action"
                                                type="info"
                                                :disabled="!slideWindowOpen || !biblePlayStatus || nowChapter === 1"
                                                @click="controlChapter(false)"
                                                >上一章</el-button
                                            >
                                        </b-col>
                                        <b-col cols="4">
                                            <div class="mb-3">
                                                <el-button
                                                    class="w-100 button-action"
                                                    type="info"
                                                    :disabled="!slideWindowOpen || !biblePlayStatus || nowSection === 1"
                                                    @click="controlSection(false)"
                                                    >上一節</el-button
                                                >
                                            </div>
                                            <div>
                                                <el-button
                                                    class="w-100 button-action"
                                                    type="info"
                                                    :disabled="
                                                        !slideWindowOpen ||
                                                            !biblePlayStatus ||
                                                            nowSection === totalSection
                                                    "
                                                    @click="controlSection(true)"
                                                    >下一節</el-button
                                                >
                                            </div>
                                        </b-col>
                                        <b-col cols="4">
                                            <el-button
                                                class="w-100 button-action"
                                                type="info"
                                                :disabled="
                                                    !slideWindowOpen || !biblePlayStatus || nowChapter === totalChapter
                                                "
                                                @click="controlChapter(true)"
                                            >
                                                下一章</el-button
                                            >
                                        </b-col>
                                    </b-row>
                                </b-col>
                                <b-col cols="4">
                                    <div class="mb-3">
                                        <el-button
                                            class="button-action w-100 pt-3 pb-3"
                                            type="info"
                                            @click="controlPlay(true)"
                                            :disabled="!slideWindowOpen || biblePlayStatus || !nowChapter"
                                            >投射</el-button
                                        >
                                    </div>
                                    <div class="mb-3">
                                        <el-button
                                            class="button-action w-100 pt-3 pb-3"
                                            type="info"
                                            @click="controlPlay(false)"
                                            :disabled="!slideWindowOpen || !biblePlayStatus"
                                            >黑幕</el-button
                                        >
                                    </div>
                                    <div>
                                        <el-button
                                            class="button-action w-100 pt-3 pb-3"
                                            type="info"
                                            @click="closeSlide()"
                                            :disabled="!slideWindowOpen"
                                            >關閉視窗</el-button
                                        >
                                    </div>
                                </b-col>
                            </b-row>
                        </div>
                    </div>
                    <div class="setting">
                        <h4 class="mb-3 ml-3">設定</h4>
                        <div class="box-bk p-3">
                            <div class="block">
                                <span>字型大小</span>
                                <el-slider
                                    v-model="slideFontSize"
                                    :min="50"
                                    :max="120"
                                    :marks="{ 50: '50', 120: '120' }"
                                    @change="changeSlideFontSize"
                                ></el-slider>
                            </div>
                        </div>
                    </div>
                </el-main>
            </el-container>
        </el-container>

        <!-- 聖經 dropdown modal -->
        <b-modal id="modal-bible" size="lg">
            <template v-slot:modal-header>
                <div class="w-100 d-flex justify-content-between">
                    <div>
                        <h4>{{ switchStatus }}</h4>
                    </div>
                    <div>
                        <el-button type="info" :disabled="switchPage === 'book'" @click="switchToBook(false)"
                            >書</el-button
                        >
                        <el-button type="info" :disabled="switchPage === 'chapter'" @click="switchToChapter()"
                            >章</el-button
                        >
                        <el-button
                            type="info"
                            :disabled="switchPage === 'section' || !chapterModel"
                            @click="switchToSection()"
                            >節</el-button
                        >
                    </div>
                </div>
            </template>
            <transition :name="transitionName" mode="out-in">
                <div v-if="switchPage === 'book'" key="book">
                    <el-button
                        class="mb-3 ml-3"
                        v-for="(item, index) in bookSelector"
                        :key="index"
                        type="info"
                        :class="{ 'button-select': bookModel === item.value }"
                        @click="setBook(item.value, item.label)"
                        >{{ item.label }}</el-button
                    >
                </div>
                <div v-else-if="switchPage === 'chapter'" key="chapter">
                    <el-button
                        class="mb-3 ml-3"
                        v-for="item in countChapter()"
                        :key="item"
                        type="info"
                        :disabled="chapterModel === item"
                        @click="setChapter(item)"
                        >第 {{ item }} {{ chapterUnit }}</el-button
                    >
                </div>
                <div v-else key="section">
                    <el-button
                        v-for="item in countSectionAmount()"
                        :key="item"
                        class="mb-3 ml-3"
                        type="info"
                        :disabled="sectionModel === item"
                        @click="setSection(item)"
                        >第 {{ item }} 節</el-button
                    >
                </div>
            </transition>
            <template v-slot:modal-footer="{ cancel }">
                <b-button size="sm" variant="secondary" @click="cancel()">關閉</b-button>
            </template>
        </b-modal>
    </el-container>
</template>

<script>
import { book, chapter, section } from '@/assets/js/function';
import { bible } from '@/assets/js/bible';
import collect from 'collect.js';
import Fuse from 'fuse.js';

let slide;

export default {
    name: 'Home',
    data: () => ({
        allBook: [],
        bookSelector: [],
        bookFilterSelector: [
            { label: '全部', value: 0 },
            { label: '舊約', value: 1 },
            { label: '新約', value: 2 }
        ],
        bookFilterSelectorModel: 0,
        bookModel: 0,
        chapterModel: null,
        sectionModel: null,
        transitionName: 'right-transform',
        switchStatus: '',
        bookName: '',
        BookOpacity: 1,
        switchPage: 'book',
        chapterUnit: '章',
        omegaSection: null,
        alphaSection: null,
        previewList: [],
        tabName: 'history',
        historyList: [],
        slideWindowOpen: false,
        biblePlayStatus: false,
        totalChapter: null,
        totalSection: null,
        nowChapter: null,
        nowSection: null,
        slideFontSize: 50,
        searchKey: ''
    }),
    created() {
        window.addEventListener('storage', this.localStorageChange);

        this.allBook = collect(book);
        this.bookSelector = this.allBook.all();

        if (localStorage.getItem('slideFontSize')) {
            this.slideFontSize = parseInt(localStorage.getItem('slideFontSize'));
        }
    },
    methods: {
        changeSlideFontSize(value) {
            localStorage.setItem('slideFontSize', value);
        },
        localStorageChange(e) {
            const key = e.key;
            // const value = JSON.parse(e.newValue);

            switch (key) {
                case 'biblePlayStatus':
                    this.closeSlide();
                    break;
                default:
                    break;
            }
        },
        /**
         * 條件過濾書卷
         */
        filterBook(value) {
            switch (value) {
                // 全部
                case 0:
                    this.bookSelector = this.allBook.all();
                    this.bookModel = 0;
                    break;
                // 舊約
                case 1:
                    this.bookSelector = this.allBook.filter((item) => item.value < 39);
                    this.bookModel = 0;
                    break;
                // 新約
                case 2:
                    this.bookSelector = this.allBook.filter((item) => item.value >= 39);
                    this.bookModel = 39;
                    break;
            }
        },
        /**
         * 經文選擇
         */
        openBibleSelector() {
            this.transitionName = 'right-transform';
            this.switchStatus = '請選擇書卷';
            this.switchPage = 'book';

            this.$bvModal.show('modal-bible');
        },
        /**
         * 選擇書卷
         */
        setBook(index, value) {
            this.bookModel = index;
            this.bookName = value;

            this.previewList = [];
            this.nowChapter = null;
            this.controlPlay(false);

            this.switchToChapter();
        },
        /**
         * 選擇章數
         */
        setChapter(index) {
            this.chapterModel = index;

            this.switchToSection();
        },
        /**
         * 選擇節數
         */
        setSection(index) {
            this.sectionModel = index;
            this.setPreview();
        },
        /**
         * 設定選擇書卷頁面
         */
        switchToBook(type = true) {
            this.transitionName = type ? 'right-transform' : 'left-transform';
            this.switchStatus = '請選擇書卷';

            this.chapterModel = null;
            this.sectionModel = null;
            this.switchPage = 'book';
        },
        /**
         * 設定選擇章數頁面
         */
        switchToChapter() {
            if (this.switchPage === 'section') {
                this.transitionName = 'left-transform';
            } else {
                this.transitionName = 'right-transform';
            }
            this.switchStatus = '第幾章？';

            this.sectionModel = null;
            this.switchPage = 'chapter';
        },
        /**
         * 設定選擇節數頁面
         */
        switchToSection() {
            this.switchStatus = '第幾節？';
            this.transitionName = 'right-transform';
            this.switchPage = 'section';
        },
        /**
         * 設置預覽
         */
        setPreview() {
            let content;
            this.previewList = [];
            let i = 1;

            for (let index = this.alphaSection; index < this.omegaSection; index++) {
                content = bible[index].split(' ');
                this.previewList.push({
                    book: this.bookModel,
                    chapter: this.chapterModel,
                    section: i,
                    content: `${content[0]} - ${content[1]}`,
                    alphaSection: this.alphaSection,
                    omegaSection: this.omegaSection,
                    mode: 'choose'
                });
                i++;
            }
            this.$bvModal.hide('modal-bible');

            this.jumpToSection();
        },
        /**
         * 跳至預覽節數位置
         */
        jumpToSection() {
            setTimeout(() => {
                const index = this.sectionModel <= 1 ? this.sectionModel : this.sectionModel - 1;
                window.location.hash = '#section_' + index;
            }, 100);
        },
        /**
         * 開始投放
         */
        playSlide(info, index) {
            this.sectionModel = info.section;

            this.setBaseInfo(info);
            this.setPlayStatus();

            this.openSlide();

            if (info.mode !== 'control') {
                this.saveToHistory(info, index);
            }

            if (info.mode === 'search') {
                this.bookName = this.getBookName(info.book);
                this.setPreview();
            }
        },
        /**
         * 設置投放基本訊息
         */
        setBaseInfo(info) {
            this.bookModel = info.book;
            this.chapterModel = info.chapter;
            this.sectionModel = info.section;
            this.alphaSection = info.alphaSection;
            this.omegaSection = info.omegaSection;

            localStorage.setItem('bibleSlideInfo', JSON.stringify(info));
            localStorage.setItem('bibleNowSection', info.section);

            this.totalChapter = this.countChapter();
            this.totalSection = info.omegaSection - info.alphaSection;

            this.nowChapter = info.chapter;
            this.nowSection = info.section;
        },
        /**
         * 設置投放狀態
         */
        setPlayStatus() {
            this.biblePlayStatus = true;
            localStorage.setItem('biblePlayStatus', 1);
        },
        openSlide() {
            if (slide && this.slideWindowOpen && !slide.closed) return;

            slide = window.open('/list', 'slider');
            this.slideWindowOpen = true;
        },
        /**
         * 儲存至歷史
         */
        saveToHistory(info, index) {
            const date = new Date();
            this.historyList.unshift({
                content: this.previewList[index].content,
                info: `${this.getBookName(info.book)},
                        ${info.chapter}章, ${info.section}節`,
                time: this.getTS(date),
                timestamp: this.getTimestamp(date),
                book: info.book,
                chapter: info.chapter,
                section: info.section
            });

            if (this.historyList.length > 20) {
                this.historyList.pop();
            }
        },
        countChapter() {
            return chapter[this.bookModel + 1] - chapter[this.bookModel];
        },
        countSectionAmount() {
            if (!this.chapterModel) {
                return null;
            }

            this.countSectionIndex();
            return this.omegaSection - this.alphaSection;
        },
        /**
         * 計算Section陣列index位置
         * @param {int} bookModel
         * @param {int} chapterModel
         */
        countSectionIndex(bookModel = this.bookModel, chapterModel = this.chapterModel) {
            this.omegaSection = section[chapter[bookModel] + chapterModel];
            this.alphaSection = section[chapter[bookModel] + chapterModel - 1];
        },
        /**
         * 將preview設置頂部
         */
        previewScrollToTop() {
            this.$refs.preview.scrollTop = 0;
        },
        getTimestamp(date) {
            return date.getTime();
        },
        getTS(date) {
            return `${date.getFullYear()}-${date.getMonth() +
                1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
        },
        /**
         * 控制投放與否
         */
        controlPlay(status = false) {
            this.biblePlayStatus = status;
            localStorage.setItem('biblePlayStatus', status ? 1 : 0);
        },
        /**
         * 關閉slide
         */
        closeSlide() {
            if (!this.slideWindowOpen) return;

            slide.close();
            this.slideWindowOpen = false;
        },
        getStorageInfo() {
            return JSON.parse(localStorage.getItem('bibleSlideInfo'));
        },
        controlChapter(status) {
            if (status && this.nowChapter < this.totalChapter) this.nowChapter++;
            if (!status && this.nowChapter > 1) this.nowChapter--;

            this.chapterModel = this.nowChapter;
            this.sectionModel = 1;

            this.countSectionIndex();
            this.setPreview();

            this.playSlide(
                {
                    book: this.bookModel,
                    chapter: this.nowChapter,
                    section: 1,
                    alphaSection: this.alphaSection,
                    omegaSection: this.omegaSection,
                    mode: 'control'
                },
                0
            );
        },
        /**
         * 控制上下節
         */
        controlSection(status) {
            if (status && this.nowSection < this.totalSection) this.nowSection++;
            if (!status && this.nowSection > 1) this.nowSection--;

            localStorage.setItem('bibleNowSection', this.nowSection);
        },
        search(keyword) {
            if (keyword === '') return;

            const options = { includeScore: true, threshold: 0.5 };
            const fuse = new Fuse(bible, options);

            const searchResult = fuse.search(keyword);

            this.reset();

            if (searchResult.length === 0) {
                this.bookName = '沒有結果，請重新設定條件';
                return;
            }

            let chapterIndex;
            let bookModel;
            let chapterModel;
            let sectionModel;
            let content;
            let omegaSection;
            let alphaSection;

            searchResult.forEach((element) => {
                chapterIndex = 0;

                bookModel = null;
                chapterModel = null;
                sectionModel = null;
                omegaSection = null;
                alphaSection = null;

                section.every(function(item, index) {
                    chapterIndex = index - 1;
                    sectionModel = element.refIndex - section[index - 1] + 1;
                    alphaSection = section[index - 1];
                    omegaSection = item;

                    if (item <= element.refIndex) {
                        return true;
                    } else {
                        return false;
                    }
                });

                chapter.every(function(item, index) {
                    bookModel = index - 1;
                    chapterModel = chapterIndex - chapter[index - 1] + 1;

                    if (item <= chapterIndex) {
                        return true;
                    } else {
                        return false;
                    }
                });

                content = element.item.split(' ');
                this.previewList.push({
                    book: bookModel,
                    chapter: chapterModel,
                    section: sectionModel,
                    content: `${content[0]} - ${content[1]}`,
                    alphaSection: alphaSection,
                    omegaSection: omegaSection,
                    mode: 'search'
                });
            });

            this.bookName = '搜尋結果';
            this.previewScrollToTop();
        },
        clearSearchKey() {
            this.searchKey = '';
        },
        getBookName(bookIndex) {
            return this.allBook.first((item) => item.value === bookIndex).label;
        },
        reset() {
            this.previewList = [];
            this.bookModel = null;
            this.chapterModel = null;
            this.sectionModel = null;
        }
    }
};
</script>

<style>
.left-transform-leave-active,
.left-transform-enter-active {
    transition: all 0.2s;
}

.left-transform-enter {
    opacity: 0;
    transform: translateX(-30px);
}

.left-transform-leave-to {
    opacity: 0;
    transform: translateX(30px);
}

.right-transform-leave-active,
.right-transform-enter-active {
    transition: all 0.2s;
}

.right-transform-enter {
    opacity: 0;
    transform: translateX(30px);
}

.right-transform-leave-to {
    opacity: 0;
    transform: translateX(-30px);
}
</style>

<style lang="scss" scoped>
@import '@/assets/css/main.scss';

.fade-top-edge::before {
    content: '';
    position: absolute;
    z-index: 1;
    top: 0;
    left: 0;
    pointer-events: none;
    background-image: linear-gradient(to top, rgba(25, 25, 25, 0), rgba(25, 25, 25, 1) 90%);
    width: 100%;
    height: 5rem;
}

.fade-bottom-edge:after {
    content: '';
    position: absolute;
    z-index: 1;
    bottom: 0;
    left: 0;
    pointer-events: none;
    background-image: linear-gradient(to bottom, rgba(25, 25, 25, 0), rgba(25, 25, 25, 1) 90%);
    width: 100%;
    height: 5rem;
}

.preview-wrapper {
    height: calc(100% - 3rem);
    font-size: 18px;
    overflow: scroll;
}

.preview-content {
    padding-bottom: 90vh !important;
}

.box-bk {
    background-color: $sceondBackground;
    border-radius: 10px;
}

.preview-index {
    vertical-align: top;
}

.preview-item {
    cursor: pointer;
    border-radius: 5px;
    padding: 5px;
}

.preview-item:hover {
    background-color: $thirdBackground;
    -webkit-transition: 0.2s ease-in-out;
    -moz-transition: 0.2s ease-in-out;
    -o-transition: 0.2s ease-in-out;
    transition: 0.2s ease-in-out;
}

.preview-selected {
    background-color: rgb(255, 230, 0) !important;
    color: #000000;
}

.history {
    height: 50%;
}

.button-action {
    font-size: 1.2rem;
}
</style>

<style lang="scss">
@import '@/assets/css/main.scss';
.el-header {
    background-color: $sceondBackground;
}

.el-aside,
.el-main {
    height: calc(100vh - 60px);
}

// select
.el-input__inner {
    background-color: $mainBackground !important;
    border: 1px solid $borderColor !important;
    color: $text !important;
}

.el-select-dropdown {
    background-color: $sceondBackground !important;
    border: 1px solid $borderColor !important;
}

.el-select-dropdown__item {
    color: $text !important;
}

.el-select-dropdown__item.hover {
    background-color: $thirdBackground !important;
}

.el-popper[x-placement^='bottom'] .popper__arrow,
.el-popper[x-placement^='bottom'] .popper__arrow::after {
    border-bottom-color: $borderColor !important;
}

/** button */
.el-button--info {
    background-color: $thirdBackground !important;
    border-color: $borderColor !important;
    -webkit-transition: opacity 0.2s ease-in-out;
    -moz-transition: opacity 0.2s ease-in-out;
    -o-transition: opacity 0.3s ease-in-out;
    transition: opacity 0.3s ease-in-out;
    -webkit-transition: background-color 0.3s ease-in-out;
    -moz-transition: background-color 0.3s ease-in-out;
    -o-transition: background-color 0.3s ease-in-out;
    transition: background-color 0.3s ease-in-out;
    opacity: 0.7;
}

.el-button--info:hover {
    background-color: #777777 !important;
    opacity: 1;
}

.el-button--info:disabled {
    background-color: #777777 !important;
    opacity: 1;
}

.button-select {
    background-color: #777777 !important;
    opacity: 1;
}

.modal-content {
    color: $text;
    background-color: $mainBackground !important;
}

.el-tabs {
    height: 100%;
}

.el-tabs__item.is-active {
    color: $text !important;
}

.el-tabs__item:hover {
    color: $mainText !important;
}

.el-tabs__content {
    background-color: $sceondBackground;
    border-radius: 10px;
    height: calc(100% - 5rem);
    overflow: scroll !important;
}

.el-slider__bar {
    background-color: #777777 !important;
}
</style>
