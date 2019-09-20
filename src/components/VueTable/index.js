import VueThead from '../Thead/index.vue';
import VueTbody from '../Tbody/index.vue';
import {
  checkedRow,
  highlightTdAndThead,
  setPropertyStyleOfComment,
  copyStoreData,
  pasteReplaceData,
  handleDownDragToFill,
  handleMoveDragToFill,
  handleUpDragToFill,
  moveOnSelect,
  moveOnTable,
  pressShiftMultipleCell,
  moveKeyup,
  moveKeydown,
} from './helpers';

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
    window.$VueTable = this;
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
    this.setPropertyStyleOfComment();
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
      checkedRow(row);
    },
    highlightTdAndThead(rowIndex, colIndex) {
      highlightTdAndThead(rowIndex, colIndex);
    },
    setPropertyStyleOfComment() {
      setPropertyStyleOfComment();
    },
    changeData(rowIndex, header) {
      const cell = this.tbodyData[rowIndex][header];
      this.changeDataIncrement += 1;
      this.storeUndoData.push({ rowIndex, header, cell });
      this.$emit('tbody-change-data', rowIndex, header);
    },
    rollBackUndo() {
      if (this.storeUndoData.length && this.changeDataIncrement > 0) {
        const index = this.changeDataIncrement - 1;
        const store = this.storeUndoData[index];

        this.$emit('tbody-undo-data', store.rowIndex, store.header);
        this.tbodyData[store.rowIndex][store.header] = store.cell.duplicate;
        this.storeUndoData.splice(index, 1);
        this.changeDataIncrement -= 1;
      }
    },
    clearStoreUndo() {
      this.changeDataIncrement = 0;
      this.storeUndoData = [];
    },
    sorter(options) {
      return options.sort((a, b) => {
        const productA = a.value;
        const productB = b.value;
        if (productA === undefined && productB) return 1;
        if (productA && productB === undefined) return -1;
        if (productA < productB) return -1;
        if (productA > productB) return 1;
        return 0;
      });
    },
    cleanPropertyOnCell(action) {
      if (this.storeRectangleSelection.length > 0) {
        this.storeRectangleSelection.forEach((cell) => {
          if (action === 'paste' && !cell.classList.value.includes('rectangleSelection') && !cell.classList.value.includes('copy')) {
            this.cleanProperty(cell);
          } else if (action === 'copy' && !cell.classList.value.includes('selected')) {
            this.cleanProperty(cell);
          }
        });
      }
    },
    cleanProperty(element) {
      element.style.setProperty('--rectangleWidth', '100%');
      element.style.setProperty('--rectangleHeight', '40px');
      element.style.setProperty('--rectangleTop', 0);
      element.style.setProperty('--rectangleBottom', 0);
    },
    createdCell() {
      // create cell if isn't exist
      this.tbodyData.forEach((tbody, rowIndex) => {
        if (this.customOptions.tbodyCheckbox && !tbody.vuetable_checked) {
          this.$set(this.tbodyData[rowIndex], 'vuetable_checked', false);
        }
        this.headerKeys.forEach((header) => {
          if (!tbody[header]) {
            const data = JSON.parse(JSON.stringify(this.customOptions.newData));
            this.$set(this.tbodyData[rowIndex], header, data);
          } else if (!tbody[header].type && 'value' in tbody[header]) {
            const data = JSON.parse(JSON.stringify(this.customOptions.newData));
            const copyTbody = JSON.parse(JSON.stringify(tbody[header]));
            copyTbody.type = data.type;
            this.$set(this.tbodyData[rowIndex], header, copyTbody);
          }
          const copy = JSON.parse(JSON.stringify(this.tbodyData[rowIndex][header]));
          this.$set(this.tbodyData[rowIndex][header], 'duplicate', copy);
        });
      });
    },
    disabledEvent(col, header) {
      if (col.disabled === undefined) {
        return !this.disableCells.find(x => x === header);
      }
      if (col.disabled) {
        return !col.disabled;
      }
      return true;
    },
    scrollFunction(event) {
      this.affixHeader(event, 'vueTable');

      if (this.lastSelectOpen) {
        this.calculPosition(this.lastSelectOpen.event, this.lastSelectOpen.rowIndex, this.lastSelectOpen.colIndex, 'dropdown');
      } else if (this.lastSubmenuOpen) {
        this.calculPosition(this.lastSubmenuOpen.event, this.lastSubmenuOpen.rowIndex, this.lastSubmenuOpen.colIndex, 'contextMenu');
      }
    },
    scrollTopDocument(event) {
      this.affixHeader(event, 'document');

      if (this.lastSelectOpen) {
        this.calculPosition(event, this.lastSelectOpen.rowIndex, this.lastSelectOpen.colIndex, 'dropdown');
      } else if (this.lastSubmenuOpen) {
        this.calculPosition(event, this.lastSubmenuOpen.rowIndex, this.lastSubmenuOpen.colIndex, 'contextMenu');
      }
    },
    affixHeader(offset, target) {
      if (this.$refs && this.$refs[`${this.customTable}-table`] && this.$refs[`${this.customTable}-table`].offsetTop) {
        this.scrollDocument = document.querySelector(`${this.parentScrollElement.attribute}`).scrollTop;
        const offsetTopVueTable = this.$refs[`${this.customTable}-table`].offsetTop;
        const scrollOnDocument = this.scrollDocument || target === 'document';
        const offsetEl = scrollOnDocument ? this.scrollDocument : offset.target.scrollTop;

        if (offsetEl > offsetTopVueTable) {
          this.headerTop = scrollOnDocument ? (offsetEl - offsetTopVueTable) : (offsetEl - 18);
        } else {
          this.headerTop = 0;
        }
      }
    },
    updateSelectedCell(header, rowIndex, colIndex) {
      if (!this.setFirstCell) {
        this.$set(this.tbodyData[rowIndex][header], 'rectangleSelection', true);
        this.setFirstCell = true;
      }
      this.selectedCell = {
        header,
        row: rowIndex,
        col: colIndex,
      };
      // highlight selected row and column
      this.highlightTdAndThead(rowIndex, colIndex);
    },
    activeSelectSearch(event, rowIndex, colIndex) {
      this.calculPosition(event, rowIndex, colIndex, 'dropdown');
      if (this.$refs[`${this.customTable}-vueTbody`].$refs[`input-${this.customTable}-${colIndex}-${rowIndex}`][0]) {
        this.$refs[`${this.customTable}-vueTbody`].$refs[`input-${this.customTable}-${colIndex}-${rowIndex}`][0].focus();
      }
    },
    enableSelect(event, header, col, rowIndex, colIndex) {
      const currentElement = this.tbodyData[rowIndex][header];
      if (!col.search) {
        this.removeClass(['search', 'show']);
        this.lastSelectOpen = {
          col,
          colIndex,
          event,
          header,
          rowIndex,
        };

        this.$set(currentElement, 'search', true);
        this.$set(currentElement, 'show', true);

        this.$refs[`${this.customTable}-vueTbody`].$refs[`input-${this.customTable}-${colIndex}-${rowIndex}`][0].focus();
        this.calculPosition(event, rowIndex, colIndex, 'dropdown');

        if (currentElement.value !== '') {
          this.showDropdown(colIndex, rowIndex);
          const index = currentElement.selectOptions.map(x => x.value).indexOf(currentElement.value);
          this.incrementOption = index;
        } else {
          this.incrementOption = 0;
        }
      } else {
        this.$set(currentElement, 'search', false);
        this.$set(currentElement, 'show', false);
        this.lastSelectOpen = null;
      }
    },
    handleSearchInputSelect(event, searchValue, col, header, rowIndex, colIndex) {
      const disableSearch = !(searchValue === '' && event.keyCode === 8);

      if ((!this.keys.cmd || !this.keys.ctrl)
        && disableSearch
        && event.keyCode !== 13
        && event.keyCode !== 16
        && event.keyCode !== 17
        && event.keyCode !== 27
        && event.keyCode !== 37
        && event.keyCode !== 38
        && event.keyCode !== 39
        && event.keyCode !== 40
        && event.keyCode !== 91) {
        if (this.lastSelectOpen) {
          this.$set(this.lastSelectOpen, 'searchValue', searchValue);
        } else {
          this.lastSelectOpen = {
            event,
            header,
            col,
            rowIndex,
            colIndex,
            searchValue,
          };
        }

        // active class
        if (event.keyCode !== 8) {
          const currentData = this.tbodyData[rowIndex][header];
          this.$set(currentData, 'search', true);
          this.$set(currentData, 'show', true);

          this.showDropdown(colIndex, rowIndex);
        }
        this.incrementOption = 0;
      }
    },
    showDropdown(colIndex, rowIndex) {
      // clear timeout
      if (this.$refs[`${this.customTable}-vueTbody`].$refs[`dropdown-${this.customTable}-${colIndex}-${rowIndex}`]) {
        const dropdown = this.$refs[`${this.customTable}-vueTbody`].$refs[`dropdown-${this.customTable}-${colIndex}-${rowIndex}`][0];
        if (!this.scrollToSelectTimeout === null) {
          clearTimeout(this.scrollToSelectTimeout);
        }
        // set scrollTop on select
        this.scrollToSelectTimeout = setTimeout(() => {
          dropdown.scrollTop = 45 * this.incrementOption;
          this.scrollToSelectTimeout = null;
        }, 100);
      }
    },
    handleTbodySelectChange(event, header, col, option, rowIndex, colIndex) {
      const currentData = this.tbodyData[rowIndex][header];
      currentData.selectOptions.forEach((selectOption) => {
        const sOption = selectOption;
        sOption.active = false;
      });
      currentData.selectOptions.find(x => x.value === option.value).active = true;

      this.$set(currentData, 'search', false);
      this.$set(currentData, 'show', false);
      this.$set(currentData, 'value', option.value);

      this.lastSelectOpen = null;
      // remove class show on select when it change
      if (this.oldTdShow) this.tbodyData[this.oldTdShow.row][this.oldTdShow.key].show = false;
      this.enableSubmenu();
      // callback
      this.$emit('tbody-select-change', event, header, col, option, rowIndex, colIndex);
      this.changeData(rowIndex, header);
    },
    calculPosition(event, rowIndex, colIndex, header) {
      // stock scrollLeft / scrollTop position of parent
      const { scrollLeft } = this.$refs[`${this.customTable}-vueTable`];
      const { scrollTop } = this.$refs[`${this.customTable}-vueTable`];

      // get offsetTop of firstCell
      const firstCellOffsetTop = this.$refs[`${this.customTable}-vueTbody`].$refs[`td-${this.customTable}-0-0`][0].offsetTop;
      // stock $el
      const el = this.$refs[`${this.customTable}-vueTbody`].$refs[`td-${this.customTable}-${colIndex}-${rowIndex}`][0];
      // stock height Of VueTable
      const realHeightTable = this.$refs[`${this.customTable}-vueTable`].offsetHeight;
      // stock size / offsetTop / offsetLeft of the element
      const width = el.offsetWidth;
      // stock heightOfScrollbar(40) cell(40) dropdown(140)
      const heightOfScrollbarCellDropdown = 180;

      let top = ((el.offsetTop - scrollTop) + 40) - this.parentScrollElement.positionTop;
      let left = el.offsetLeft - scrollLeft;

      if (this.selectPosition) {
        top = (((el.offsetTop - scrollTop) + 40) + this.selectPosition.top) - this.parentScrollElement.positionTop;
        left = (el.offsetLeft - scrollLeft) + this.selectPosition.left;
      }

      // subtracted top of scroll top document
      if (this.scrollDocument) {
        top = (((el.offsetTop - scrollTop) + 40) - this.parentScrollElement.positionTop) - this.scrollDocument;
      }

      // set size / top position / left position
      const currentSelect = this.$refs[`${this.customTable}-vueTbody`].$refs[`${header}-${this.customTable}-${colIndex}-${rowIndex}`];
      if (currentSelect && currentSelect.length > 0) {
        currentSelect[0].style.setProperty('--selectWidth', `${width}px`);
        currentSelect[0].style.setProperty('--selectLeft', `${left}px`);

        if ((realHeightTable + firstCellOffsetTop) < (el.offsetTop + 250)) {
          currentSelect[0].style.setProperty('--selectTop', `${top - heightOfScrollbarCellDropdown}px`);
        } else {
          currentSelect[0].style.setProperty('--selectTop', `${top}px`);
        }
      }
    },
    setOldValueOnInputSelect(col, rowIndex, header, colIndex, type) {
      const column = col;
      column.show = false;
      this.$set(this.tbodyData[rowIndex][header], 'value', this.tbodyData[rowIndex][header].value);
      if (type === 'select') {
        column.search = false;
      }
    },
    handleUpDragSizeHeader(event, headers) {
      this.$emit('handle-up-drag-size-header', event, headers);
    },
    enableSubmenu(target) {
      if (target === 'thead') {
        this.submenuStatusThead = true;
        this.submenuStatusTbody = false;
      } else if (target === 'tbody') {
        this.submenuStatusThead = false;
        this.submenuStatusTbody = true;
      } else {
        this.submenuStatusThead = false;
        this.submenuStatusTbody = false;
      }
    },
    bindClassActiveOnTd(header, rowIndex, colIndex) {
      this.removeClass(['active', 'show']);
      this.tbodyData[rowIndex][header].active = true;
      // stock oldTdActive in object
      this.oldTdActive = {
        key: header,
        row: rowIndex,
        col: colIndex,
      };
    },
    removeClass(params) {
      if (params.includes('selected')) {
        this.selectedMultipleCellActive = false;
      }
      params.forEach((param) => {
        this.tbodyData.forEach((data, index) => {
          Object.keys(data).forEach((key) => {
            if (this.tbodyData[index] && this.tbodyData[index][key] && this.tbodyData[index][key][param] === true) {
              this.tbodyData[index][key][param] = false;
            }
          });
          if (param === 'rectangleSelection') {
            this.setFirstCell = false;
          }
        });
      });
    },
    // Copy / Paste
    copyStoreData(params) {
      copyStoreData(params);
    },
    pasteReplaceData() {
      pasteReplaceData();
    },
    replacePasteData(col, header, incrementRow, currentHeader) {
      const newCopyData = JSON.parse(JSON.stringify(this.storeCopyDatas));
      newCopyData[col][header].duplicate = this.tbodyData[incrementRow][currentHeader].duplicate;
      this.tbodyData[incrementRow][currentHeader] = newCopyData[col][header];
      this.changeData(incrementRow, currentHeader);
    },
    modifyMultipleCell(params) {
      let rowMin = Math.min(this.selectedCoordCells.rowStart, this.selectedCoordCells.rowEnd);
      const rowMax = Math.max(this.selectedCoordCells.rowStart, this.selectedCoordCells.rowEnd);
      let colMin = Math.min(this.selectedCoordCells.colStart, this.selectedCoordCells.colEnd);
      const colMax = Math.max(this.selectedCoordCells.colStart, this.selectedCoordCells.colEnd);

      while (rowMin <= rowMax) {
        const header = this.headerKeys[colMin];
        // disable on disabled cell
        if (params === 'removeValue' && this.disabledEvent(this.tbodyData[rowMin][header], header)) {
          this.$emit('tbody-nav-backspace', rowMin, colMin, header, this.tbodyData[rowMin][header]);
          this.changeData(rowMin, header);
          this.$set(this.tbodyData[rowMin][header], 'value', '');
          this.$set(this.tbodyData[rowMin][header], 'selected', false);
        }
        if (params === 'selected') {
          this.$set(this.tbodyData[rowMin][header], 'selected', true);
          this.selectedMultipleCellActive = true;
          if (colMin === colMax && rowMin === rowMax) {
            // add active on the last cell
            this.removeClass(['active']);
            this.$set(this.tbodyData[rowMin][header], 'active', true);
          }
        }
        colMin += 1;
        if (colMin > colMax) {
          colMin = Math.min(this.selectedCoordCells.colStart, this.selectedCoordCells.colEnd);
          rowMin += 1;
        }
      }

      // Set height / width of rectangle
      this.setRectangleSelection(colMin, colMax, rowMin, rowMax);
    },
    setRectangleSelection(colMin, colMax, rowMin, rowMax) {
      let width = 100;
      let height = 40;

      // Defined width of rectangle
      if (colMin === 0 && colMax === 0) {
        width = 100 * (colMin + 1);
      } else if (colMin === 0 && colMax > 0) {
        width = 100 * (colMax + 1);
      } else {
        width = 100 * ((colMax - colMin) + 1);
      }

      // Defined height of rectangle
      if ((rowMin === 0 && rowMax === 0) || (rowMin === 0 && rowMax > 0)) {
        height = 40 * (rowMin + 1);
      } else if (this.selectedCoordCells.rowEnd > this.selectedCoordCells.rowStart) {
        height = 40 * ((this.selectedCoordCells.rowEnd - this.selectedCoordCells.rowStart) + 1);
      } else {
        height = 40 * ((this.selectedCoordCells.rowStart - this.selectedCoordCells.rowEnd) + 1);
      }

      if (this.$refs[`${this.customTable}-vueTbody`] && this.$refs[`${this.customTable}-vueTbody`].$refs) {
        [this.rectangleSelectedCell] = this.$refs[`${this.customTable}-vueTbody`].$refs[`td-${this.customTable}-${this.selectedCoordCells.colStart}-${this.selectedCoordCells.rowStart}`];

        if (!this.selectedMultipleCellActive) {
          [this.rectangleSelectedCell] = this.$refs[`${this.customTable}-vueTbody`].$refs[`td-${this.customTable}-${this.selectedCell.col}-${this.selectedCell.row}`];
        }
      }

      this.rectangleSelectedCell.style.setProperty('--rectangleWidth', `${width + 1}%`);
      this.rectangleSelectedCell.style.setProperty('--rectangleHeight', `${height}px`);

      // Position bottom/top of rectangle if rowStart >= rowEnd
      if (this.selectedCoordCells.rowStart >= this.selectedCoordCells.rowEnd) {
        this.rectangleSelectedCell.style.setProperty('--rectangleTop', 'auto');
        this.rectangleSelectedCell.style.setProperty('--rectangleBottom', 0);
      } else {
        this.rectangleSelectedCell.style.setProperty('--rectangleTop', 0);
        this.rectangleSelectedCell.style.setProperty('--rectangleBottom', 'auto');
      }
      // Position left/right of rectangle if colStart >= colEnd
      if (this.selectedCoordCells.colStart >= this.selectedCoordCells.colEnd) {
        this.rectangleSelectedCell.style.setProperty('--rectangleLeft', 'auto');
        this.rectangleSelectedCell.style.setProperty('--rectangleRight', 0);
      } else {
        this.rectangleSelectedCell.style.setProperty('--rectangleLeft', 0);
      }

      if (!this.storeRectangleSelection.includes(this.rectangleSelectedCell)) {
        this.storeRectangleSelection.push(this.rectangleSelectedCell);
      }
    },
    // drag To Fill
    handleDownDragToFill(event, header, col, rowIndex) {
      handleDownDragToFill(event, header, col, rowIndex);
    },
    handleMoveDragToFill(event, header, col, rowIndex, colIndex) {
      handleMoveDragToFill(event, header, col, rowIndex, colIndex);
    },
    handleUpDragToFill(event, header, rowIndex, colIndex) {
      handleUpDragToFill(event, header, rowIndex, colIndex);
    },
    // On click on td
    handleTbodyTdClick(event, col, header, rowIndex, colIndex, type) {
      const column = col;

      if (this.selectedMultipleCell) {
        this.selectedMultipleCell = false;
      }

      if (!column.active) {
        if (!this.keys[16]) {
          this.removeClass(['selected', 'rectangleSelection']);
        }
        this.removeClass(['search']);
        this.lastSelectOpen = null;
      }
      this.bindClassActiveOnTd(header, rowIndex, colIndex);

      this.updateSelectedCell(header, rowIndex, colIndex);

      this.enableSubmenu();
      if (this.oldTdShow && this.oldTdShow.col !== colIndex) {
        this.tbodyData[this.oldTdShow.row][this.oldTdShow.key].show = false;
      }

      if (type === 'select' && column.handleSearch) {
        this.activeSelectSearch(event, rowIndex, colIndex, header);
      }
    },
    handleSelectMultipleCell(event, header, rowIndex, colIndex) {
      if (!this.selectedMultipleCellActive) {
        this.selectedMultipleCell = true;
        if (this.selectedCell) {
          this.selectedCoordCells = {
            rowStart: this.selectedCell.row,
            colStart: this.selectedCell.col,
            keyStart: this.selectedCell.header,
            rowEnd: rowIndex,
            colEnd: colIndex,
            keyEnd: header,
          };
        }
        // Add active on selectedCoordCells selected
        this.modifyMultipleCell('selected');

        // highlight row and column of selected cell
        this.highlightTdAndThead(rowIndex, colIndex);
      }
    },
    handleTbodyTdDoubleClick(event, header, col, rowIndex, colIndex) {
      // stock oldTdShow in object
      if (this.oldTdShow) this.tbodyData[this.oldTdShow.row][this.oldTdShow.key].show = false;

      // add class show on element
      this.$set(this.tbodyData[rowIndex][header], 'show', true);
      event.currentTarget.lastElementChild.focus();

      this.oldTdShow = {
        key: header,
        row: rowIndex,
        col: colIndex,
      };

      this.enableSubmenu();
    },
    handleTbodyNav() {
      this.enableSubmenu();
    },
    handleTbodyNavEnter() {
      this.enableSubmenu();
    },
    handleTbodyNavBackspace(rowIndex, colIndex, header) {
      if (this.selectedMultipleCell) {
        this.modifyMultipleCell('removeValue');
      } else {
        this.$emit('tbody-nav-backspace', rowIndex, colIndex, header, this.tbodyData[rowIndex][header]);
        this.changeData(rowIndex, header);
        this.tbodyData[rowIndex][header].value = '';
      }
    },
    handleTbodyInputChange(event, header, rowIndex, colIndex) {
      // remove class show on input when it change
      if (this.oldTdShow) this.tbodyData[this.oldTdShow.row][this.oldTdShow.key].show = false;
      this.enableSubmenu();

      // callback
      this.$emit('tbody-input-change', event, header, rowIndex, colIndex);
      this.changeData(rowIndex, header);
    },
    // callback
    callbackCheckedAll(isChecked) {
      this.$emit('tbody-all-checked-row', isChecked);
      if (this.customOptions.tbodyCheckbox) {
        this.tbodyData.forEach((data) => {
          this.$set(data, 'vuetable_checked', isChecked);
        });
      }
    },
    callbackSort(event, header, colIndex) {
      this.$emit('thead-td-sort', event, header, colIndex);
    },
    callbackSubmenuThead(event, header, colIndex, submenuFunction, selectOptions) {
      this.submenuStatusThead = false;
      if (selectOptions) {
        this.$emit(`thead-submenu-click-${submenuFunction}`, event, header, colIndex, selectOptions);
      } else {
        this.$emit(`thead-submenu-click-${submenuFunction}`, event, header, colIndex);
      }
    },
    callbackSubmenuTbody(event, header, rowIndex, colIndex, type, submenuFunction) {
      this.calculPosition(event, rowIndex, colIndex, 'submenu');
      this.$emit(`tbody-submenu-click-${submenuFunction}`, event, header, rowIndex, colIndex, type, submenuFunction);
    },
    handleTBodyContextMenu(event, header, rowIndex, colIndex) {
      this.lastSubmenuOpen = {
        event,
        header,
        rowIndex,
        colIndex,
      };
    },
    // thead
    handleTheadContextMenu() {
      this.submenuStatusTbody = false;
    },
    moveOnSelect(event) {
      moveOnSelect(event);
    },
    moveOnTable(event, colIndex, rowIndex) {
      moveOnTable(event, colIndex, rowIndex);
    },
    pressShiftMultipleCell(event, h, rowMax, rowIndex, colMax, colIndex) {
      pressShiftMultipleCell(event, h, rowMax, rowIndex, colMax, colIndex);
    },
    moveKeyup(event) {
      moveKeyup(event);
    },
    moveKeydown(event) {
      moveKeydown(event);
    },
  },
};
