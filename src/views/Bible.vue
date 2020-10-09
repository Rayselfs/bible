<template>
    <el-container class="bible-control">
        <el-header class="header">
            <b-row class="navbar" align-h="between">
                <b-col cols="4">
                    <header-title></header-title>
                </b-col>
                <b-col cols="4" class="d-flex justify-content-center">
                    <el-select v-model="bookFilterSelectorModel" placeholder="請選擇" class="mr-3" @change="filterBook">
                        <el-option
                            v-for="item in bookFilterSelector"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value"
                        ></el-option>
                    </el-select>
                    <el-button type="info" @click="openBibleSelector()">選擇</el-button>
                    <el-button
                        type="info"
                        :disabled="!slideWindowOpen || biblePlayStatus === null"
                        :style="{ background: playBtnBg }"
                        @click="controlPlay(!biblePlayStatus)"
                    >
                        {{ playBtnText }}
                    </el-button>
                </b-col>
                <b-col cols="4" class="d-flex justify-content-end">
                    <el-input
                        ref="search"
                        class="mr-2"
                        style="width: 250px"
                        placeholder="搜尋經文"
                        suffix-icon="el-icon-search"
                        v-model="searchKey"
                        @change="search"
                        @focus="searchFocus = true"
                        @blur="clearSearchKey"
                    >
                    </el-input>
                    <el-dropdown>
                        <div class="setting-icon"><i class="el-icon-s-tools"></i></div>
                        <el-dropdown-menu slot="dropdown">
                            <el-dropdown-item
                                ><div class="block">
                                    <span>字型大小</span>
                                    <el-slider
                                        v-model="slideFontSize"
                                        :min="70"
                                        :max="140"
                                        @change="changeSlideFontSize"
                                    ></el-slider></div
                            ></el-dropdown-item>
                        </el-dropdown-menu>
                    </el-dropdown>
                </b-col>
            </b-row>
        </el-header>
        <el-container class="pl-3 pr-3 position-relative">
            <!-- 預覽區 -->
            <el-aside width="50%" class="pt-3 pb-3">
                <div class="d-flex justify-content-between">
                    <h4 class="mb-3 ml-3">
                        預覽 (
                        <span class="mr-2">{{ bookName }}</span>
                        <span class="mr-2" v-show="chapterModel">第{{ chapterModel }}{{ chapterUnit }}</span>
                        <span v-show="sectionModel">第{{ sectionModel }}節</span>)
                    </h4>
                    <div class="d-flex" style="font-size: 20px">
                        <div class="mr-1 main-text-hover cursor-pointer" @click="controlPreviewChapter(false)">
                            <i class="el-icon-caret-left" />
                        </div>
                        <div class="mr-2 main-text-hover cursor-pointer" @click="controlPreviewChapter(true)">
                            <i class="el-icon-caret-right" />
                        </div>
                        <div
                            class="mr-2 cursor-pointer main-text-hover"
                            @click="clearList('previewList', '預覽列表', false)"
                        >
                            清除
                        </div>
                        <el-tooltip class="question-tooltip" effect="light" placement="bottom-end">
                            <ol slot="content" class="mb-0 mt-2" style="font-size: 16px">
                                <li class="mb-2">此區為預覽區域</li>
                                <li class="mb-2">播放視窗還未開啟時，點選章節會自動開啟</li>
                                <li class="mb-2">點選搜尋結果會跳轉到該章節</li>
                            </ol>
                            <i class="el-icon-question"></i>
                        </el-tooltip>
                    </div>
                </div>
                <div ref="preview" class="preview-wrapper box-bk">
                    <div class="preview-content p-3">
                        <div
                            class="d-flex"
                            v-for="(item, index) in previewList"
                            :key="index"
                            :id="'section_' + item.section"
                        >
                            <div
                                class="mb-3 mr-3 w-100 d-flex preview-item"
                                :class="{ 'preview-selected': item.section === sectionModel }"
                                @click="playSlide(item)"
                                v-html="item.content"
                            ></div>
                            <div class="main-text-hover cursor-pointer" @click="addBibleInfoToFolder(item)">
                                <i class="el-icon-circle-plus-outline"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </el-aside>
            <el-container>
                <el-main>
                    <!-- 歷史紀錄與自訂 -->
                    <div class="history position-relative">
                        <div class="position-absolute" style="left: 220px; top: 0; z-index: 2">
                            <div v-if="tabName !== 'history'">
                                <div v-if="customLayer">
                                    <span class="text-blue main-text-hover cursor-pointer" @click="addFolder()"
                                        ><i class="el-icon-plus mr-2"></i>新增資料夾
                                    </span>
                                </div>
                                <div v-else>
                                    <div class="d-flex">
                                        <div
                                            class="text-blue mr-2 cursor-pointer main-text-hover"
                                            @click="backToFolder()"
                                        >
                                            {{ customizeList[customizeSelected].label }}
                                        </div>
                                        <div><i class="el-icon-arrow-right"></i> 經文</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="position-absolute" style="right: 0; top: 0; z-index: 2">
                            <div v-if="tabName === 'history'" class="d-flex">
                                <div
                                    class="mr-2 cursor-pointer main-text-hover"
                                    @click="clearList('historyList', '歷史列表')"
                                >
                                    清除
                                </div>
                                <el-tooltip class="question-tooltip" effect="light" placement="bottom-end">
                                    <ol slot="content" class="mb-0 mt-2" style="font-size: 16px">
                                        <li class="mb-2">最上面為最新查詢項目</li>
                                    </ol>
                                    <i class="el-icon-question"></i>
                                </el-tooltip>
                            </div>
                            <div v-else class="d-flex">
                                <div class="mr-2 cursor-pointer main-text-hover" @click="saveFolderToLocal()">
                                    儲存
                                </div>
                                <div class="mr-2 cursor-pointer main-text-hover" @click="clearFolderList()">
                                    清除
                                </div>
                                <el-tooltip class="question-tooltip" effect="light" placement="bottom-end">
                                    <ol slot="content" class="mb-0 mt-2" style="font-size: 16px">
                                        <li class="mb-2">資料夾沒有儲存的話，重新整理或是關閉頁面將會重置</li>
                                    </ol>
                                    <i class="el-icon-question"></i>
                                </el-tooltip>
                            </div>
                        </div>
                        <el-tabs v-model="tabName" type="card">
                            <el-tab-pane label="歷史紀錄" name="history">
                                <transition-group name="fadeLeft" tag="div" class="p-3">
                                    <div
                                        v-for="(item, index) in historyList"
                                        :key="`${item.book}_${item.timestamp}`"
                                        class="d-flex"
                                        style="animation-duration: 0.5s"
                                    >
                                        <div class="d-flex mb-3 mr-2 preview-item w-100" @click="playSlide(item)">
                                            <div>
                                                <i class="el-icon-caret-right"></i>
                                            </div>
                                            <div v-html="item.content" class="d-flex"></div>
                                        </div>
                                        <div>
                                            <i
                                                @click="historyList.splice(index, 1)"
                                                class="el-icon-delete-solid cursor-pointer main-text-hover"
                                            ></i>
                                        </div>
                                    </div>
                                </transition-group>
                            </el-tab-pane>
                            <el-tab-pane label="自訂紀錄" name="folder">
                                <div class="p-3">
                                    <transition :name="folderTransition()" mode="out-in">
                                        <div v-if="customLayer" key="main" class="folder-wrapper">
                                            <draggable tag="div" v-model="customizeList" v-bind="dragOptions">
                                                <transition-group type="transition" name="bible-flip-list">
                                                    <div
                                                        v-for="(item, index) in customizeList"
                                                        :key="index"
                                                        class="d-flex justify-content-between pr-3"
                                                    >
                                                        <div
                                                            class="d-flex w-100 mr-3 preview-item pt-2 pb-2 pl-3"
                                                            @click="intoFolder(index)"
                                                        >
                                                            <div class="mr-2"><fa icon="folder" /></div>
                                                            <div>{{ item.label }}</div>
                                                        </div>
                                                        <div class="d-flex pt-1">
                                                            <div
                                                                class="mr-3 cursor-pointer main-text-hover pt-1"
                                                                @click="editFolder(index)"
                                                            >
                                                                <fa icon="edit" />
                                                            </div>
                                                            <div
                                                                class="trash-text cursor-pointer pt-1"
                                                                @click="deleteFolder(index)"
                                                            >
                                                                <fa icon="trash" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </transition-group>
                                            </draggable>
                                        </div>
                                        <div v-else key="sub">
                                            <draggable
                                                tag="div"
                                                :list="customizeList[customizeSelected].list"
                                                v-bind="dragOptions"
                                                handle=".list-handle"
                                                @change="folderSubLog"
                                            >
                                                <transition-group
                                                    name="fadeLeft"
                                                    tag="div"
                                                    :class="{
                                                        'folder-item-empty-area':
                                                            customizeList[customizeSelected].list.length === 0
                                                    }"
                                                >
                                                    <div
                                                        v-for="(item, index) in customizeList[customizeSelected].list"
                                                        :key="`${item.book}_${item.timestamp}`"
                                                        class="d-flex"
                                                        style="animation-duration: 0.5s"
                                                    >
                                                        <div class="list-handle mr-2 pt-1 cursor-pointer">
                                                            <fa icon="bars" />
                                                        </div>
                                                        <div
                                                            class="d-flex mb-3 mr-2 preview-item w-100"
                                                            @click="playSlide(item)"
                                                        >
                                                            <div>{{ index + 1 }}.</div>
                                                            <div v-html="item.content" class="d-flex"></div>
                                                        </div>
                                                        <div>
                                                            <i
                                                                @click="
                                                                    customizeList[customizeSelected].list.splice(
                                                                        index,
                                                                        1
                                                                    )
                                                                "
                                                                class="el-icon-delete-solid cursor-pointer main-text-hover"
                                                            ></i>
                                                        </div>
                                                    </div>
                                                </transition-group>
                                            </draggable>
                                        </div>
                                    </transition>
                                </div>
                            </el-tab-pane>
                        </el-tabs>
                    </div>
                    <div class="action mb-3">
                        <h4 class="mb-3 ml-3">操作</h4>
                        <div class="box-bk p-3">
                            <div class="d-flex align-items-center">
                                <div class="mr-4">
                                    <el-button
                                        class="w-100 button-action"
                                        type="info"
                                        :disabled="!slideWindowOpen || !biblePlayStatus || nowChapter === 1"
                                        @click="controlChapter(false)"
                                        >上一章</el-button
                                    >
                                </div>
                                <div class="mr-4">
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
                                                !slideWindowOpen || !biblePlayStatus || nowSection === totalSection
                                            "
                                            @click="controlSection(true)"
                                            >下一節</el-button
                                        >
                                    </div>
                                </div>
                                <div>
                                    <el-button
                                        class="w-100 button-action"
                                        type="info"
                                        :disabled="!slideWindowOpen || !biblePlayStatus || nowChapter === totalChapter"
                                        @click="controlChapter(true)"
                                    >
                                        下一章</el-button
                                    >
                                </div>
                            </div>
                        </div>
                    </div>
                </el-main>
            </el-container>
        </el-container>

        <!-- 聖經 dropdown modal -->
        <b-modal id="modal-bible" size="lg" content-class="bible-selector-modal-content">
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
                    <div
                        v-for="(item, index) in bookSelector"
                        :key="index"
                        class="mb-3"
                        :class="{ 'float-left': index !== 38, clearfix: index === 38 }"
                    >
                        <el-button
                            type="info"
                            class="ml-3"
                            :class="{ 'button-select': bookModel === item.value }"
                            style="width: 170px; font-size: 20px;"
                            @click="setBook(item.value, item.label)"
                            >{{ item.label }}</el-button
                        >
                        <hr v-if="index === 38 && bookSelector.length > 39" />
                    </div>
                </div>
                <div v-else-if="switchPage === 'chapter'" key="chapter">
                    <el-button
                        class="mb-3 ml-2 selector-button"
                        v-for="item in countChapterAmount()"
                        :key="item"
                        type="info"
                        @click="setChapter(item)"
                        >{{ item }}</el-button
                    >
                </div>
                <div v-else key="section">
                    <el-button
                        v-for="item in countSectionAmount()"
                        :key="item"
                        class="mb-3 ml-2 selector-button"
                        type="info"
                        :disabled="sectionModel === item"
                        @click="setSection(item)"
                        >{{ item }}</el-button
                    >
                </div>
            </transition>
            <template v-slot:modal-footer="{ cancel }">
                <b-button size="sm" variant="secondary" @click="cancel()">關閉</b-button>
            </template>
        </b-modal>

        <b-modal id="modal-folder" v-model="modalFolder" content-class="bible-selector-modal-content">
            <template v-slot:modal-header>
                <div class="w-100 d-flex justify-content-between">
                    <div>請選擇資料夾</div>
                    <div>
                        <span class="text-blue main-text-hover cursor-pointer" @click="addFolder()"
                            ><i class="el-icon-plus mr-2"></i>新增資料夾
                        </span>
                    </div>
                </div>
            </template>
            <div
                v-for="(item, index) in customizeList"
                :key="index"
                style="font-size: 24px"
                class="pt-2 pb-2"
                :class="{ 'border-top': index > 0 }"
            >
                <div class="d-flex w-100 mr-3 preview-item" @click="intoFolder(index)">
                    <div class="mr-2"><fa icon="folder" /></div>
                    <div>{{ item.label }}</div>
                </div>
            </div>
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
import HeaderTitle from '@/components/HeaderTitle';

