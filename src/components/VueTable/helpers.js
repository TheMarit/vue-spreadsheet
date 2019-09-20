// CheckedRow
const checkedRow = (row) => {
  this.$emit('tbody-checked-row', row);
  this.$refs[`${this.customTable}-vueThead`].checkedAll = false;
};

// Highlight TH / TD
const range = (start, end) => {
  return (new Array((end - start) + 1)).fill(undefined).map((_, i) => i + start);
};
const highlightTdAndThead = (rowIndex, colIndex) => {
  this.highlight.tbody = [];
  this.highlight.thead = [];
  this.highlight.tbody = [...range(Math.min(this.selectedCell.row, rowIndex), Math.max(this.selectedCell.row, rowIndex))];
  this.highlight.thead = [...range(Math.min(this.selectedCell.col, colIndex), Math.max(this.selectedCell.col, colIndex))];
};

// Comment
const setPropertyStyleOfComment = () => {
  if (this.styleWrapVueTable.comment && this.styleWrapVueTable.comment.borderColor) {
    this.$refs[`${this.customTable}-vueTable`].style.setProperty('--borderCommentColor', this.styleWrapVueTable.comment.borderColor);
  }
  if (this.styleWrapVueTable.comment && this.styleWrapVueTable.comment.borderSize) {
    this.$refs[`${this.customTable}-vueTable`].style.setProperty('--borderCommentSize', this.styleWrapVueTable.comment.borderSize);
  }
  if (this.styleWrapVueTable.comment && this.styleWrapVueTable.comment.widthBox) {
    this.$refs[`${this.customTable}-vueTable`].style.setProperty('--boxCommentWidth', this.styleWrapVueTable.comment.widthBox);
  }
  if (this.styleWrapVueTable.comment && this.styleWrapVueTable.comment.heightBox) {
    this.$refs[`${this.customTable}-vueTable`].style.setProperty('--BoxCommentHeight', this.styleWrapVueTable.comment.heightBox);
  }
};

