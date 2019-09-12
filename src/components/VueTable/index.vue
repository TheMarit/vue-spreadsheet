<template>
  <div
    :ref="`${customTable}-vueTable`"
    :style="styleWrapVueTable"
    @scroll="scrollFunction">

    <slot name="header">
    </slot>

    <table
      class="vue_table"
      oncontextmenu="return false;"
      :ref="`${customTable}-table`">
      <vue-thead
        :ref="`${customTable}-vueThead`"
        :disable-sort-thead="disableSortThead"
        :header-top="headerTop"
        :headers="headers"
        :sort-header="customOptions.sortHeader"
        :submenu-status-thead="submenuStatusThead"
        :submenu-thead="submenuThead"
        :tbody-index="customOptions.tbodyIndex"
        :tbody-checkbox="customOptions.tbodyCheckbox"
        :thead-highlight="highlight.thead"
        :current-table="customTable"
        @handle-up-drag-size-header="handleUpDragSizeHeader"
        @handle-up-drag-to-fill="handleUpDragToFill"
        @submenu-enable="enableSubmenu"
        @thead-checked-all-callback="callbackCheckedAll"
        @thead-submenu-click-callback="callbackSubmenuThead"
        @thead-td-context-menu="handleTheadContextMenu"
        @thead-td-sort="callbackSort">
      </vue-thead>

      <slot name="loader" v-if="loading">
      </slot>

      <vue-tbody v-if="!loading"
        :ref="`${customTable}-vueTbody`"
        :tbody-data="tbodyData"
        :headers="headers"
        :tbody-checkbox="customOptions.tbodyCheckbox"
        :tbody-index="customOptions.tbodyIndex"
        :trad="customOptions.trad"
        :disable-cells="disableCells"
        :submenu-tbody="submenuTbody"
        :filtered-list="filteredList"
        :submenu-status-tbody="submenuStatusTbody"
        :tbody-highlight="highlight.tbody"
        :current-table="customTable"
        @tbody-checked-row="checkedRow"
        @handle-to-calculate-position="calculPosition"
        @handle-to-open-select="enableSelect"
        @submenu-enable="enableSubmenu"
        @tbody-down-dragtofill="handleDownDragToFill"
        @tbody-handle-search-input-select="handleSearchInputSelect"
        @tbody-handle-set-oldvalue="setOldValueOnInputSelect"
        @tbody-input-change="handleTbodyInputChange"
        @tbody-move-dragtofill="handleMoveDragToFill"
        @tbody-select-change="handleTbodySelectChange"
        @tbody-select-multiple-cell="handleSelectMultipleCell"
        @tbody-submenu-click-callback="callbackSubmenuTbody"
        @tbody-td-click="handleTbodyTdClick"
        @tbody-td-context-menu="handleTBodyContextMenu"
        @tbody-td-double-click="handleTbodyTdDoubleClick"
        @tbody-up-dragtofill="handleUpDragToFill">
      </vue-tbody>
    </table>
  </div>
</template>

<script src="./index.js"></script>

<style lang="scss" src="./index.scss"></style>
