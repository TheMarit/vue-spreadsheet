export default {
  name: 'vue-thead',
  props: {
    theadHighlight: {
      type: Array,
      required: true,
    },
    headerTop: {
      type: Number,
      required: true,
    },
    headers: {
      type: Array,
      required: true,
    },
    currentTable: {
      type: Number,
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
    sortHeader: {
      type: Boolean,
      required: false,
    },
    tbodyIndex: {
      type: Boolean,
      required: false,
    },
    tbodyCheckbox: {
      type: Boolean,
      required: false,
    },
    submenuStatusThead: {
      type: Boolean,
      required: false,
    },
  },
  data() {
    return {
      checkedAll: false,
      beforeChangeSize: {},
      eventDrag: false,
      newSize: '',
      submenuEnableCol: null,
      vueTableHeight: 0,
    };
  },
  mounted() {
    window.addEventListener('mousemove', this.handleMoveChangeSize);
  },
  methods: {
    checkedAllRow() {
      this.$emit('thead-checked-all-callback', this.checkedAll);
    },
    removeClass(params, colIndex) {
      this.headers.forEach((header, index) => {
        if (index !== colIndex) {
          this.$set(this.headers[index], 'activeSort', '');
        }
      });
    },
    handleDownChangeSize(event, header, colIndex) {
      this.eventDrag = true;
      const head = header;

      if (this.$parent && this.$parent.$refs && this.$parent.$refs.vueTable) {
        this.vueTableHeight = this.$parent.$refs.vueTable.offsetHeight;
      }

      this.beforeChangeSize = {
        col: colIndex,
        elementLeft: event.currentTarget.parentElement.offsetLeft,
        header: head,
        width: parseInt(head.style.width, 10),
      };

      head.active = true;
      head.style.left = event.clientX;

      const element = this.$refs[`resize-${this.beforeChangeSize.col}`][0];
      element.style.opacity = 0;
      element.style.top = `${element.parentElement.offsetTop}px`;
      element.style.opacity = 1;

      this.$forceUpdate();
    },
    handleMoveChangeSize(event) {
      if (this.eventDrag) {
        const elm = this.$refs[`resize-${this.beforeChangeSize.col}`][0];
        const offsetTopVueTable = elm.offsetTop;
        const offsetBottomVueTable = offsetTopVueTable + elm.offsetHeight;

        if (offsetTopVueTable <= event.clientY && offsetBottomVueTable >= event.clientY) {
          const element = this.$refs[`resize-${this.beforeChangeSize.col}`][0];
          element.style.left = `${event.clientX}px`;
          // set height of after dragElement
          const heightTbody = this.vueTableHeight;
          element.style.setProperty('--dragHeaderHeight', `${heightTbody}px`);
        } else {
          this.handleUpDragToFill(event);
        }
      }
    },
    handleUpDragToFill(event) {
      if (this.eventDrag) {
        this.eventDrag = false;
        // get new size
        let offsetParentLeft = 0;
        if (this.$refs[`th-${this.beforeChangeSize.col}`][0] && this.$refs[`th-${this.beforeChangeSize.col}`][0].offsetParent) {
          offsetParentLeft = this.$refs[`th-${this.beforeChangeSize.col}`][0].offsetParent.offsetLeft;
        }
        const scrollLeftParent = this.$parent.$refs.vueTable ? this.$parent.$refs.vueTable.scrollLeft : 0;
        const newWidth = ((event.clientX - (this.beforeChangeSize.elementLeft + offsetParentLeft)) + scrollLeftParent) + 5;
        this.newSize = `${newWidth}px`;
        // set initial style on button resize
        const element = this.$refs[`resize-${this.beforeChangeSize.col}`][0];
        element.style.left = 'auto';
        element.style.top = '0';
        element.style.opacity = '';
        // set height of after dragElement
        element.style.setProperty('--dragHeaderHeight', '100%');
        // set new size on header
        this.$set(this.headers[this.beforeChangeSize.col].style, 'width', this.newSize);
        this.$set(this.headers[this.beforeChangeSize.col].style, 'minWidth', this.newSize);
        this.$set(this.headers[this.beforeChangeSize.col], 'active', false);

        this.$emit('handle-up-drag-size-header', event, this.headers);
      }
    },
    handleSort(event, h, colIndex) {
      const header = h;
      if (!header.activeSort || header.activeSort === 'Z') {
        this.$set(this.headers[colIndex], 'activeSort', 'A');
      } else {
        this.$set(this.headers[colIndex], 'activeSort', 'Z');
      }
      this.removeClass('activeSort', colIndex);
      this.$emit('thead-td-sort', event, header, colIndex);
    },
    handleContextMenuTd(event, header, colIndex) {
      this.submenuEnableCol = colIndex;
      if (this.submenuStatusThead === true) {
        this.$emit('submenu-enable', 'tbody');
      } else {
        this.$emit('submenu-enable', 'thead');
      }
      this.$emit('thead-td-context-menu', event, header, colIndex);
    },
    handleClickSubmenu(event, header, colIndex, submenuFunction, selectOptions) {
      if (selectOptions) {
        this.$emit('thead-submenu-click-callback', event, header, colIndex, submenuFunction, selectOptions);
      } else {
        this.$emit('thead-submenu-click-callback', event, header, colIndex, submenuFunction);
      }
    },
  },
};