// Copy Paste
const copyStoreData = (params) => {
  const tbodyData = JSON.parse(JSON.stringify(this.tbodyData));
  this.removeClass(['stateCopy']);

  if (this.selectedCoordCells && this.selectedMultipleCell && params === 'copy') {
    if (this.selectedCell.row !== this.selectedCoordCells.rowEnd || this.selectedCell.col !== this.selectedCoordCells.colEnd) {
      this.selectedCell.row = this.selectedCoordCells.rowEnd;
      this.selectedCell.col = this.selectedCoordCells.colEnd;
    }
  }

  if (this.selectedCoordCells
    && this.selectedCell.col === this.selectedCoordCells.colEnd
    && this.selectedCell.row === this.selectedCoordCells.rowEnd
    && params === 'copy') {
    this.selectedCoordCopyCells = this.selectedCoordCells;
  } else {
    this.selectedCoordCopyCells = null;
  }

  if (this.selectedMultipleCell && this.selectedCoordCells) {
    let rowMin = Math.min(this.selectedCoordCells.rowStart, this.selectedCoordCells.rowEnd);
    const rowMax = Math.max(this.selectedCoordCells.rowStart, this.selectedCoordCells.rowEnd);
    let colMin = Math.min(this.selectedCoordCells.colStart, this.selectedCoordCells.colEnd);
    const colMax = Math.max(this.selectedCoordCells.colStart, this.selectedCoordCells.colEnd);
    const header = this.headerKeys[colMin];
    let storeData = {};

    if (params === 'copy') {
      this.$set(this.tbodyData[rowMin][header], 'stateCopy', true);
      this.removeClass(['rectangleSelection']);
      this.cleanPropertyOnCell('copy');
    }

    while (rowMin <= rowMax) {
      // remove stateCopy if present of storeData
      const copyData = tbodyData[rowMin][this.headerKeys[colMin]];
      copyData.active = false;
      copyData.selected = false;
      copyData.stateCopy = false;

      storeData[this.headerKeys[colMin]] = copyData;
      colMin += 1;
      if (colMin > colMax) {
        this.storeCopyDatas.push(storeData);
        colMin = Math.min(this.selectedCoordCells.colStart, this.selectedCoordCells.colEnd);
        rowMin += 1;
        storeData = {};
      }
    }
    this.copyMultipleCell = true;
  } else {
    if (params === 'copy') {
      this.cleanPropertyOnCell('copy');
      this.$set(this.tbodyData[this.selectedCell.row][this.selectedCell.header], 'stateCopy', true);
    } else {
      this.storeCopyDatas = [];
    }
    // remove stateCopy if present of storeData
    const copyData = tbodyData[this.selectedCell.row][this.selectedCell.header];
    copyData.active = false;
    copyData.selected = false;
    copyData.stateCopy = false;
    this.storeCopyDatas.push(copyData);
    this.copyMultipleCell = false;
  }
};
const pasteReplaceData = () => {
  const maxRow = this.tbodyData.length;
  this.cleanPropertyOnCell('paste');

  // copy / paste one cell || disable on disabled cell
  if (this.storeCopyDatas[0].value && !this.copyMultipleCell && !this.selectedMultipleCell && !this.eventDrag && this.disabledEvent(this.selectedCell.col, this.selectedCell.header)) {
    const { duplicate } = this.tbodyData[this.selectedCell.row][this.selectedCell.header];
    this.storeCopyDatas[0].duplicate = duplicate;
    this.storeCopyDatas[0].active = true;

    // create newCopyData
    const newCopyData = JSON.parse(JSON.stringify(this.storeCopyDatas));
    [this.tbodyData[this.selectedCell.row][this.selectedCell.header]] = newCopyData;

    // callback changeData
    this.changeData(this.selectedCell.row, this.selectedCell.header);
    // disable on disabled cell
  } else if (this.disabledEvent(this.selectedCell.col, this.selectedCell.header) && this.selectedCoordCells) {
    // if paste in multiple selection
    const conditionPasteToMultipleSelection = this.selectedCoordCopyCells !== null && this.selectedCoordCells !== this.selectedCoordCopyCells;

    // new paste data
    const conditionRowToMultiplePasteRow = this.storeCopyDatas.length === 1
      && !this.storeCopyDatas[0].type
      && this.selectedCoordCopyCells !== null
      && Object.values(this.storeCopyDatas[0]).length > 1
      && this.selectedCoordCells.rowStart < this.selectedCoordCells.rowEnd;

    // copy / paste multiple cell | drag to fill one / multiple cell
    let rowMin = Math.min(this.selectedCoordCells.rowStart, this.selectedCoordCells.rowEnd);
    let rowMax = Math.max(this.selectedCoordCells.rowStart, this.selectedCoordCells.rowEnd);
    let colMin = Math.min(this.selectedCoordCells.colStart, this.selectedCoordCells.colEnd);
    let colMax = Math.max(this.selectedCoordCells.colStart, this.selectedCoordCells.colEnd);

    if (conditionPasteToMultipleSelection) {
      rowMin = Math.min(this.selectedCoordCopyCells.rowStart, this.selectedCoordCopyCells.rowEnd);
      rowMax = Math.max(this.selectedCoordCopyCells.rowStart, this.selectedCoordCopyCells.rowEnd);
    }

    if (conditionRowToMultiplePasteRow) {
      rowMin = Math.min(this.selectedCoordCells.rowStart, this.selectedCoordCells.rowEnd);
      rowMax = Math.max(this.selectedCoordCells.rowStart, this.selectedCoordCells.rowEnd);
    }

    if (conditionPasteToMultipleSelection || conditionRowToMultiplePasteRow) {
      colMin = Math.min(this.selectedCoordCopyCells.colStart, this.selectedCoordCopyCells.colEnd);
      colMax = Math.max(this.selectedCoordCopyCells.colStart, this.selectedCoordCopyCells.colEnd);
    }

    let row = 0;
    let col = 0;

    while (rowMin <= rowMax) {
      const header = this.headerKeys[colMin];
      const newCopyData = JSON.parse(JSON.stringify(this.storeCopyDatas));

      if (this.eventDrag) { // Drag To Fill
        const { duplicate } = this.tbodyData[rowMin][header];
        if (newCopyData[0][header]) {
          newCopyData[0][header].duplicate = duplicate;
          this.tbodyData[rowMin][header] = newCopyData[0][header]; // multiple cell
        } else {
          newCopyData[0].duplicate = duplicate;
          [this.tbodyData[rowMin][header]] = newCopyData; // one cell
        }
        this.changeData(rowMin, header);
      } else {
        let incrementRow = this.selectedCell.row + row;
        let incrementCol = this.selectedCell.col + col;

        if (this.selectedCoordCells !== this.selectedCoordCopyCells) {
          incrementRow = this.selectedCoordCells.rowStart + row;
          incrementCol = this.selectedCoordCells.colStart + col;
        }

        let currentHeader = this.headerKeys[incrementCol];

        // multiple col to multiple col
        const colsToCols = Object.values(newCopyData[0]).length === 1;
        if (colsToCols) {
          currentHeader = this.headerKeys[this.selectedCell.col];
          if (incrementRow < maxRow) {
            this.replacePasteData(col, header, incrementRow, currentHeader);
            col += 1;
          }
        }

        // one cell to multipleCell
        const cellToCells = newCopyData.length === 1 && Object.values(newCopyData).length === 1 && newCopyData[0].type;
        if (cellToCells) {
          currentHeader = this.selectedCell.header;
          newCopyData[0].duplicate = this.tbodyData[rowMin][currentHeader].duplicate;
          [this.tbodyData[rowMin][currentHeader]] = newCopyData;
          this.changeData(rowMin, currentHeader);
        }

        // 1 row to 1 row
        const rowToRow = newCopyData.length === 1 && Object.values(newCopyData[0]).length > 1 && !newCopyData[0].type && this.selectedCoordCells.rowStart === this.selectedCoordCells.rowEnd;
        if (rowToRow) {
          this.replacePasteData(0, header, this.selectedCell.row, currentHeader);
          col += 1;
        }

        // 1 row & multiple cols => to multiple row & cols
        const rowColsToRowsCols = newCopyData.length === 1
          && Object.values(newCopyData[0]).length > 1
          && this.selectedCoordCells.rowStart < this.selectedCoordCells.rowEnd
          && this.selectedCoordCells.colStart !== this.selectedCoordCells.colEnd;
        if (rowColsToRowsCols) {
          this.replacePasteData(0, header, incrementRow, currentHeader);
          if (colMin < colMax) {
            col += 1;
          } else {
            col = 0;
          }
        }

        // multiple col / row to multiple col / row
        const rowsColsToRowsCols = newCopyData.length > 1 && Object.values(newCopyData[0]).length > 1;
        if (rowsColsToRowsCols) {
          if (this.tbodyData[incrementRow][currentHeader]) {
            newCopyData[row][header].duplicate = this.tbodyData[incrementRow][currentHeader].duplicate;
          }
          this.replacePasteData(row, header, incrementRow, currentHeader);
          if (colMin < colMax) {
            col += 1;
          } else {
            col = 0;
          }
        }

        // add active / selected status on firstCell
        this.tbodyData[this.selectedCell.row][this.selectedCell.header].selected = true;
        this.tbodyData[this.selectedCell.row][this.selectedCell.header].active = true;
      }
      colMin += 1;
      if (colMin > colMax) {
        if (this.selectedCoordCopyCells !== null && this.selectedCoordCells !== this.selectedCoordCopyCells) {
          colMin = Math.min(this.selectedCoordCopyCells.colStart, this.selectedCoordCopyCells.colEnd);
        } else {
          colMin = Math.min(this.selectedCoordCells.colStart, this.selectedCoordCells.colEnd);
        }
        rowMin += 1;
        row += 1;
      }
    }
    this.modifyMultipleCell();
  }
};

