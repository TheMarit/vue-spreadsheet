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

  // Copy Paste
  const copyStoreData = (params) => {
    const tbodyData = JSON.parse(JSON.stringify(vm.tbodyData));
    vm.removeClass(['stateCopy']);

    if (vm.selectedCoordCells && vm.selectedMultipleCell && params === 'copy') {
      if (vm.selectedCell.row !== vm.selectedCoordCells.rowEnd || vm.selectedCell.col !== vm.selectedCoordCells.colEnd) {
        vm.selectedCell.row = vm.selectedCoordCells.rowEnd;
        vm.selectedCell.col = vm.selectedCoordCells.colEnd;
      }
    }

    if (vm.selectedCoordCells
      && vm.selectedCell.col === vm.selectedCoordCells.colEnd
      && vm.selectedCell.row === vm.selectedCoordCells.rowEnd
      && params === 'copy') {
      vm.selectedCoordCopyCells = vm.selectedCoordCells;
    } else {
      vm.selectedCoordCopyCells = null;
    }

    if (vm.selectedMultipleCell && vm.selectedCoordCells) {
      let rowMin = Math.min(vm.selectedCoordCells.rowStart, vm.selectedCoordCells.rowEnd);
      const rowMax = Math.max(vm.selectedCoordCells.rowStart, vm.selectedCoordCells.rowEnd);
      let colMin = Math.min(vm.selectedCoordCells.colStart, vm.selectedCoordCells.colEnd);
      const colMax = Math.max(vm.selectedCoordCells.colStart, vm.selectedCoordCells.colEnd);
      const header = vm.headerKeys[colMin];
      let storeData = {};

      if (params === 'copy') {
        vm.$set(vm.tbodyData[rowMin][header], 'stateCopy', true);
        vm.removeClass(['rectangleSelection']);
        vm.cleanPropertyOnCell('copy');
      }

      while (rowMin <= rowMax) {
        // remove stateCopy if present of storeData
        const copyData = tbodyData[rowMin][vm.headerKeys[colMin]];
        copyData.active = false;
        copyData.selected = false;
        copyData.stateCopy = false;

        storeData[vm.headerKeys[colMin]] = copyData;
        colMin += 1;
        if (colMin > colMax) {
          vm.storeCopyDatas.push(storeData);
          colMin = Math.min(vm.selectedCoordCells.colStart, vm.selectedCoordCells.colEnd);
          rowMin += 1;
          storeData = {};
        }
      }
      vm.copyMultipleCell = true;
    } else {
      if (params === 'copy') {
        vm.cleanPropertyOnCell('copy');
        vm.$set(vm.tbodyData[vm.selectedCell.row][vm.selectedCell.header], 'stateCopy', true);
      } else {
        vm.storeCopyDatas = [];
      }
      // remove stateCopy if present of storeData
      const copyData = tbodyData[vm.selectedCell.row][vm.selectedCell.header];
      copyData.active = false;
      copyData.selected = false;
      copyData.stateCopy = false;
      vm.storeCopyDatas.push(copyData);
      vm.copyMultipleCell = false;
    }
  };

  // pasteReplaceData
  const pasteReplaceData = () => {
    const maxRow = vm.tbodyData.length;
    vm.cleanPropertyOnCell('paste');

    // copy / paste one cell || disable on disabled cell
    if (vm.storeCopyDatas[0].value && !vm.copyMultipleCell && !vm.selectedMultipleCell && !vm.eventDrag && !vm.disableCells.find(x => x === vm.selectedCell.header)) {
      const { duplicate } = vm.tbodyData[vm.selectedCell.row][vm.selectedCell.header];
      vm.storeCopyDatas[0].duplicate = duplicate;
      vm.storeCopyDatas[0].active = true;

      // create newCopyData
      const newCopyData = JSON.parse(JSON.stringify(vm.storeCopyDatas));
      [vm.tbodyData[vm.selectedCell.row][vm.selectedCell.header]] = newCopyData;

      // callback changeData
      vm.changeData(vm.selectedCell.row, vm.selectedCell.header);
      // disable on disabled cell
    } else if (!vm.disableCells.find(x => x === vm.selectedCell.header) && vm.selectedCoordCells) {
      // if paste in multiple selection
      const conditionPasteToMultipleSelection = vm.selectedCoordCopyCells !== null && vm.selectedCoordCells !== vm.selectedCoordCopyCells;

      // new paste data
      const conditionRowToMultiplePasteRow = vm.storeCopyDatas.length === 1
        && !vm.storeCopyDatas[0].type
        && vm.selectedCoordCopyCells !== null
        && Object.values(vm.storeCopyDatas[0]).length > 1
        && vm.selectedCoordCells.rowStart < vm.selectedCoordCells.rowEnd;

      // copy / paste multiple cell | drag to fill one / multiple cell
      let rowMin = Math.min(vm.selectedCoordCells.rowStart, vm.selectedCoordCells.rowEnd);
      let rowMax = Math.max(vm.selectedCoordCells.rowStart, vm.selectedCoordCells.rowEnd);
      let colMin = Math.min(vm.selectedCoordCells.colStart, vm.selectedCoordCells.colEnd);
      let colMax = Math.max(vm.selectedCoordCells.colStart, vm.selectedCoordCells.colEnd);

      if (conditionPasteToMultipleSelection) {
        rowMin = Math.min(vm.selectedCoordCopyCells.rowStart, vm.selectedCoordCopyCells.rowEnd);
        rowMax = Math.max(vm.selectedCoordCopyCells.rowStart, vm.selectedCoordCopyCells.rowEnd);
      }

      if (conditionRowToMultiplePasteRow) {
        rowMin = Math.min(vm.selectedCoordCells.rowStart, vm.selectedCoordCells.rowEnd);
        rowMax = Math.max(vm.selectedCoordCells.rowStart, vm.selectedCoordCells.rowEnd);
      }

      if (conditionPasteToMultipleSelection || conditionRowToMultiplePasteRow) {
        colMin = Math.min(vm.selectedCoordCopyCells.colStart, vm.selectedCoordCopyCells.colEnd);
        colMax = Math.max(vm.selectedCoordCopyCells.colStart, vm.selectedCoordCopyCells.colEnd);
      }

      let row = 0;
      let col = 0;

      while (rowMin <= rowMax) {
        const header = vm.headerKeys[colMin];
        const newCopyData = JSON.parse(JSON.stringify(vm.storeCopyDatas));

        if (vm.eventDrag) { // Drag To Fill
          const { duplicate } = vm.tbodyData[rowMin][header];
          if (newCopyData[0][header]) {
            newCopyData[0][header].duplicate = duplicate;
            vm.tbodyData[rowMin][header] = newCopyData[0][header]; // multiple cell
          } else {
            newCopyData[0].duplicate = duplicate;
            [vm.tbodyData[rowMin][header]] = newCopyData; // one cell
          }
          vm.changeData(rowMin, header);
        } else {
          let incrementRow = vm.selectedCell.row + row;
          let incrementCol = vm.selectedCell.col + col;

          if (vm.selectedCoordCells !== vm.selectedCoordCopyCells) {
            incrementRow = vm.selectedCoordCells.rowStart + row;
            incrementCol = vm.selectedCoordCells.colStart + col;
          }

          let currentHeader = vm.headerKeys[incrementCol];

          // multiple col to multiple col
          const colsToCols = Object.values(newCopyData[0]).length === 1;
          if (colsToCols) {
            currentHeader = vm.headerKeys[vm.selectedCell.col];
            if (incrementRow < maxRow) {
              vm.replacePasteData(col, header, incrementRow, currentHeader);
              col += 1;
            }
          }

          // one cell to multipleCell
          const cellToCells = newCopyData.length === 1 && Object.values(newCopyData).length === 1 && newCopyData[0].type;
          if (cellToCells) {
            currentHeader = vm.selectedCell.header;
            newCopyData[0].duplicate = vm.tbodyData[rowMin][currentHeader].duplicate;
            [vm.tbodyData[rowMin][currentHeader]] = newCopyData;
            vm.changeData(rowMin, currentHeader);
          }

          // 1 row to 1 row
          const rowToRow = newCopyData.length === 1 && Object.values(newCopyData[0]).length > 1 && !newCopyData[0].type && vm.selectedCoordCells.rowStart === vm.selectedCoordCells.rowEnd;
          if (rowToRow) {
            vm.replacePasteData(0, header, vm.selectedCell.row, currentHeader);
            col += 1;
          }

          // 1 row & multiple cols => to multiple row & cols
          const rowColsToRowsCols = newCopyData.length === 1
            && Object.values(newCopyData[0]).length > 1
            && vm.selectedCoordCells.rowStart < vm.selectedCoordCells.rowEnd
            && vm.selectedCoordCells.colStart !== vm.selectedCoordCells.colEnd;
          if (rowColsToRowsCols) {
            vm.replacePasteData(0, header, incrementRow, currentHeader);
            if (colMin < colMax) {
              col += 1;
            } else {
              col = 0;
            }
          }

          // multiple col / row to multiple col / row
          const rowsColsToRowsCols = newCopyData.length > 1 && Object.values(newCopyData[0]).length > 1;
          if (rowsColsToRowsCols) {
            if (vm.tbodyData[incrementRow][currentHeader]) {
              newCopyData[row][header].duplicate = vm.tbodyData[incrementRow][currentHeader].duplicate;
            }
            vm.replacePasteData(row, header, incrementRow, currentHeader);
            if (colMin < colMax) {
              col += 1;
            } else {
              col = 0;
            }
          }

          // add active / selected status on firstCell
          vm.tbodyData[vm.selectedCell.row][vm.selectedCell.header].selected = true;
          vm.tbodyData[vm.selectedCell.row][vm.selectedCell.header].active = true;
        }
        colMin += 1;
        if (colMin > colMax) {
          if (vm.selectedCoordCopyCells !== null && vm.selectedCoordCells !== vm.selectedCoordCopyCells) {
            colMin = Math.min(vm.selectedCoordCopyCells.colStart, vm.selectedCoordCopyCells.colEnd);
          } else {
            colMin = Math.min(vm.selectedCoordCells.colStart, vm.selectedCoordCells.colEnd);
          }
          rowMin += 1;
          row += 1;
        }
      }
      vm.modifyMultipleCell();
    }
  };

  // replacePasteData
  const replacePasteData = (col, header, incrementRow, currentHeader) => {
    const newCopyData = JSON.parse(JSON.stringify(vm.storeCopyDatas));
    newCopyData[col][header].duplicate = vm.tbodyData[incrementRow][currentHeader].duplicate;
    vm.tbodyData[incrementRow][currentHeader] = newCopyData[col][header];
    vm.changeData(incrementRow, currentHeader);
  };

  // modifyMultipleCell
  const modifyMultipleCell = (params) => {
    let rowMin = Math.min(vm.selectedCoordCells.rowStart, vm.selectedCoordCells.rowEnd);
    const rowMax = Math.max(vm.selectedCoordCells.rowStart, vm.selectedCoordCells.rowEnd);
    let colMin = Math.min(vm.selectedCoordCells.colStart, vm.selectedCoordCells.colEnd);
    const colMax = Math.max(vm.selectedCoordCells.colStart, vm.selectedCoordCells.colEnd);

    while (rowMin <= rowMax) {
      const header = vm.headerKeys[colMin];
      // disable on disabled cell
      if (params === 'removeValue' && !vm.disableCells.find(x => x === header)) {
        vm.$emit('tbody-nav-backspace', rowMin, colMin, header, vm.tbodyData[rowMin][header]);
        vm.changeData(rowMin, header);
        vm.$set(vm.tbodyData[rowMin][header], 'value', '');
        vm.$set(vm.tbodyData[rowMin][header], 'selected', false);
      }
      if (params === 'selected') {
        vm.$set(vm.tbodyData[rowMin][header], 'selected', true);
        vm.selectedMultipleCellActive = true;
        if (colMin === colMax && rowMin === rowMax) {
          // add active on the last cell
          vm.removeClass(['active']);
          vm.$set(vm.tbodyData[rowMin][header], 'active', true);
        }
      }
      colMin += 1;
      if (colMin > colMax) {
        colMin = Math.min(vm.selectedCoordCells.colStart, vm.selectedCoordCells.colEnd);
        rowMin += 1;
      }
    }

    // Set height / width of rectangle
    vm.setRectangleSelection(colMin, colMax, rowMin, rowMax);
  };

  // setRectangleSelection
  const setRectangleSelection = (colMin, colMax, rowMin, rowMax) => {
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
    } else if (vm.selectedCoordCells.rowEnd > vm.selectedCoordCells.rowStart) {
      height = 40 * ((vm.selectedCoordCells.rowEnd - vm.selectedCoordCells.rowStart) + 1);
    } else {
      height = 40 * ((vm.selectedCoordCells.rowStart - vm.selectedCoordCells.rowEnd) + 1);
    }

    if (vm.$refs[`${vm.customTable}-vueTbody`] && vm.$refs[`${vm.customTable}-vueTbody`].$refs) {
      [vm.rectangleSelectedCell] = vm.$refs[`${vm.customTable}-vueTbody`].$refs[`td-${vm.customTable}-${vm.selectedCoordCells.colStart}-${vm.selectedCoordCells.rowStart}`];

      if (!vm.selectedMultipleCellActive) {
        [vm.rectangleSelectedCell] = vm.$refs[`${vm.customTable}-vueTbody`].$refs[`td-${vm.customTable}-${vm.selectedCell.col}-${vm.selectedCell.row}`];
      }
    }

    vm.rectangleSelectedCell.style.setProperty('--rectangleWidth', `${width + 1}%`);
    vm.rectangleSelectedCell.style.setProperty('--rectangleHeight', `${height}px`);

    // Position bottom/top of rectangle if rowStart >= rowEnd
    if (vm.selectedCoordCells.rowStart >= vm.selectedCoordCells.rowEnd) {
      vm.rectangleSelectedCell.style.setProperty('--rectangleTop', 'auto');
      vm.rectangleSelectedCell.style.setProperty('--rectangleBottom', 0);
    } else {
      vm.rectangleSelectedCell.style.setProperty('--rectangleTop', 0);
      vm.rectangleSelectedCell.style.setProperty('--rectangleBottom', 'auto');
    }
    // Position left/right of rectangle if colStart >= colEnd
    if (vm.selectedCoordCells.colStart >= vm.selectedCoordCells.colEnd) {
      vm.rectangleSelectedCell.style.setProperty('--rectangleLeft', 'auto');
      vm.rectangleSelectedCell.style.setProperty('--rectangleRight', 0);
    } else {
      vm.rectangleSelectedCell.style.setProperty('--rectangleLeft', 0);
    }

    if (!vm.storeRectangleSelection.includes(vm.rectangleSelectedCell)) {
      vm.storeRectangleSelection.push(vm.rectangleSelectedCell);
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

  // Drag To Fill
  // handleDownDragToFill
  const handleDownDragToFill = (event, header, col, rowIndex) => {
    vm.storeCopyDatas = [];
    vm.$set(vm.tbodyData[rowIndex][header], 'active', true);
    vm.eventDrag = true;
    if (!vm.selectedCoordCells && !vm.selectedMultipleCell) {
      vm.selectedCoordCells = {
        rowStart: vm.selectedCell.row,
        colStart: vm.selectedCell.col,
        keyStart: vm.selectedCell.header,
        rowEnd: rowIndex,
        colEnd: vm.selectedCell.col,
        keyEnd: vm.selectedCell.header,
      };
    } else if (vm.selectedMultipleCell) {
      // if drag col to col in row to row to row
      vm.selectedCoordCells.rowStart = rowIndex;
    } else {
      vm.selectedCoordCells = {
        rowStart: vm.selectedCell.row,
        colStart: vm.selectedCell.col,
        keyStart: vm.selectedCell.header,
        rowEnd: rowIndex,
        colEnd: vm.selectedCell.col,
        keyEnd: vm.selectedCell.header,
      };
    }
    vm.copyStoreData('drag');
  };

  // handleMoveDragToFill
  const handleMoveDragToFill = (event, header, col, rowIndex, colIndex) => {
    if (vm.eventDrag === true && vm.selectedCoordCells && vm.selectedCoordCells.rowEnd !== rowIndex) {
      vm.selectedCoordCells.rowEnd = rowIndex;
      vm.modifyMultipleCell('selected');
      vm.$emit('tbody-move-dragtofill', vm.selectedCoordCells, header, col, rowIndex, colIndex);
    }
  };

  // handleUpDragToFill
  const handleUpDragToFill = (event, header, rowIndex, colIndex) => {
    if (vm.eventDrag === true && vm.selectedCoordCells) {
      vm.selectedCoordCells.rowEnd = rowIndex;
      vm.pasteReplaceData();
      vm.removeClass(['selected', 'rectangleSelection', 'active', 'show']);
      vm.$emit('tbody-up-dragtofill', vm.selectedCoordCells, header, rowIndex, colIndex);
      vm.eventDrag = false;
      vm.storeCopyDatas = [];
      vm.selectedCoordCells = null;
    }
  };

  // Move On Cell
  // moveOnSelect
  const moveOnSelect = (event) => {
    if (vm.incrementOption <= vm.filteredList.length) {
      // top
      const dropdown = vm.$refs[`${vm.customTable}-vueTbody`].$refs[`dropdown-${vm.customTable}-${vm.lastSelectOpen.colIndex}-${vm.lastSelectOpen.rowIndex}`][0];
      if (event.keyCode === 38) {
        if (vm.incrementOption <= vm.filteredList.length && vm.incrementOption > 0) {
          if (vm.filteredList[vm.incrementOption]) {
            vm.$set(vm.filteredList[vm.incrementOption], 'active', false);
            vm.incrementOption -= 1;
            vm.$set(vm.filteredList[vm.incrementOption], 'active', true);
          } else {
            vm.incrementOption -= 1;
            vm.$set(vm.filteredList[vm.incrementOption], 'active', false);
            vm.incrementOption -= 1;
            vm.$set(vm.filteredList[vm.incrementOption], 'active', true);
          }
          if (vm.incrementOption % 3 === 0) {
            dropdown.scrollTop -= (45 * 3);
          }
        }
      }
      // bottom
      if (event.keyCode === 40) {
        if (vm.incrementOption < vm.filteredList.length - 1) {
          if (vm.incrementOption === 0 || vm.incrementOption === 1) {
            vm.$set(vm.filteredList[vm.incrementOption], 'active', true);
            vm.incrementOption += 1;
            vm.$set(vm.filteredList[vm.incrementOption], 'active', true);
            vm.$set(vm.filteredList[vm.incrementOption - 1], 'active', false);
          } else if (vm.incrementOption > 1) {
            vm.$set(vm.filteredList[vm.incrementOption], 'active', false);
            vm.incrementOption += 1;
            vm.$set(vm.filteredList[vm.incrementOption], 'active', true);
          }
        }
        if (vm.incrementOption % 3 === 0) {
          dropdown.scrollTop = 45 * vm.incrementOption;
        }
      }
    }
    // enter
    if (event.keyCode === 13) {
      const oldSelect = vm.lastSelectOpen;
      const currentSelect = vm.tbodyData[oldSelect.rowIndex][oldSelect.header];
      vm.handleTbodySelectChange(event, oldSelect.header, currentSelect, vm.filteredList[vm.incrementOption], oldSelect.rowIndex, oldSelect.colIndex);
    }
  };

  // moveOnTable
  const moveOnTable = (event, colIndex, rowIndex) => {
    const vueTable = vm.$refs[`${vm.customTable}-vueTable`];

    const maxCol = Math.max(...vm.colHeaderWidths);
    // get the correct height of visible table
    if (vueTable) {
      const heightTable = vueTable.clientHeight - vueTable.firstElementChild.clientHeight - vm.$refs[`${vm.customTable}-vueThead`].$el.clientHeight;
      const widthTable = vueTable.clientWidth - 40;
      const borderBottomCell = Math.round(heightTable / 40);
      const borderRightCell = Math.round(widthTable / maxCol);
      // top
      if (event.keyCode === 38) {
        event.preventDefault();
        if (borderBottomCell >= rowIndex) {
          vueTable.scrollTop -= 40;
        }
      }
      // bottom
      if (event.keyCode === 40) {
        event.preventDefault();
        if ((borderBottomCell - 1) <= rowIndex) {
          vueTable.scrollTop += 40;
        }
      }
      // left
      if (event.keyCode === 37) {
        event.preventDefault();
        if ((borderRightCell + 1) >= colIndex) {
          vueTable.scrollLeft -= maxCol;
        }
      }
      // right
      if (event.keyCode === 39) {
        event.preventDefault();
        if ((borderRightCell - 1) <= colIndex) {
          vueTable.scrollLeft += maxCol;
        }
      }
    }
  };

  // pressShiftMultipleCell
  const pressShiftMultipleCell = (event, h, rowMax, rowIndex, colMax, colIndex) => {
    event.preventDefault();
    let header = h;
    vm.$set(vm.tbodyData[rowIndex][header], 'active', false);
    vm.incrementCol = vm.incrementCol ? vm.incrementCol : colIndex;
    vm.incrementRow = vm.incrementRow ? vm.incrementRow : rowIndex;
    if (vm.pressedShift >= 0) {
      vm.pressedShift += 1;
    }
    if (vm.pressedShift === 0) {
      vm.selectedCell = {
        header,
        row: rowIndex,
        col: colIndex,
      };
    }

    // shift / left
    if (event.keyCode === 37) {
      vm.incrementCol -= 1;
      if (vm.incrementCol < 0) {
        vm.incrementCol = 0;
      }
      vm.removeClass(['selected']);
    }
    // shift / top
    if (event.keyCode === 38) {
      vm.incrementRow -= 1;
      if (vm.incrementRow < 0) {
        vm.incrementRow = 0;
      }
      vm.removeClass(['selected']);
    }
    // shift / right
    if (event.keyCode === 39) {
      if (colMax >= vm.incrementCol + 2) {
        vm.incrementCol += 1;
      } else {
        vm.$set(vm.tbodyData[rowIndex][header], 'active', true);
      }
    }
    // shift / bottom
    if (event.keyCode === 40) {
      if (rowMax >= vm.incrementRow + 2) {
        vm.incrementRow += 1;
      } else {
        vm.$set(vm.tbodyData[rowIndex][header], 'active', true);
      }
    }
    header = Object.values(vm.headerKeys)[vm.incrementCol];
    vm.$set(vm.tbodyData[vm.incrementRow][header], 'active', true);
    vm.handleSelectMultipleCell(event, header, vm.incrementRow, vm.incrementCol);
  };

  // moveKeyup
  const moveKeyup = (event) => {
    if (event.keyCode === 16) {
      vm.keys[event.keyCode] = false;
      vm.incrementCol = null;
      vm.incrementRow = null;
      vm.selectedMultipleCell = true;
      vm.pressedShift = 0;
    }

    if (event.keyCode === 91 || event.keyCode === 17) {
      if (!vm.disableKeyTimeout === null) {
        clearTimeout(vm.disableKeyTimeout);
      }
      vm.disableKeyTimeout = setTimeout(() => {
        vm.keys.cmd = false;
        vm.keys.ctrl = false;
        vm.disableKeyTimeout = null;
      }, 400);
    }
  };

  // moveKeydown
  const moveKeydown = (event) => {
    [vm.actualElement] = document.getElementsByClassName('active_td');

    if (event.keyCode === 16) {
      vm.keys[event.keyCode] = true;
    }

    if (event.keyCode === 91 || event.keyCode === 17) {
      vm.keys.cmd = true;
      vm.keys.ctrl = true;
    }

    if ((vm.keys.cmd && event.keyCode === 90) || (vm.keys.ctrl && event.keyCode === 90)) {
      vm.rollBackUndo();
    }

    if (vm.lastSelectOpen) {
      vm.moveOnSelect(event);
    }

    if (vm.actualElement
      && vm.actualElement.getAttribute('current-table') === vm.customTable.toString()
      && (event.keyCode === 37
      || event.keyCode === 39
      || event.keyCode === 40
      || event.keyCode === 38
      || event.keyCode === 13
      || event.keyCode === 27
      || event.keyCode === 8)) {
      vm.removeClass(['selected']);

      const colIndex = Number(vm.actualElement.getAttribute('data-col-index'));
      const rowIndex = Number(vm.actualElement.getAttribute('data-row-index'));
      const dataType = vm.actualElement.getAttribute('data-type');
      const header = vm.actualElement.getAttribute('data-header');

      if (!vm.setFirstCell) {
        vm.$set(vm.tbodyData[rowIndex][header], 'rectangleSelection', true);
        vm.setFirstCell = true;
      }

      // set colMax rowMax
      const rowMax = vm.tbodyData.length;
      const colMax = vm.headers.length;

      vm.moveOnTable(event, colIndex, rowIndex);

      // shift
      if (vm.keys[16]) {
        vm.pressShiftMultipleCell(event, header, rowMax, rowIndex, colMax, colIndex);
      } else if (!vm.lastSelectOpen && event.keyCode !== 8) {
        if (vm.selectedMultipleCell) {
          vm.selectedMultipleCell = false;
        }
        vm.$set(vm.tbodyData[rowIndex][header], 'active', false);
        vm.removeClass(['rectangleSelection']);
        // left
        if (event.keyCode === 37) {
          const decrementHeader = Object.values(vm.headerKeys)[colIndex - 1];
          if (decrementHeader) {
            vm.$set(vm.tbodyData[rowIndex][decrementHeader], 'active', true);
            if (dataType === 'select') { vm.activeSelectSearch(event, rowIndex, colIndex, decrementHeader); }
            vm.updateSelectedCell(decrementHeader, rowIndex, colIndex - 1);
          } else {
            vm.$set(vm.tbodyData[rowIndex][header], 'active', true);
            if (dataType === 'select') { vm.activeSelectSearch(event, rowIndex, colIndex, header); }
            vm.updateSelectedCell(header, rowIndex, colIndex);
          }
        }
        // top
        if (event.keyCode === 38) {
          if (rowIndex !== 0) {
            vm.$set(vm.tbodyData[rowIndex - 1][header], 'active', true);
            if (dataType === 'select') { vm.activeSelectSearch(event, rowIndex - 1, colIndex, header); }
            vm.updateSelectedCell(header, rowIndex - 1, colIndex);
          } else {
            vm.$set(vm.tbodyData[rowIndex][header], 'active', true);
            if (dataType === 'select') { vm.activeSelectSearch(event, rowIndex, colIndex, header); }
            vm.updateSelectedCell(header, rowIndex, colIndex);
          }
        }
        // right
        if (event.keyCode === 39) {
          const incrementHeader = Object.values(vm.headerKeys)[colIndex + 1];
          if (incrementHeader) {
            vm.$set(vm.tbodyData[rowIndex][incrementHeader], 'active', true);
            if (dataType === 'select') { vm.activeSelectSearch(event, rowIndex, colIndex, incrementHeader); }
            vm.updateSelectedCell(incrementHeader, rowIndex, colIndex + 1);
          } else {
            vm.$set(vm.tbodyData[rowIndex][header], 'active', true);
            if (dataType === 'select') { vm.activeSelectSearch(event, rowIndex, colIndex, header); }
            vm.updateSelectedCell(header, rowIndex, colIndex);
          }
        }
        // bottom
        if (event.keyCode === 40) {
          if (rowIndex + 1 !== rowMax) {
            vm.$set(vm.tbodyData[rowIndex + 1][header], 'active', true);
            if (dataType === 'select') { vm.activeSelectSearch(event, rowIndex + 1, colIndex, header); }
            vm.updateSelectedCell(header, rowIndex + 1, colIndex);
          } else {
            vm.$set(vm.tbodyData[rowIndex][header], 'active', true);
            if (dataType === 'select') { vm.activeSelectSearch(event, rowIndex, colIndex, header); }
            vm.updateSelectedCell(header, rowIndex, colIndex);
          }
        }
      }
      // press backspace
      if (event.keyCode === 8 && !vm.lastSelectOpen) {
        vm.handleTbodyNavBackspace(rowIndex, colIndex, header);
      }
      // press enter
      if (event.keyCode === 13) {
        if (vm.$refs[`input-${vm.customTable}-${colIndex}-${rowIndex}`]) {
          vm.tbodyData[rowIndex][header].show = true;
          vm.$refs[`input-${vm.customTable}-${colIndex}-${rowIndex}`][0].focus();
        }
        vm.$emit('tbody-nav-enter', event, event.keyCode, vm.actualElement, rowIndex, colIndex);
      }
      // press esc
      if (event.keyCode === 27) {
        vm.tbodyData[rowIndex][header].active = false;
        vm.storeCopyDatas = [];
        vm.removeClass(['stateCopy']);
      }
    }
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
    copyStoreData,
    pasteReplaceData,
    replacePasteData,
    modifyMultipleCell,
    setRectangleSelection,
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
    handleDownDragToFill,
    handleMoveDragToFill,
    handleUpDragToFill,
    moveOnSelect,
    moveOnTable,
    pressShiftMultipleCell,
    moveKeyup,
    moveKeydown,
  };
}
