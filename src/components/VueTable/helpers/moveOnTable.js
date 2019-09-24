// Move On Cell
export default function vueTableHelperMoveOnTable(vm) {
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
    moveOnSelect,
    moveOnTable,
    pressShiftMultipleCell,
    moveKeyup,
    moveKeydown,
  };
}