// Drag To Fill
const handleDownDragToFill = (event, header, col, rowIndex) => {
  this.storeCopyDatas = [];
  this.$set(this.tbodyData[rowIndex][header], 'active', true);
  this.eventDrag = true;
  if (!this.selectedCoordCells && !this.selectedMultipleCell) {
    this.selectedCoordCells = {
      rowStart: this.selectedCell.row,
      colStart: this.selectedCell.col,
      keyStart: this.selectedCell.header,
      rowEnd: rowIndex,
      colEnd: this.selectedCell.col,
      keyEnd: this.selectedCell.header,
    };
  } else if (this.selectedMultipleCell) {
    // if drag col to col in row to row to row
    this.selectedCoordCells.rowStart = rowIndex;
  } else {
    this.selectedCoordCells = {
      rowStart: this.selectedCell.row,
      colStart: this.selectedCell.col,
      keyStart: this.selectedCell.header,
      rowEnd: rowIndex,
      colEnd: this.selectedCell.col,
      keyEnd: this.selectedCell.header,
    };
  }
  this.copyStoreData('drag');
};
const handleMoveDragToFill = (event, header, col, rowIndex, colIndex) => {
  if (this.eventDrag === true && this.selectedCoordCells && this.selectedCoordCells.rowEnd !== rowIndex) {
    this.selectedCoordCells.rowEnd = rowIndex;
    this.modifyMultipleCell('selected');
    this.$emit('tbody-move-dragtofill', this.selectedCoordCells, header, col, rowIndex, colIndex);
  }
};
const handleUpDragToFill = (event, header, rowIndex, colIndex) => {
  if (this.eventDrag === true && this.selectedCoordCells) {
    this.selectedCoordCells.rowEnd = rowIndex;
    this.pasteReplaceData();
    this.removeClass(['selected', 'rectangleSelection', 'active', 'show']);
    this.$emit('tbody-up-dragtofill', this.selectedCoordCells, header, rowIndex, colIndex);
    this.eventDrag = false;
    this.storeCopyDatas = [];
    this.selectedCoordCells = null;
  }
};

