# Spreadsheet Vue.js

## Description

** Project in progress **

:facepunch: An easier Spreadsheet in Vue.js :facepunch:

Do not hesitate to :star: my repo


## Project setup

```
yarn add spreadsheet-vuejs

npm i spreadsheet-vuejs
```

```
<script>
  import VueTable from 'spreadsheet-vuejs';
  export default {
    name: 'app',
    data() {
    },
    components: {
      VueTable,
    },
  };
</script>
```

## Wiki :mortar_board:

props                             | Type       | Description
----------------------------------|------------|-------------------
  :data                           | Array      | That contains data
  :drag-to-fill                   | Boolean    | That activates drag to fill
  :headers                        | Array      | That contains headers
  :new-data                       | Object     | That contains the type of data when you have empty cell in a row
  :submenu-tbody                  | Array      | That contains the submenu-tbody
  :submenu-thead                  | Array      | That contains the submenu-thead
  :disable-cells                  | Array      | That contains the headerKey you want to disable
  :sort-header                    | Boolean    | That activates sort button on header
  v-on:thead-td-sort              | Function   | When you press the button 
  v-on-thead-submenu-click-{#}    | Function   | {#} - Name of the function declared on **submenu-thead**
  v-on:tbody-input-change         | Function   | When the **input changes**
  v-on:tbody-nav-backspace        | Function   | When you press backspace on cell (event, actualElement, actualCol, rowIndex, colIndex)
  v-on:tbody-select-change        | Function   | When the **select change**
  v-on:tbody-submenu-click-{#}    | Function   | {#} - Name of the function declared on **submenu-tbody**

### Example

```
  <vue-table
    :data="Array"
    :disable-cells="disableCells"
    :drag-to-fill="Boolean"
    :headers="Array"
    :new-data="Object"
    :sort-header="Boolean"
    :submenu-tbody="Array"
    :submenu-thead="Array"
    v-on:thead-td-sort="Function"
    v-on:tbody-input-change="Function"
    v-on:tbody-nav-backspace="Function"
    v-on:tbody-select-change="Function"
    v-on:tbody-submenu-click-customize-function="Function"
    v-on:thead-submenu-click-customize-function="Function">
  </vue-table>
```

### Headers :tiger:

  Name              |  Type   | Description
--------------------|---------|-------------------
  headerName        | String  | The chosen header name
  headerkey         | String  | The Slugify version of the headerName
  style             | Object  | The style of the td
  disabled          | Boolean | optional - Disabled cell

#### Example

```
headers: [
  {
    headerName: 'Image',
    headerKey: 'img',
    style: {
      color: '#ddd',
    },
  },
  {
    headerName: 'Nom',
    headerKey: 'name',
    style: {
      color: '#ddd',
    },
  },
  {
    headerName: 'Prénom',
    headerKey: 'surname',
    style: {
      color: '#ddd',
    },
  },
  {
    headerName: 'Age',
    headerKey: 'age',
    style: {
      color: '#ddd',
    },
  },
  {
    headerName: 'Born',
    headerKey: 'born',
    style: {
      color: '#ddd',
    },
  },
],
```

### Data :honeybee:

  Name                |  Type   | Description
----------------------|---------|-------------------
  key                 | String  | The key of the object written in Slugify
  type                | String  | The type of data rendered (``<textarea>``, ``<img>``, ``<select>``)
  value(img/input)    | String  | The value of the object in *String Type*
  value(select)       | Array   | The value of the object in *Array Type*
  selectOptions       | Array   | That contains objects {value: ~, label: ~}
  style               | Object  | The Style of the cell
  active              | Boolean | Of the cell, false by default
  handleSearch        | Boolean | -	Activates search when selected
  disabled            | Boolean | optional - Disabled cell

#### Example

```
products: [
  {
    img: {
      type: 'img',
      value: 'https://via.placeholder.com/350x150',
      active: false,
      disabled: true,
    },
    name: {
      type: 'input',
      value: 'John',
      active: false,
      style: {
        color: '#000',
      },
    },
    surname: {
      type: 'input',
      value: 'Doe',
      active: false,
      style: {
        color: '#000',
      },
    },
    age: {
      type: 'select',
      handleSearch: true,
      selectOptions: [
        {
          value: 'paris',
          label: 'Paris',
        },
        {
          value: 'new-york',
          label: 'New York',
        },
      ],
      value: 'paris',
      active: false,
    },
    born: {
      type: 'select',
      handleSearch: true,
      selectOptions: [
        {
          value: 'france',
          label: 'France',
        },
        {
          value: 'usa',
          label: 'United States of America',
        },
      ],
      value: 'france',
      active: false,
    },
  },
],
```

### New Data :tiger:

#### Example

Same Object describe on the top

If you choose an input

```
newData: {
  type: 'input',
  value: '',
  active: false,
  style: {
    color: '#000',
    background: '#cfffcf',
  },
},
```

### submenu :monkey_face:

  Name             |  Type  | Description
-------------------|--------|---------------------------------------------------------------------------------------
  type             | String | The type of data rendered (``<button>`` || ``<select>``)
  value            | String | The value of the function
  function         | String | The name of the function called when you click on the button - *Written in Slugify*
  disabled         | Array  | Each object which you want to hide on the submenu
  subtitle         | String | Of the select
  selectOptions    | Array  | That contains objects {value: ~, label: ~}
-------------------|--------|----------------------------------------------------------------------------------------
  buttonOption     | Object | Description
-------------------|--------|----------------------------------------------------------------------------------------
    value          | String | The value of the button
    function       | String | The name of the function called when you click on the button - *Written in Slugify*
    style          | Object | The style of the button
-------------------|--------|----------------------------------------------------------------------------------------

#### Example

```
  submenuTbody: [
    {
      type: 'button',
      value: 'Change Color',
      function: 'change-color',
      disabled: ['img'],
    },
  ],
  submenuThead: [ 
    {
      type: 'button',
      value: 'Change Color',
      function: 'change-color',
      disabled: ['img', 'name'],
    },
    {
      type: 'select',
      disabled: ['img'],
      subtitle: 'Select state:',
      selectOptions: [
        {
          value: 'new-york',
          label: 'new-york',
        },
        {
          value: 'france',
          label: 'france',
        },
      ],
      value: 'new-york',
      buttonOption: {
        value: 'change city',
        function: 'change-city',
        style: {
          display: 'block',
        },
      },
    },
  ],
```

## Example :mortar_board: :tiger:

````
  # Template

  <vue-table
    :tbody-data="products"
    :headers="headers"
    :new-data="newData"
    :disable-cells="disableCells"
    :drag-to-fill="dragToFill"
    :sort-header="sortHeader"
    :submenu-tbody="submenuTbody"
    :submenu-thead="submenuThead"
    v-on:tbody-nav-backspace="deleteCell"
    v-on:tbody-input-change="InputChange"
    v-on:tbody-select-change="SelectChange">
    v-on:tbody-submenu-click-change-color="changeColorTbody"
    v-on:thead-td-sort="sortProduct"
    v-on:thead-submenu-click-change-color="changeColor">
  </vue-table>

  # Data

  data() {
    return {
      disableCells: ['img'],
      dragToFill: true,
      sortHeader: true,
      headers: [
        {
          headerName: 'Image',
          headerKey: 'img',
          style: {
            color: '#000',
          },
        },
      ],
      products: [
        {
          img: {
            type: 'img',
            value: 'https://via.placeholder.com/350x150',
            active: false,
            disabled: true,
          },
          name: {
            type: 'input',
            value: 'John',
            active: false,
            style: {
              color: '#000',
            },
          },
          surname: {
            type: 'input',
            value: 'Doe',
            active: false,
            style: {
              color: '#000',
            },
          },
          age: {
            type: 'select',
            handleSearch: true,
            selectOptions: [
              {
                value: 'paris',
                label: 'Paris',
              },
              {
                value: 'new-york',
                label: 'New York',
              },
            ],
            value: 'paris',
            active: false,
          },
          born: {
            type: 'select',
            handleSearch: true,
            selectOptions: [
              {
                value: 'france',
                label: 'France',
              },
              {
                value: 'usa',
                label: 'United States of America',
              },
            ],
            value: 'france',
            active: false,
          },
        },
      ],
      newData: {
        type: 'input',
        value: '',
        active: false,
        style: {
          color: '#000',
          background: '#cfffcf',
        },
      },
      submenuThead: [
        {
          type: 'button',
          value: 'change color',
          function: 'change-color',
          disabled: ['img', 'name'],
        },
      ],
      submenuTbody: [
        {
          type: 'button',
          value: 'change color',
          function: 'change-color',
          disabled: ['img'],
        },
      ],
    };
  },
  methods: {
    sortProduct(event, entry, colIndex) {
      // console.log('sort product');
    },
    deleteCell(event, actualElement, actualCol, rowIndex, colIndex) {
      // console.log(event, actualElement, actualCol, rowIndex, colIndex);
    },
    inputChange(event, entry, rowIndex, colIndex) {
      // Called when <input /> change
    },
    selectChange(event, entry, rowIndex, colIndex) {
      // Called when <select></select> change
    },
    changeColor(event, entry, rowIndex, colIndex, type, submenuFunction) {
      if (type === 'input') {
        this.headers[colIndex].style.color = '#e40000';
      }
    },
    changeColorTbody(event, entry, rowIndex, colIndex, type, submenuFunction) {
      if (type === 'input') {
        this.products[rowIndex][entry].value = 'T-shirt';
      }
    },
  },

````
