<template>
  <thead class="thead"
    @mouseup="handleUpDragToFill($event)">
    <tr>
      <th class="index" v-if="tbodyCheckbox">
        <input
          type="checkbox"
          :id="`checkbox-all-${currentTable}`"
          v-model="checkedAll"
          @change="checkedAllRow">
        <label :for="`checkbox-all-${currentTable}`"></label>
      </th>
      <th v-if="tbodyIndex" class="index" key="th-index"></th>
      <template v-for="(header, colIndex) in headers">
        <th
          class="th"
          :class="{
            'disabled': header.disabled,
            'highlight_spreadsheet': theadHighlight.includes(colIndex)
          }"
          :ref="'th-' + colIndex"
          :key="header.headerKey"
          :style="[header.style, header.style.top = headerTop + 'px']">

          <span>{{header.headerName}}</span>

          <template
            v-if="submenuThead &&
            submenuThead.find(sub => sub.disabled.includes(header.headerKey) == 0)">
              <button
                @click="handleContextMenuTd($event, header.headerKey, colIndex)"
                :class="{'active': submenuThead && submenuStatusThead && colIndex === submenuEnableCol}"
                class="button_submenu button_submenu-2">
                <span class="icon icon_menu">
                  <i class="bullet bullet-1"></i>
                  <i class="bullet bullet-2"></i>
                  <i class="bullet bullet-3"></i>
                </span>
              </button>
          </template>

          <template
            v-if="sortHeader &&
            disableSortThead.indexOf(header.headerKey) === -1">
              <button
                @click="handleSort($event, header, colIndex)"
                :class="{'sort_A': header.activeSort === 'A', 'sort_Z' : header.activeSort === 'Z'}"
                class="button_submenu">
                <i class="icon sort"></i>
                <i class="icon sort"></i>
              </button>
          </template>

          <transition name="fade">
            <div
              v-if="submenuThead &&
              submenuStatusThead &&
              colIndex === submenuEnableCol &&
              submenuThead.find(sub => sub.disabled.includes(header.headerKey) == 0)"
              :key="'submenu-' + header.headerKey"
              class="submenu_wrap">
              <template v-for="(sub, index) in submenuThead">
                <template v-if="sub.type === 'button'">
                  <button
                    v-if="sub.disabled.includes(header.headerKey) == 0"
                    :key="index"
                    @click.stop="handleClickSubmenu($event, header, colIndex, sub.function)">
                    {{sub.value}}
                  </button>
                </template>
                <template v-if="sub.type === 'select'">
                  <div class="menu_option" :key="index" v-if="sub.disabled.includes(header.headerKey) == 0">
                    <template v-if="sub.subtitle"><h3>{{sub.subtitle}}</h3></template>
                    <select v-model="sub.value">
                      <option
                        v-for="(option, index) in sub.selectOptions"
                        :value="option.value"
                        :key="index">
                          {{option.label}}
                      </option>
                    </select>
                    <button
                      :style="sub.buttonOption.style"
                      @click.stop="handleClickSubmenu($event, header, colIndex, sub.buttonOption.function, sub.value)">
                        {{sub.buttonOption.value}}
                    </button>
                  </div>
                </template>
              </template>
            </div>
          </transition>

          <button
            :ref="'resize-' + colIndex"
            @mousedown="handleDownChangeSize($event, header, colIndex)"
            @mouseup="handleUpDragToFill($event, header, colIndex)"
            class="resize"
            :class="{'active': header.active}">
          </button>
        </th>
      </template>
    </tr>
  </thead>
</template>

<script src="./index.js"></script>

<style lang="scss" src="./index.scss"></style>