// Move On Cell
const moveOnSelect = (event) => {
  if (this.incrementOption <= this.filteredList.length) {
    // top
    const dropdown = this.$refs[`${this.customTable}-vueTbody`].$refs[`dropdown-${this.customTable}-${this.lastSelectOpen.colIndex}-${this.lastSelectOpen.rowIndex}`][0];
    if (event.keyCode === 38) {
      if (this.incrementOption <= this.filteredList.length && this.incrementOption > 0) {
        if (this.filteredList[this.incrementOption]) {
          this.$set(this.filteredList[this.incrementOption], 'active', false);
          this.incrementOption -= 1;
          this.$set(this.filteredList[this.incrementOption], 'active', true);
        } else {
          this.incrementOption -= 1;
          this.$set(this.filteredList[this.incrementOption], 'active', false);
          this.incrementOption -= 1;
          this.$set(this.filteredList[this.incrementOption], 'active', true);
        }
        if (this.incrementOption % 3 === 0) {
          dropdown.scrollTop -= (45 * 3);
        }
      }
    }
    // bottom
    if (event.keyCode === 40) {
      if (this.incrementOption < this.filteredList.length - 1) {
        if (this.incrementOption === 0 || this.incrementOption === 1) {
          this.$set(this.filteredList[this.incrementOption], 'active', true);
          this.incrementOption += 1;
          this.$set(this.filteredList[this.incrementOption], 'active', true);
          this.$set(this.filteredList[this.incrementOption - 1], 'active', false);
        } else if (this.incrementOption > 1) {
          this.$set(this.filteredList[this.incrementOption], 'active', false);
          this.incrementOption += 1;
          this.$set(this.filteredList[this.incrementOption], 'active', true);
        }
      }
      if (this.incrementOption % 3 === 0) {
        dropdown.scrollTop = 45 * this.incrementOption;
      }
    }
  }
  // enter
  if (event.keyCode === 13) {
    const oldSelect = this.lastSelectOpen;
    const currentSelect = this.tbodyData[oldSelect.rowIndex][oldSelect.header];
    this.handleTbodySelectChange(event, oldSelect.header, currentSelect, this.filteredList[this.incrementOption], oldSelect.rowIndex, oldSelect.colIndex);
  }
};
const moveOnTable = (event, colIndex, rowIndex) => {
  const vueTable = this.$refs[`${this.customTable}-vueTable`];

  const maxCol = Math.max(...this.colHeaderWidths);
  // get the correct height of visible table
  if (vueTable) {
    const heightTable = vueTable.clientHeight - vueTable.firstElementChild.clientHeight - this.$refs[`${this.customTable}-vueThead`].$el.clientHeight;
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
const pressShiftMultipleCell = (event, h, rowMax, rowIndex, colMax, colIndex) => {
  event.preventDefault();
  let header = h;
  this.$set(this.tbodyData[rowIndex][header], 'active', false);
  this.incrementCol = this.incrementCol ? this.incrementCol : colIndex;
  this.incrementRow = this.incrementRow ? this.incrementRow : rowIndex;
  if (this.pressedShift >= 0) {
    this.pressedShift += 1;
  }
  if (this.pressedShift === 0) {
    this.selectedCell = {
      header,
      row: rowIndex,
      col: colIndex,
    };
  }

  // shift / left
  if (event.keyCode === 37) {
    this.incrementCol -= 1;
    if (this.incrementCol < 0) {
      this.incrementCol = 0;
    }
    this.removeClass(['selected']);
  }
  // shift / top
  if (event.keyCode === 38) {
    this.incrementRow -= 1;
    if (this.incrementRow < 0) {
      this.incrementRow = 0;
    }
    this.removeClass(['selected']);
  }
  // shift / right
  if (event.keyCode === 39) {
    if (colMax >= this.incrementCol + 2) {
      this.incrementCol += 1;
    } else {
      this.$set(this.tbodyData[rowIndex][header], 'active', true);
    }
  }
  // shift / bottom
  if (event.keyCode === 40) {
    if (rowMax >= this.incrementRow + 2) {
      this.incrementRow += 1;
    } else {
      this.$set(this.tbodyData[rowIndex][header], 'active', true);
    }
  }
  header = Object.values(this.headerKeys)[this.incrementCol];
  this.$set(this.tbodyData[this.incrementRow][header], 'active', true);
  this.handleSelectMultipleCell(event, header, this.incrementRow, this.incrementCol);
};
const moveKeyup = (event) => {
  if (event.keyCode === 16) {
    this.keys[event.keyCode] = false;
    this.incrementCol = null;
    this.incrementRow = null;
    this.selectedMultipleCell = true;
    this.pressedShift = 0;
  }

  if (event.keyCode === 91 || event.keyCode === 17) {
    if (!this.disableKeyTimeout === null) {
      clearTimeout(this.disableKeyTimeout);
    }
    this.disableKeyTimeout = setTimeout(() => {
      this.keys.cmd = false;
      this.keys.ctrl = false;
      this.disableKeyTimeout = null;
    }, 400);
  }
};
const moveKeydown = (event) => {
  [this.actualElement] = document.getElementsByClassName('active_td');

  if (event.keyCode === 16) {
    this.keys[event.keyCode] = true;
  }

  if (event.keyCode === 91 || event.keyCode === 17) {
    this.keys.cmd = true;
    this.keys.ctrl = true;
  }

  if ((this.keys.cmd && event.keyCode === 90) || (this.keys.ctrl && event.keyCode === 90)) {
    this.rollBackUndo();
  }

  if (this.lastSelectOpen) {
    this.moveOnSelect(event);
  }

  if (this.actualElement
    && this.actualElement.getAttribute('current-table') === this.customTable.toString()
    && (event.keyCode === 37
    || event.keyCode === 39
    || event.keyCode === 40
    || event.keyCode === 38
    || event.keyCode === 13
    || event.keyCode === 27
    || event.keyCode === 8)) {
    this.removeClass(['selected']);

    const colIndex = Number(this.actualElement.getAttribute('data-col-index'));
    const rowIndex = Number(this.actualElement.getAttribute('data-row-index'));
    const dataType = this.actualElement.getAttribute('data-type');
    const header = this.actualElement.getAttribute('data-header');

    if (!this.setFirstCell) {
      this.$set(this.tbodyData[rowIndex][header], 'rectangleSelection', true);
      this.setFirstCell = true;
    }

    // set colMax rowMax
    const rowMax = this.tbodyData.length;
    const colMax = this.headers.length;

    this.moveOnTable(event, colIndex, rowIndex);

    // shift
    if (this.keys[16]) {
      this.pressShiftMultipleCell(event, header, rowMax, rowIndex, colMax, colIndex);
    } else if (!this.lastSelectOpen && event.keyCode !== 8) {
      if (this.selectedMultipleCell) {
        this.selectedMultipleCell = false;
      }
      this.$set(this.tbodyData[rowIndex][header], 'active', false);
      this.removeClass(['rectangleSelection']);
      // left
      if (event.keyCode === 37) {
        const decrementHeader = Object.values(this.headerKeys)[colIndex - 1];
        if (decrementHeader) {
          this.$set(this.tbodyData[rowIndex][decrementHeader], 'active', true);
          if (dataType === 'select') { this.activeSelectSearch(event, rowIndex, colIndex, decrementHeader); }
          this.updateSelectedCell(decrementHeader, rowIndex, colIndex - 1);
        } else {
          this.$set(this.tbodyData[rowIndex][header], 'active', true);
          if (dataType === 'select') { this.activeSelectSearch(event, rowIndex, colIndex, header); }
          this.updateSelectedCell(header, rowIndex, colIndex);
        }
      }
      // top
      if (event.keyCode === 38) {
        if (rowIndex !== 0) {
          this.$set(this.tbodyData[rowIndex - 1][header], 'active', true);
          if (dataType === 'select') { this.activeSelectSearch(event, rowIndex - 1, colIndex, header); }
          this.updateSelectedCell(header, rowIndex - 1, colIndex);
        } else {
          this.$set(this.tbodyData[rowIndex][header], 'active', true);
          if (dataType === 'select') { this.activeSelectSearch(event, rowIndex, colIndex, header); }
          this.updateSelectedCell(header, rowIndex, colIndex);
        }
      }
      // right
      if (event.keyCode === 39) {
        const incrementHeader = Object.values(this.headerKeys)[colIndex + 1];
        if (incrementHeader) {
          this.$set(this.tbodyData[rowIndex][incrementHeader], 'active', true);
          if (dataType === 'select') { this.activeSelectSearch(event, rowIndex, colIndex, incrementHeader); }
          this.updateSelectedCell(incrementHeader, rowIndex, colIndex + 1);
        } else {
          this.$set(this.tbodyData[rowIndex][header], 'active', true);
          if (dataType === 'select') { this.activeSelectSearch(event, rowIndex, colIndex, header); }
          this.updateSelectedCell(header, rowIndex, colIndex);
        }
      }
      // bottom
      if (event.keyCode === 40) {
        if (rowIndex + 1 !== rowMax) {
          this.$set(this.tbodyData[rowIndex + 1][header], 'active', true);
          if (dataType === 'select') { this.activeSelectSearch(event, rowIndex + 1, colIndex, header); }
          this.updateSelectedCell(header, rowIndex + 1, colIndex);
        } else {
          this.$set(this.tbodyData[rowIndex][header], 'active', true);
          if (dataType === 'select') { this.activeSelectSearch(event, rowIndex, colIndex, header); }
          this.updateSelectedCell(header, rowIndex, colIndex);
        }
      }
    }
    // press backspace
    if (event.keyCode === 8 && !this.lastSelectOpen) {
      this.handleTbodyNavBackspace(rowIndex, colIndex, header);
    }
    // press enter
    if (event.keyCode === 13) {
      if (this.$refs[`input-${this.customTable}-${colIndex}-${rowIndex}`]) {
        this.tbodyData[rowIndex][header].show = true;
        this.$refs[`input-${this.customTable}-${colIndex}-${rowIndex}`][0].focus();
      }
      this.$emit('tbody-nav-enter', event, event.keyCode, this.actualElement, rowIndex, colIndex);
    }
    // press esc
    if (event.keyCode === 27) {
      this.tbodyData[rowIndex][header].active = false;
      this.storeCopyDatas = [];
      this.removeClass(['stateCopy']);
    }
  }
};

export {
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
};
