export default function vueTableHelperRollback(vm) {
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

  // changeData
  const changeData = (rowIndex, header) => {
    const cell = vm.tbodyData[rowIndex][header];
    vm.changeDataIncrement += 1;
    vm.storeUndoData.push({ rowIndex, header, cell });
    vm.$emit('tbody-change-data', rowIndex, header);
  };

  return {
    changeData,
    rollBackUndo,
    clearStoreUndo,
  };
}
