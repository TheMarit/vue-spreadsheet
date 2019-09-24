import VueThead from '../Thead/index.vue';
import VueTbody from '../Tbody/index.vue';
import vueTableHelper from './helpers';

const Fuse = require('fuse.js');

export default {
  name: 'VueTable',
  props: {
    headers: {
      type: Array,
      required: true,
    },
    tbodyData: {
      type: Array,
      required: true,
    },
    customOptions: {
      type: Object,
      required: true,
    },
    styleWrapVueTable: {
      type: Object,
      required: true,
    },
    submenuThead: {
      type: Array,
      required: true,
    },
    disableSortThead: {
      type: Array,
      required: true,
    },
    loading: {
      type: Boolean,
      required: true,
    },
    selectPosition: {
      type: Object,
      required: true,
    },
    parentScrollElement: {
      type: Object,
      required: true,
    },
    disableCells: {
      type: Array,
      required: false,
    },
    submenuTbody: {
      type: Array,
      required: false,
    },
  },
  components: {
    VueThead,
    VueTbody,
  },
  data() {
    return {
      customTable: 0,
      changeDataIncrement: 0,
      disableKeyTimeout: null,
      eventDrag: false,
      headerTop: 0,
      highlight: {
        tbody: [],
        thead: [],
      },
      incrementCol: 0,
      incrementOption: null,
      incrementRow: null,
      keys: {},
      lastSelectOpen: null,
      lastSubmenuOpen: null,
      oldTdActive: null,
      oldTdShow: null,
      pressedShift: 0,
      rectangleSelectedCell: null,
      scrollDocument: null,
      scrollToSelectTimeout: null,
      selectedCell: null,
      selectedCoordCells: null,
      selectedCoordCopyCells: null,
      selectedMultipleCell: false,
      selectedMultipleCellActive: false,
      setFirstCell: false,
      storeCopyDatas: [],
      storeRectangleSelection: [],
      storeUndoData: [],
      submenuStatusTbody: false,
      submenuStatusThead: false,
    };
  },
  created() {
    this.customTable = Date.now();
  },
  mounted() {
    this.createdCell();
    window.addEventListener('keydown', this.moveKeydown);
    window.addEventListener('keyup', this.moveKeyup);
    document.addEventListener('copy', (event) => {
      if (this.actualElement) {
        event.preventDefault();
        this.storeCopyDatas = [];
        this.copyStoreData('copy');
      }
    });
    document.addEventListener('paste', (event) => {
      if (this.storeCopyDatas.length > 0) {
        event.preventDefault();
        this.pasteReplaceData();
      }
    });
    document.addEventListener('scroll', (event) => {
      this.scrollTopDocument(event);
    });
    // set property of triangle bg comment
    vueTableHelper(this).setPropertyStyleOfComment();
  },
  watch: {
    tbodyData() {
      this.createdCell();
    },
    headers() {
      this.createdCell();
    },
  },
  computed: {
    checkedRows() {
      return this.tbodyData.filter(x => x.checked);
    },
    colHeaderWidths() {
      return this.headers.map(x => parseInt(x.style.width, 10));
    },
    filteredList() {
      if (this.lastSelectOpen) {
        const { selectOptions } = this.lastSelectOpen.col;
        const { searchValue } = this.lastSelectOpen;
        const fuseSearch = new Fuse(selectOptions, this.customOptions.fuseOptions);
        if (searchValue && searchValue.length > 1) {
          return fuseSearch.search(searchValue);
        }
        return this.sorter(selectOptions);
      }
      return [];
    },
    headerKeys() {
      return this.headers.map(header => header.headerKey);
    },
  },
  methods: {
    checkedRow(row) {
      vueTableHelper(this).checkedRow(row);
    },
    highlightTdAndThead(rowIndex, colIndex) {
      vueTableHelper(this).highlightTdAndThead(rowIndex, colIndex);
    },
    changeData(rowIndex, header) {
      vueTableHelper(this).changeData(rowIndex, header);
    },
    rollBackUndo() {
      vueTableHelper(this).rollBackUndo();
    },
    clearStoreUndo() {
      vueTableHelper(this).clearStoreUndo();
    },
    sorter(options) {
      vueTableHelper(this).sorter(options);
    },
    cleanPropertyOnCell(action) {
      vueTableHelper(this).cleanPropertyOnCell(action);
    },
    cleanProperty(element) {
      vueTableHelper(this).cleanProperty(element);
    },
    createdCell() {
      vueTableHelper(this).createdCell();
    },
    scrollFunction(event) {
      vueTableHelper(this).scrollFunction(event);
    },
    scrollTopDocument(event) {
      vueTableHelper(this).scrollTopDocument(event);
    },
    affixHeader(offset, target) {
      vueTableHelper(this).affixHeader(offset, target);
    },
    updateSelectedCell(header, rowIndex, colIndex) {
      vueTableHelper(this).updateSelectedCell(header, rowIndex, colIndex);
    },
    activeSelectSearch(event, rowIndex, colIndex) {
      vueTableHelper(this).activeSelectSearch(event, rowIndex, colIndex);
    },
    enableSelect(event, header, col, rowIndex, colIndex) {
      vueTableHelper(this).enableSelect(event, header, col, rowIndex, colIndex);
    },
    handleSearchInputSelect(event, searchValue, col, header, rowIndex, colIndex) {
      vueTableHelper(this).handleSearchInputSelect(event, searchValue, col, header, rowIndex, colIndex);
    },
    showDropdown(colIndex, rowIndex) {
      vueTableHelper(this).showDropdown(colIndex, rowIndex);
    },
    handleTbodySelectChange(event, header, col, option, rowIndex, colIndex) {
      vueTableHelper(this).handleTbodySelectChange(event, header, col, option, rowIndex, colIndex);
    },
    calculPosition(event, rowIndex, colIndex, header) {
      vueTableHelper(this).calculPosition(event, rowIndex, colIndex, header);
    },
    setOldValueOnInputSelect(col, rowIndex, header, colIndex, type) {
      vueTableHelper(this).setOldValueOnInputSelect(col, rowIndex, header, colIndex, type);
    },
    handleUpDragSizeHeader(event, headers) {
      vueTableHelper(this).handleUpDragSizeHeader(event, headers);
    },
    enableSubmenu(target) {
      vueTableHelper(this).enableSubmenu(target);
    },
    bindClassActiveOnTd(header, rowIndex, colIndex) {
      vueTableHelper(this).bindClassActiveOnTd(header, rowIndex, colIndex);
    },
    removeClass(params) {
      vueTableHelper(this).removeClass(params);
    },
    // Copy / Paste
    copyStoreData(params) {
      vueTableHelper(this).copyStoreData(params);
    },
    pasteReplaceData() {
      vueTableHelper(this).pasteReplaceData();
    },
    replacePasteData(col, header, incrementRow, currentHeader) {
      vueTableHelper(this).replacePasteData(col, header, incrementRow, currentHeader);
    },
    modifyMultipleCell(params) {
      vueTableHelper(this).modifyMultipleCell(params);
    },
    setRectangleSelection(colMin, colMax, rowMin, rowMax) {
      vueTableHelper(this).setRectangleSelection(colMin, colMax, rowMin, rowMax);
    },
    // drag To Fill
    handleDownDragToFill(event, header, col, rowIndex) {
      vueTableHelper(this).handleDownDragToFill(event, header, col, rowIndex);
    },
    handleMoveDragToFill(event, header, col, rowIndex, colIndex) {
      vueTableHelper(this).handleMoveDragToFill(event, header, col, rowIndex, colIndex);
    },
    handleUpDragToFill(event, header, rowIndex, colIndex) {
      vueTableHelper(this).handleUpDragToFill(event, header, rowIndex, colIndex);
    },
    // On click on td
    handleTbodyTdClick(event, col, header, rowIndex, colIndex, type) {
      vueTableHelper(this).handleTbodyTdClick(event, col, header, rowIndex, colIndex, type);
    },
    handleSelectMultipleCell(event, header, rowIndex, colIndex) {
      vueTableHelper(this).handleSelectMultipleCell(event, header, rowIndex, colIndex);
    },
    handleTbodyTdDoubleClick(event, header, col, rowIndex, colIndex) {
      vueTableHelper(this).handleSelectMultipleCell(event, header, rowIndex, colIndex);
    },
    handleTbodyNav() {
      this.enableSubmenu();
    },
    handleTbodyNavEnter() {
      this.enableSubmenu();
    },
    handleTbodyNavBackspace(rowIndex, colIndex, header) {
      vueTableHelper(this).handleTbodyNavBackspace(rowIndex, colIndex, header);
    },
    handleTbodyInputChange(event, header, rowIndex, colIndex) {
      vueTableHelper(this).handleTbodyInputChange(event, header, rowIndex, colIndex);
    },
    callbackCheckedAll(isChecked) {
      vueTableHelper(this).callbackCheckedAll(isChecked);
    },
    callbackSort(event, header, colIndex) {
      this.$emit('thead-td-sort', event, header, colIndex);
    },
    callbackSubmenuThead(event, header, colIndex, submenuFunction, selectOptions) {
      vueTableHelper(this).callbackSubmenuThead(event, header, colIndex, submenuFunction, selectOptions);
    },
    callbackSubmenuTbody(event, header, rowIndex, colIndex, type, submenuFunction) {
      vueTableHelper(this).callbackSubmenuTbody(event, header, rowIndex, colIndex, type, submenuFunction);
    },
    handleTBodyContextMenu(event, header, rowIndex, colIndex) {
      vueTableHelper(this).handleTBodyContextMenu(event, header, rowIndex, colIndex);
    },
    // thead
    handleTheadContextMenu() {
      this.submenuStatusTbody = false;
    },
    moveOnSelect(event) {
      vueTableHelper(this).moveOnSelect(event);
    },
    moveOnTable(event, colIndex, rowIndex) {
      vueTableHelper(this).moveOnTable(event, colIndex, rowIndex);
    },
    pressShiftMultipleCell(event, h, rowMax, rowIndex, colMax, colIndex) {
      vueTableHelper(this).pressShiftMultipleCell(event, h, rowMax, rowIndex, colMax, colIndex);
    },
    moveKeyup(event) {
      vueTableHelper(this).moveKeyup(event);
    },
    moveKeydown(event) {
      vueTableHelper(this).moveKeydown(event);
    },
  },
};