let slide;

let autoSaveTimer = {
    status: false,
    clock: null,
    time: 0
};

export default {
    name: 'Home',
    data: () => ({
        allBook: [],
        bookSelector: [],
        bookFilterSelector: [
            { label: '全部', value: 0 },
            { label: '舊約', value: 1 },
            { label: '新約', value: 2 },
            { label: '摩西五經', value: 3 },
            { label: '大先知書', value: 4 },
            { label: '小先知書', value: 5 },
            { label: '四福音書', value: 6 }
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
        biblePlayStatus: null,
        totalChapter: null,
        totalSection: null,
        nowChapter: null,
        nowSection: null,
        slideFontSize: 100,
        searchKey: '',
        searchFocus: false,
        customizeList: [],
        customizeSelected: null,
        customLayer: true,
        playBtnText: '投放',
        playBtnBg: 'initial',
        itemCache: null,
        modalFolder: false,
        dragOptions: {
            animation: 200,
            group: 'description',
            disabled: false,
            ghostClass: 'ghost'
        }
    }),
    components: {
        'header-title': HeaderTitle
    },
    created() {
        window.addEventListener('storage', this.localStorageChange);

        // 監聽視窗關閉
        window.addEventListener('beforeunload', function() {
            if (slide && !slide.closed) slide.close();
        });

        window.addEventListener('keyup', this.keyup);

        window.addEventListener('keydown', this.keydown);

        this.allBook = collect(book);
        this.bookSelector = this.allBook.all();

        // 預設定字型大小
        if (localStorage.getItem('slideFontSize')) {
            this.slideFontSize = parseInt(localStorage.getItem('slideFontSize'));
        } else {
            localStorage.setItem('slideFontSize', this.slideFontSize);
        }

        this.recallFolder();
        this.recallHistory();

        // this.openWindow();
    },
    mounted() {
        this.infoMessage('請將投影視窗拉至第二投影螢幕，並按下 F11 全螢幕');
    },
    methods: {
        /**
         * 開啟視窗
         */
        openWindow() {
            if (slide && this.slideWindowOpen && !slide.closed) return;

            localStorage.removeItem('bibleSlideInfo');
            localStorage.removeItem('bibleNowSection');
            localStorage.setItem('biblePlayStatus', 0);
            localStorage.setItem('bibleWindowNotification', 1);

            slide = window.open('/list', 'slider', 'height=1080, width=1920');
            this.slideWindowOpen = true;
        },
        /**
         * 關閉視窗
         */
        closeWindow() {
            if (!this.slideWindowOpen) return;

            slide.close();
            this.slideWindowOpen = false;

            this.controlPlay(false);
            this.biblePlayStatus = null;
        },
        /**
         * save font size to localstorage
         */
        changeSlideFontSize(value) {
            localStorage.setItem('slideFontSize', value);
        },
        /**
         * listen localstorage
         */
        localStorageChange(e) {
            const key = e.key;

            switch (key) {
                case 'bibleWindowNotification':
                    this.closeWindow();
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
                // 摩西五經
                case 3:
                    this.bookSelector = this.allBook.filter((item) => item.value < 5);
                    this.bookModel = 0;
                    break;
                // 大先知書
                case 4:
                    this.bookSelector = this.allBook.filter((item) => item.value >= 22 && item.value < 27);
                    this.bookModel = 22;
                    break;
                // 小先知書
                case 5:
                    this.bookSelector = this.allBook.filter((item) => item.value >= 27 && item.value < 39);
                    this.bookModel = 27;
                    break;
                // 四福音書
                case 6:
                    this.bookSelector = this.allBook.filter((item) => item.value >= 39 && item.value < 43);
                    this.bookModel = 39;
                    break;
            }
            this.openBibleSelector();
        },
        /**
         * listen keydown
         */
        keydown(value) {
            if (this.searchFocus || this.modalFolder) return;

            const keyfilter = [38, 40, 32];
            if (keyfilter.includes(value.keyCode)) {
                value.preventDefault();
                return false;
            }
        },
        /**
         * listen keyup (快捷鍵)
         */
        keyup(value) {
            if (this.searchFocus || this.modalFolder) return;
            this.closeBibleSelector();

            // 播放視窗打開，且為播放狀態
            if (this.biblePlayStatus && this.slideWindowOpen) {
                switch (value.keyCode) {
                    case 38: // up
                        this.controlSection(false);
                        break;
                    case 32: // space
                    case 40: // down
                        this.controlSection(true);
                        break;
                    case 37: // left
                        this.controlChapter(false);
                        break;
                    case 39: // right
                        this.controlChapter(true);
                        break;
                    default:
                        break;
                }
            }

            // 播放視窗打開
            if (this.slideWindowOpen) {
                switch (value.keyCode) {
                    case 66: // b
                        this.controlPlay(!this.biblePlayStatus);
                        break;
                    default:
                        break;
                }
            }

            switch (value.keyCode) {
                case 71: // g
                    this.openBibleSelector();
                    break;
                case 70: // f
                    this.$refs.search.focus();
                    break;
                default:
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
         * close 聖經選擇 modal
         */
        closeBibleSelector() {
            this.$bvModal.hide('modal-bible');
        },
        /**
         * 選擇書卷
         */
        setBook(index, value) {
            this.bookModel = index;
            this.bookName = value;

            this.previewList = [];
            this.nowChapter = null;

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
                    content: `<div class="mr-1 text-nowrap">${content[0]} - </div><div>${content[1]}</div>`,
                    alphaSection: this.alphaSection,
                    omegaSection: this.omegaSection,
                    mode: 'choose'
                });
                i++;
            }
            this.$bvModal.hide('modal-bible');

            this.jumpToSectionDelay();
        },
        /**
         * 延遲 跳至預覽節數位置
         */
        jumpToSectionDelay() {
            setTimeout(() => {
                this.jumpToSection();
            }, 500);
        },
        /**
         * 跳至預覽節數位置
         */
        jumpToSection() {
            const index = this.sectionModel <= 1 ? this.sectionModel : this.sectionModel - 1;
            window.location.hash = '#section_' + index;
        },
        /**
         * 開始投放
         */
        playSlide(info) {
            this.sectionModel = info.section;

            this.setBaseInfo(info);

            // 檢查視窗是否開啟，未開啟 => 開啟, return
            if (!slide || !this.slideWindowOpen) {
                this.infoMessage('請先將投影視窗拉至第二投影螢幕，按下 F11 全螢幕，並再次點選一次投影經節', 6000);
                this.openWindow();
                return;
            }

            this.controlPlay(true);

            if (info.mode === 'search' || info.mode === 'history') {
                this.bookName = this.getBookName(info.book);
                this.setPreview();
            }

            if (info.mode !== 'control' && info.mode !== 'history') {
                this.saveToHistory(info);
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

            this.totalChapter = this.countChapterAmount();
            this.totalSection = info.omegaSection - info.alphaSection;

            this.nowChapter = info.chapter;
            this.nowSection = info.section;
        },
        /**
         * 儲存至歷史
         */
        saveToHistory(info) {
            const lastItem = this.historyList[0];
            if (lastItem && info.book == lastItem.book && info.chapter == lastItem.chapter) return;

            this.historyList.unshift({
                content: this.previewList[info.section - 1].content,
                info: `${this.getBookName(info.book)},
                        ${info.chapter}章, ${info.section}節`,
                timestamp: this.getTimestamp(),
                book: info.book,
                chapter: info.chapter,
                section: info.section,
                alphaSection: info.alphaSection,
                omegaSection: info.omegaSection,
                mode: 'history'
            });

            if (this.historyList.length > 20) {
                this.historyList.pop();
            }
            this.autoSave();
        },
        /**
         * 控制投放與否
         */
        controlPlay(status = false) {
            this.biblePlayStatus = status;
            this.playBtnText = status ? '關閉' : '投放';
            this.playBtnBg = status ? 'red!important' : 'initial';
            localStorage.setItem('biblePlayStatus', status ? 1 : 0);
        },
        /**
         * 計算章數
         */
        countChapterAmount() {
            return chapter[this.bookModel + 1] - chapter[this.bookModel];
        },
        /**
         * 計算節數
         */
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
        getTimestamp() {
            const date = new Date();
            return date.getTime();
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

            this.playSlide({
                book: this.bookModel,
                chapter: this.nowChapter,
                section: 1,
                alphaSection: this.alphaSection,
                omegaSection: this.omegaSection,
                mode: 'control'
            });
        },
        /**
         * 控制上下節
         */
        controlSection(status) {
            if (status && this.nowSection < this.totalSection) this.nowSection++;
            if (!status && this.nowSection > 1) this.nowSection--;

            localStorage.setItem('bibleNowSection', this.nowSection);
            // this.sectionModel = this.nowSection;
            // this.jumpToSection();
        },
        search(keyword) {
            if (keyword === '') return;

            const options = { includeScore: true, threshold: 0.5 };
            const fuse = new Fuse(bible, options);

            const searchResult = fuse.search(keyword);

            this.reset();

            if (searchResult.length === 0) {
                this.$notify({
                    title: '警告',
                    message: '沒有結果，請重新設定條件',
                    type: 'warning'
                });
                this.bookName = '沒有結果，請重新設定條件';
                return;
            }

            if (searchResult.length > 150) {
                this.$notify({
                    title: '警告',
                    message: '搜尋結果過多，請重新設定關鍵字',
                    type: 'warning'
                });
                return;
            }

            this.setSearchList(searchResult, keyword);
            this.previewScrollToTop();
        },
        setSearchList(searchResult, keyword) {
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

                const substringIndex = content[1].indexOf(keyword);
                if (substringIndex !== -1) {
                    const contentArray = content[1].split(keyword);
                    content[1] = `${contentArray[0]}<span style="color: red;">${keyword}</span>${contentArray[1]}`;
                }

                this.previewList.push({
                    book: bookModel,
                    chapter: chapterModel,
                    section: sectionModel,
                    content: `<div class="mr-1 text-nowrap">${content[0]} - </div><div>${content[1]}</div>`,
                    alphaSection: alphaSection,
                    omegaSection: omegaSection,
                    mode: 'search'
                });
            });

            this.bookName = '搜尋結果';
        },
        clearSearchKey() {
            this.searchFocus = false;
            this.searchKey = '';
        },
        getBookName(bookIndex) {
            return this.allBook.first((item) => item.value === bookIndex).label;
        },
        /**
         * 重置
         */
        reset() {
            this.previewList = [];
            this.bookModel = null;
            this.chapterModel = null;
            this.sectionModel = null;
            this.bookName = '';
        },
        infoMessage(text, time = 6000) {
            this.$notify.info({
                title: '通知',
                message: text,
                duration: time
            });
        },
        clearList(list, listName = '', check = true) {
            if (!check) {
                this[list] = [];
                if (list === 'previewList') this.reset();
                return;
            }

            this.$confirm(`此操作將清除 ${listName}，是否繼續？`, '提示', {
                confirmButtonText: '確定',
                cancelButtonText: '取消',
                customClass: 'bible-el-message-box',
                type: 'warning'
            })
                .then(() => {
                    this[list] = [];
                    if (list === 'previewList') this.reset();
                })
                .catch(() => {});
        },
        addFolder() {
            this.searchFocus = true;
            this.$bvModal.hide('modal-folder');

            this.$prompt('請輸入新資料夾名稱', '提示', {
                confirmButtonText: '確定',
                cancelButtonText: '取消',
                customClass: 'bible-el-message-box',
                beforeClose: (action, instance, done) => {
                    if (action === 'confirm') {
                        if (instance.inputValue === null) return;
                        if (instance.inputValue === '') return;
                    }
                    done();
                }
            })
                .then(({ value }) => {
                    this.tabName = 'folder';
                    this.customizeList.push({
                        label: value,
                        list: []
                    });
                    this.searchFocus = false;
                    this.autoSave();
                })
                .catch(() => {
                    this.searchFocus = false;
                });
        },
        editFolder(index) {
            this.searchFocus = true;
            this.$prompt('修改資料夾名稱', '提示', {
                confirmButtonText: '確定',
                cancelButtonText: '取消',
                customClass: 'bible-el-message-box',
                inputValue: this.customizeList[index].label
            })
                .then(({ value }) => {
                    this.customizeList[index].label = value;
                    this.autoSave();
                })
                .catch(() => {
                    this.searchFocus = false;
                });
        },
        deleteFolder(index) {
            this.$confirm(`確定刪除 ${this.customizeList[index].label} 資料夾？`, '提示', {
                confirmButtonText: '確定',
                cancelButtonText: '取消',
                customClass: 'bible-el-message-box',
                type: 'warning'
            })
                .then(() => {
                    this.customizeList.splice(index, 1);
                    this.$notify({
                        type: 'success',
                        title: '成功',
                        message: '删除成功!'
                    });

                    this.autoSave();
                })
                .catch(() => {});
        },
        intoFolder(index) {
            this.customizeSelected = index;
            this.customLayer = false;
            this.tabName = 'folder';
            this.$bvModal.hide('modal-folder');

            if (this.itemCache) {
                this.addBibleInfoToFolder(this.itemCache);
                this.itemCache = null;
            }
        },
        backToFolder() {
            this.customLayer = true;
            this.customizeSelected = null;
        },
        folderTransition() {
            return this.customLayer ? 'left-transform' : 'right-transform';
        },
        /**
         * 加入項目到資料夾裡
         */
        addBibleInfoToFolder(item) {
            this.tabName = 'folder';
            if (this.customLayer) {
                if (this.customizeList.length == 0) {
                    this.addFolder();
                    this.$notify.info({
                        title: '通知',
                        message: '請先建立資料夾'
                    });
                    return;
                }

                this.$notify.warning({
                    title: '消息',
                    message: '請先進入想要儲存的資料夾'
                });
                this.$bvModal.show('modal-folder');
                this.itemCache = item;
                return;
            }

            this.$notify.success({
                title: '成功',
                message: `${this.getBookName(item.book)}, ${item.chapter}章, ${item.section}節 加入 ${
                    this.customizeList[this.customizeSelected].label
                } 資料夾`
            });

            this.customizeList[this.customizeSelected].list.push({
                content: item.content,
                info: `${this.getBookName(item.book)},
                        ${item.chapter}章, ${item.section}節`,
                timestamp: this.getTimestamp(),
                book: item.book,
                chapter: item.chapter,
                section: item.section,
                alphaSection: item.alphaSection,
                omegaSection: item.omegaSection,
                mode: 'history'
            });

            this.autoSave();
        },
        saveFolderToLocal() {
            localStorage.setItem('bible-folder', JSON.stringify(this.customizeList));
            this.$notify.success({
                title: '通知',
                message: '已經儲存列表'
            });
        },
        clearFolderList() {
            if (this.customizeList.length === 0) return;

            this.$confirm(`確定刪除所有資料夾？`, '提示', {
                confirmButtonText: '確定',
                cancelButtonText: '取消',
                customClass: 'bible-el-message-box',
                type: 'warning'
            })
                .then(() => {
                    this.customLayer = true;
                    this.customizeSelected = null;
                    this.customizeList = [];
                    localStorage.removeItem('bible-folder');
                })
                .catch(() => {});
        },
        /**
         * 預覽區快速跳章
         */
        controlPreviewChapter(status) {
            if (!this.chapterModel) return;

            const chapter = status ? this.chapterModel + 1 : this.chapterModel - 1;

            if (chapter === 0) return;
            if (chapter > this.countChapterAmount()) return;

            this.setChapter(chapter);
            this.countSectionAmount();
            this.setSection(1);
        },
        /**
         * 監控folder sub list 是否拖曳增加
         */
        folderSubLog() {
            this.autoSave();
        },
        /**
         * auto save folder
         */
        autoSave() {
            if (autoSaveTimer.status) {
                autoSaveTimer.time = 0;
                return;
            }

            autoSaveTimer.status = true;
            autoSaveTimer.clock = setInterval(() => {
                autoSaveTimer.time++;
                if (autoSaveTimer.time >= 15) {
                    window.clearInterval(autoSaveTimer.clock);
                    autoSaveTimer.time = 0;
                    autoSaveTimer.status = false;

                    localStorage.setItem('bible-folder', JSON.stringify(this.customizeList));
                    localStorage.setItem(
                        'bible-history-list',
                        JSON.stringify({
                            list: this.historyList,
                            time: this.getTimestamp()
                        })
                    );
                }
            }, 1000);
        },
        /**
         * 回朔 folder
         */
        recallFolder() {
            if (localStorage.getItem('bible-folder'))
                this.customizeList = JSON.parse(localStorage.getItem('bible-folder'));
        },
        /**
         * 回朔 histroy
         */
        recallHistory() {
            let history = localStorage.getItem('bible-history-list');
            if (!history) return;

            history = JSON.parse(history);
            // one hour
            if (history.time + 3600000 < this.getTimestamp()) {
                localStorage.removeItem('bible-history-list');
                return;
            }
            this.historyList = history.list;
        }
    }
};
</script>

