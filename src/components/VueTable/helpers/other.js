export default function vueTableHelper(vm) {
  // changeData
  const changeData = (rowIndex, header) => {
    const cell = vm.tbodyData[rowIndex][header];
    vm.changeDataIncrement += 1;
    vm.storeUndoData.push({ rowIndex, header, cell });
    vm.$emit('tbody-change-data', rowIndex, header);
  };

  // rollBackUndo
  const rollBackUndo = () => {
    if (vm.storeUndoData.length && vm.changeDataIncrement > 0) {
      const index = vm.changeDataIncrement - 1;
      const store = vm.storeUndoData[index];

      vm.$emit('tbody-undo-data', store.rowIndex, store.header);
      vm.tbodyData[store.rowIndex][store.header] = store.cell.duplicate;
      vm.storeUndoData.splice(index, 1);
      vm.changeDataIncrement -= 1;
    }
  };

  // clearStoreUndo
  const clearStoreUndo = () => {
    vm.changeDataIncrement = 0;
    vm.storeUndoData = [];
  };

  // sorter
  const sorter = (options) => {
    return options.sort((a, b) => {
      const productA = a.value;
      const productB = b.value;
      if (productA === undefined && productB) return 1;
      if (productA && productB === undefined) return -1;
      if (productA < productB) return -1;
      if (productA > productB) return 1;
      return 0;
    });
  };

  // cleanPropertyOnCell
  const cleanPropertyOnCell = (action) => {
    if (vm.storeRectangleSelection.length > 0) {
      vm.storeRectangleSelection.forEach((cell) => {
        if (action === 'paste' && !cell.classList.value.includes('rectangleSelection') && !cell.classList.value.includes('copy')) {
          vm.cleanProperty(cell);
        } else if (action === 'copy' && !cell.classList.value.includes('selected')) {
          vm.cleanProperty(cell);
        }
      });
    }
  };

  // cleanProperty
  const cleanProperty = (element) => {
    element.style.setProperty('--rectangleWidth', '100%');
    element.style.setProperty('--rectangleHeight', '40px');
    element.style.setProperty('--rectangleTop', 0);
    element.style.setProperty('--rectangleBottom', 0);
  };

  // createdCell
  const createdCell = () => {
    // create cell if isn't exist
    vm.tbodyData.forEach((tbody, rowIndex) => {
      if (vm.customOptions.tbodyCheckbox && !tbody.vuetable_checked) {
        vm.$set(vm.tbodyData[rowIndex], 'vuetable_checked', false);
      }
      vm.headerKeys.forEach((header) => {
        if (!tbody[header]) {
          const data = JSON.parse(JSON.stringify(vm.customOptions.newData));
          vm.$set(vm.tbodyData[rowIndex], header, data);
        } else if (!tbody[header].type && 'value' in tbody[header]) {
          const data = JSON.parse(JSON.stringify(vm.customOptions.newData));
          const copyTbody = JSON.parse(JSON.stringify(tbody[header]));
          copyTbody.type = data.type;
          vm.$set(vm.tbodyData[rowIndex], header, copyTbody);
        }
        const copy = JSON.parse(JSON.stringify(vm.tbodyData[rowIndex][header]));
        vm.$set(vm.tbodyData[rowIndex][header], 'duplicate', copy);
      });
    });
  };

  // scrollFunction
  const scrollFunction = (event) => {
    vm.affixHeader(event, 'vueTable');
  
    if (vm.lastSelectOpen) {
      vm.calculPosition(vm.lastSelectOpen.event, vm.lastSelectOpen.rowIndex, vm.lastSelectOpen.colIndex, 'dropdown');
    } else if (vm.lastSubmenuOpen) {
      vm.calculPosition(vm.lastSubmenuOpen.event, vm.lastSubmenuOpen.rowIndex, vm.lastSubmenuOpen.colIndex, 'contextMenu');
    }
  };

  // scrollTopDocument
  const scrollTopDocument = (event) => {
    vm.affixHeader(event, 'document');
  
    if (vm.lastSelectOpen) {
      vm.calculPosition(event, vm.lastSelectOpen.rowIndex, vm.lastSelectOpen.colIndex, 'dropdown');
    } else if (vm.lastSubmenuOpen) {
      vm.calculPosition(event, vm.lastSubmenuOpen.rowIndex, vm.lastSubmenuOpen.colIndex, 'contextMenu');
    }
  };

  // affixHeader
  const affixHeader = (offset, target) => {
    if (vm.$refs && vm.$refs[`${vm.customTable}-table`] && vm.$refs[`${vm.customTable}-table`].offsetTop) {
      vm.scrollDocument = document.querySelector(`${vm.parentScrollElement.attribute}`).scrollTop;
      const offsetTopVueTable = vm.$refs[`${vm.customTable}-table`].offsetTop;
      const scrollOnDocument = vm.scrollDocument || target === 'document';
      const offsetEl = scrollOnDocument ? vm.scrollDocument : offset.target.scrollTop;
  
      if (offsetEl > offsetTopVueTable) {
        vm.headerTop = scrollOnDocument ? (offsetEl - offsetTopVueTable) : (offsetEl - 18);
      } else {
        vm.headerTop = 0;
      }
    }
  };

  // updateSelectedCell
  const updateSelectedCell = (header, rowIndex, colIndex) => {
    if (!vm.setFirstCell) {
      vm.$set(vm.tbodyData[rowIndex][header], 'rectangleSelection', true);
      vm.setFirstCell = true;
    }
    vm.selectedCell = {
      header,
      row: rowIndex,
      col: colIndex,
    };
    // highlight selected row and column
    vm.highlightTdAndThead(rowIndex, colIndex);
  };

  // activeSelectSearch
  const activeSelectSearch = (event, rowIndex, colIndex) => {
    vm.calculPosition(event, rowIndex, colIndex, 'dropdown');
    if (vm.$refs[`${vm.customTable}-vueTbody`].$refs[`input-${vm.customTable}-${colIndex}-${rowIndex}`][0]) {
      vm.$refs[`${vm.customTable}-vueTbody`].$refs[`input-${vm.customTable}-${colIndex}-${rowIndex}`][0].focus();
    }
  };

  // enableSelect
  const enableSelect = (event, header, col, rowIndex, colIndex) => {
    const currentElement = vm.tbodyData[rowIndex][header];
    if (!col.search) {
      vm.removeClass(['search', 'show']);
      vm.lastSelectOpen = {
        col,
        colIndex,
        event,
        header,
        rowIndex,
      };

      vm.$set(currentElement, 'search', true);
      vm.$set(currentElement, 'show', true);

      vm.$refs[`${vm.customTable}-vueTbody`].$refs[`input-${vm.customTable}-${colIndex}-${rowIndex}`][0].focus();
      vm.calculPosition(event, rowIndex, colIndex, 'dropdown');

      if (currentElement.value !== '') {
        vm.showDropdown(colIndex, rowIndex);
        const index = currentElement.selectOptions.map(x => x.value).indexOf(currentElement.value);
        vm.incrementOption = index;
      } else {
        vm.incrementOption = 0;
      }
    } else {
      vm.$set(currentElement, 'search', false);
      vm.$set(currentElement, 'show', false);
      vm.lastSelectOpen = null;
    }
  };

  // handleSearchInputSelect
  const handleSearchInputSelect = (event, searchValue, col, header, rowIndex, colIndex) => {
    const disableSearch = !(searchValue === '' && event.keyCode === 8);

    if ((!vm.keys.cmd || !vm.keys.ctrl)
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
      if (vm.lastSelectOpen) {
        vm.$set(vm.lastSelectOpen, 'searchValue', searchValue);
      } else {
        vm.lastSelectOpen = {
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
        const currentData = vm.tbodyData[rowIndex][header];
        vm.$set(currentData, 'search', true);
        vm.$set(currentData, 'show', true);

        vm.showDropdown(colIndex, rowIndex);
      }
      vm.incrementOption = 0;
    }
  };

  const showDropdown = (colIndex, rowIndex) => {
    // clear timeout
    if (vm.$refs[`${vm.customTable}-vueTbody`].$refs[`dropdown-${vm.customTable}-${colIndex}-${rowIndex}`]) {
      const dropdown = vm.$refs[`${vm.customTable}-vueTbody`].$refs[`dropdown-${vm.customTable}-${colIndex}-${rowIndex}`][0];
      if (!vm.scrollToSelectTimeout === null) {
        clearTimeout(vm.scrollToSelectTimeout);
      }
      // set scrollTop on select
      vm.scrollToSelectTimeout = setTimeout(() => {
        dropdown.scrollTop = 45 * vm.incrementOption;
        vm.scrollToSelectTimeout = null;
      }, 100);
    }
  };

  // handleTbodySelectChange
  const handleTbodySelectChange = (event, header, col, option, rowIndex, colIndex) => {
    const currentData = vm.tbodyData[rowIndex][header];
    currentData.selectOptions.forEach((selectOption) => {
      const sOption = selectOption;
      sOption.active = false;
    });
    currentData.selectOptions.find(x => x.value === option.value).active = true;

    vm.$set(currentData, 'search', false);
    vm.$set(currentData, 'show', false);
    vm.$set(currentData, 'value', option.value);

    vm.lastSelectOpen = null;
    // remove class show on select when it change
    if (vm.oldTdShow) vm.tbodyData[vm.oldTdShow.row][vm.oldTdShow.key].show = false;
    vm.enableSubmenu();
    // callback
    vm.$emit('tbody-select-change', event, header, col, option, rowIndex, colIndex);
    vm.changeData(rowIndex, header);
  };

  // calculPosition
  const calculPosition = (event, rowIndex, colIndex, header) => {
    // stock scrollLeft / scrollTop position of parent
    const { scrollLeft } = vm.$refs[`${vm.customTable}-vueTable`];
    const { scrollTop } = vm.$refs[`${vm.customTable}-vueTable`];

    // get offsetTop of firstCell
    const firstCellOffsetTop = vm.$refs[`${vm.customTable}-vueTbody`].$refs[`td-${vm.customTable}-0-0`][0].offsetTop;
    // stock $el
    const el = vm.$refs[`${vm.customTable}-vueTbody`].$refs[`td-${vm.customTable}-${colIndex}-${rowIndex}`][0];
    // stock height Of VueTable
    const realHeightTable = vm.$refs[`${vm.customTable}-vueTable`].offsetHeight;
    // stock size / offsetTop / offsetLeft of the element
    const width = el.offsetWidth;
    // stock heightOfScrollbar(40) cell(40) dropdown(140)
    const heightOfScrollbarCellDropdown = 180;

    let top = ((el.offsetTop - scrollTop) + 40) - vm.parentScrollElement.positionTop;
    let left = el.offsetLeft - scrollLeft;

    if (vm.selectPosition) {
      top = (((el.offsetTop - scrollTop) + 40) + vm.selectPosition.top) - vm.parentScrollElement.positionTop;
      left = (el.offsetLeft - scrollLeft) + vm.selectPosition.left;
    }

    // subtracted top of scroll top document
    if (vm.scrollDocument) {
      top = (((el.offsetTop - scrollTop) + 40) - vm.parentScrollElement.positionTop) - vm.scrollDocument;
    }

    // set size / top position / left position
    const currentSelect = vm.$refs[`${vm.customTable}-vueTbody`].$refs[`${header}-${vm.customTable}-${colIndex}-${rowIndex}`];
    if (currentSelect && currentSelect.length > 0) {
      currentSelect[0].style.setProperty('--selectWidth', `${width}px`);
      currentSelect[0].style.setProperty('--selectLeft', `${left}px`);

      if ((realHeightTable + firstCellOffsetTop) < (el.offsetTop + 250)) {
        currentSelect[0].style.setProperty('--selectTop', `${top - heightOfScrollbarCellDropdown}px`);
      } else {
        currentSelect[0].style.setProperty('--selectTop', `${top}px`);
      }
    }
  };

  // setOldValueOnInputSelect
  const setOldValueOnInputSelect = (col, rowIndex, header, colIndex, type) => {
    const column = col;
    column.show = false;
    vm.$set(vm.tbodyData[rowIndex][header], 'value', vm.tbodyData[rowIndex][header].value);
    if (type === 'select') {
      column.search = false;
    }
  };

  // handleUpDragSizeHeader
  const handleUpDragSizeHeader = (event, headers) => {
    vm.$emit('handle-up-drag-size-header', event, headers);
  };

  // enableSubmenu
  const enableSubmenu = (target) => {
    if (target === 'thead') {
      vm.submenuStatusThead = true;
      vm.submenuStatusTbody = false;
    } else if (target === 'tbody') {
      vm.submenuStatusThead = false;
      vm.submenuStatusTbody = true;
    } else {
      vm.submenuStatusThead = false;
      vm.submenuStatusTbody = false;
    }
  };

  // bindClassActiveOnTd
  const bindClassActiveOnTd = (header, rowIndex, colIndex) => {
    vm.removeClass(['active', 'show']);
    vm.tbodyData[rowIndex][header].active = true;
    // stock oldTdActive in object
    vm.oldTdActive = {
      key: header,
      row: rowIndex,
      col: colIndex,
    };
  };

  // removeClass
  const removeClass = (params) => {
    if (params.includes('selected')) {
      vm.selectedMultipleCellActive = false;
    }
    params.forEach((param) => {
      vm.tbodyData.forEach((data, index) => {
        Object.keys(data).forEach((key) => {
          if (vm.tbodyData[index] && vm.tbodyData[index][key] && vm.tbodyData[index][key][param] === true) {
            vm.tbodyData[index][key][param] = false;
          }
        });
        if (param === 'rectangleSelection') {
          vm.setFirstCell = false;
        }
      });
    });
  };

  // CheckedRow
  const checkedRow = (row) => {
    vm.$emit('tbody-checked-row', row);
    vm.$refs[`${vm.customTable}-vueThead`].checkedAll = false;
  };

  // Range
  const range = (start, end) => {
    return (new Array((end - start) + 1)).fill(undefined).map((_, i) => i + start);
  };

  // highlightTdAndThead
  const highlightTdAndThead = (rowIndex, colIndex) => {
    vm.highlight.tbody = [];
    vm.highlight.thead = [];
    vm.highlight.tbody = [...range(Math.min(vm.selectedCell.row, rowIndex), Math.max(vm.selectedCell.row, rowIndex))];
    vm.highlight.thead = [...range(Math.min(vm.selectedCell.col, colIndex), Math.max(vm.selectedCell.col, colIndex))];
  };

  // setPropertyStyleOfComment
  const setPropertyStyleOfComment = () => {
    if (vm.styleWrapVueTable.comment && vm.styleWrapVueTable.comment.borderColor) {
      vm.$refs[`${vm.customTable}-vueTable`].style.setProperty('--borderCommentColor', vm.styleWrapVueTable.comment.borderColor);
    }
    if (vm.styleWrapVueTable.comment && vm.styleWrapVueTable.comment.borderSize) {
      vm.$refs[`${vm.customTable}-vueTable`].style.setProperty('--borderCommentSize', vm.styleWrapVueTable.comment.borderSize);
    }
    if (vm.styleWrapVueTable.comment && vm.styleWrapVueTable.comment.widthBox) {
      vm.$refs[`${vm.customTable}-vueTable`].style.setProperty('--boxCommentWidth', vm.styleWrapVueTable.comment.widthBox);
    }
    if (vm.styleWrapVueTable.comment && vm.styleWrapVueTable.comment.heightBox) {
      vm.$refs[`${vm.customTable}-vueTable`].style.setProperty('--BoxCommentHeight', vm.styleWrapVueTable.comment.heightBox);
    }
  };

  // handleTbodyTdClick
  const handleTbodyTdClick = (event, col, header, rowIndex, colIndex, type) => {
    const column = col;

    if (vm.selectedMultipleCell) {
      vm.selectedMultipleCell = false;
    }

    if (!column.active) {
      if (!vm.keys[16]) {
        vm.removeClass(['selected', 'rectangleSelection']);
      }
      vm.removeClass(['search']);
      vm.lastSelectOpen = null;
    }
    vm.bindClassActiveOnTd(header, rowIndex, colIndex);

    vm.updateSelectedCell(header, rowIndex, colIndex);

    vm.enableSubmenu();
    if (vm.oldTdShow && vm.oldTdShow.col !== colIndex) {
      vm.tbodyData[vm.oldTdShow.row][vm.oldTdShow.key].show = false;
    }

    if (type === 'select' && column.handleSearch) {
      vm.activeSelectSearch(event, rowIndex, colIndex, header);
    }
  };

  // handleSelectMultipleCell
  const handleSelectMultipleCell = (event, header, rowIndex, colIndex) => {
    if (!vm.selectedMultipleCellActive) {
      vm.selectedMultipleCell = true;
      if (vm.selectedCell) {
        vm.selectedCoordCells = {
          rowStart: vm.selectedCell.row,
          colStart: vm.selectedCell.col,
          keyStart: vm.selectedCell.header,
          rowEnd: rowIndex,
          colEnd: colIndex,
          keyEnd: header,
        };
      }
      // Add active on selectedCoordCells selected
      vm.modifyMultipleCell('selected');

      // highlight row and column of selected cell
      vm.highlightTdAndThead(rowIndex, colIndex);
    }
  };

  // handleTbodyTdDoubleClick
  const handleTbodyTdDoubleClick = (event, header, col, rowIndex, colIndex) => {
    // stock oldTdShow in object
    if (vm.oldTdShow) vm.tbodyData[vm.oldTdShow.row][vm.oldTdShow.key].show = false;

    // add class show on element
    vm.$set(vm.tbodyData[rowIndex][header], 'show', true);
    event.currentTarget.lastElementChild.focus();

    vm.oldTdShow = {
      key: header,
      row: rowIndex,
      col: colIndex,
    };

    vm.enableSubmenu();
  };

  // handleTbodyNavBackspace
  const handleTbodyNavBackspace = (rowIndex, colIndex, header) => {
    if (vm.selectedMultipleCell) {
      vm.modifyMultipleCell('removeValue');
    } else {
      vm.$emit('tbody-nav-backspace', rowIndex, colIndex, header, vm.tbodyData[rowIndex][header]);
      vm.changeData(rowIndex, header);
      vm.tbodyData[rowIndex][header].value = '';
    }
  };

  // handleTbodyInputChange
  const handleTbodyInputChange = (event, header, rowIndex, colIndex) => {
    // remove class show on input when it change
    if (vm.oldTdShow) vm.tbodyData[vm.oldTdShow.row][vm.oldTdShow.key].show = false;
    vm.enableSubmenu();

    // callback
    vm.$emit('tbody-input-change', event, header, rowIndex, colIndex);
    vm.changeData(rowIndex, header);
  };

  // callbackCheckedAll
  const callbackCheckedAll = (isChecked) => {
    vm.$emit('tbody-all-checked-row', isChecked);
    if (vm.customOptions.tbodyCheckbox) {
      vm.tbodyData.forEach((data) => {
        vm.$set(data, 'vuetable_checked', isChecked);
      });
    }
  };

  // callbackSort
  const callbackSort = (event, header, colIndex) => {
    vm.$emit('thead-td-sort', event, header, colIndex);
  };

  // callbackSubmenuThead
  const callbackSubmenuThead = (event, header, colIndex, submenuFunction, selectOptions) => {
    vm.submenuStatusThead = false;
    if (selectOptions) {
      vm.$emit(`thead-submenu-click-${submenuFunction}`, event, header, colIndex, selectOptions);
    } else {
      vm.$emit(`thead-submenu-click-${submenuFunction}`, event, header, colIndex);
    }
  };

  // callbackSubmenuTbody
  const callbackSubmenuTbody = (event, header, rowIndex, colIndex, type, submenuFunction) => {
    vm.calculPosition(event, rowIndex, colIndex, 'submenu');
    vm.$emit(`tbody-submenu-click-${submenuFunction}`, event, header, rowIndex, colIndex, type, submenuFunction);
  };

  // handleTBodyContextMenu
  const handleTBodyContextMenu = (event, header, rowIndex, colIndex) => {
    vm.lastSubmenuOpen = {
      event,
      header,
      rowIndex,
      colIndex,
    };
  };

  return {
    changeData,
    rollBackUndo,
    clearStoreUndo,
    sorter,
    cleanPropertyOnCell,
    cleanProperty,
    createdCell,
    scrollFunction,
    scrollTopDocument,
    affixHeader,
    updateSelectedCell,
    activeSelectSearch,
    enableSelect,
    handleSearchInputSelect,
    showDropdown,
    handleTbodySelectChange,
    calculPosition,
    setOldValueOnInputSelect,
    handleUpDragSizeHeader,
    enableSubmenu,
    bindClassActiveOnTd,
    removeClass,
    checkedRow,
    highlightTdAndThead,
    setPropertyStyleOfComment,
    handleTbodyTdClick,
    handleSelectMultipleCell,
    handleTbodyTdDoubleClick,
    handleTbodyNavBackspace,
    handleTbodyInputChange,
    callbackCheckedAll,
    callbackSort,
    callbackSubmenuThead,
    callbackSubmenuTbody,
    handleTBodyContextMenu,
  };
}
