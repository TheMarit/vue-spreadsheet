export default function vueTableHelperCopyPaste(vm) {
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

  return {
    copyStoreData,
    pasteReplaceData,
    replacePasteData,
    modifyMultipleCell,
    setRectangleSelection,
  };
}