<style lang="scss" scoped>
@import '@/assets/css/main.scss';

.bible-control {
    background-color: $mainBackground;
    color: $mainText;
    min-width: 1366px;
}

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

.selector-button {
    width: 68px;
    height: 68px;
    font-size: 20px;
    padding: 10px 10px;
}

.preview-wrapper {
    height: calc(100% - 3rem);
    overflow-y: scroll;
    font-size: 24px;
}

.preview-content {
    padding-bottom: 90vh !important;
}

.box-bk {
    background-color: $secondBackground;
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
    background-color: rgb(255, 255, 255) !important;
    color: #000000;
}

.button-select {
    background-color: #777777 !important;
    opacity: 1;
}

.history {
    height: 65%;
    font-size: 20px;
}

.button-action {
    font-size: 1.2rem;
}

.setting-icon {
    font-size: 28px;
}

.question-tooltip {
    padding: 5px;
    font-size: 25px;
    color: $text !important;
}

.folder-wrapper {
    font-size: 24px;
}

.folder-item-empty-area {
    border: 1px dashed #ffffff;
}

.folder-item-empty-area::after {
    content: '請加入經文';
    padding: 5px;
    width: 100%;
    font-size: 20px;
    display: flex;
    justify-content: center;
}

.list-handle {
    -webkit-transition: 0.2s ease-in-out;
    -moz-transition: 0.2s ease-in-out;
    -o-transition: 0.2s ease-in-out;
    transition: 0.2s ease-in-out;
}

.list-handle:hover {
    margin-top: 7px;
    transform: scale(1.2);
}

// layout
.header {
    background-color: $secondBackground;
}
</style>

<style lang="scss">
@import '@/assets/css/main.scss';

.bible-selector-modal-content {
    color: $text;
    background-color: $mainBackground !important;
}

.bible-el-message-box {
    border: 1px solid $thirdBackground !important;
    background-color: $secondBackground !important;

    .el-message-box__header > div {
        color: $mainText !important;
    }

    .el-message-box__content {
        color: $mainText !important;

        .el-message-box__input > .el-input > input {
            background-color: $mainBackground !important;
            border: 1px solid $borderColor !important;
            color: $text !important;
        }
    }
}

.bible-flip-list-move {
    transition: transform 0.5s;
}
</style>
