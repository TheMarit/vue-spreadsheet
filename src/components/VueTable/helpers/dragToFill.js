// Drag To Fill
export default function vueTableHelperCopyPaste(vm) {
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

  return {
    handleDownDragToFill,
    handleMoveDragToFill,
    handleUpDragToFill,
  };
}
