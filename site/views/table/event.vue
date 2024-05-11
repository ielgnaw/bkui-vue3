<template>
  <div style=" width: 100%;height: 300px;">
    <bk-table
      :columns="columns"
      :data="tableData"
      :is-row-select-enable="isRowSelectEnable"
      @row-click="handleRowClick"
      @select="handleRowSelect"
    />
    <span>on row click: {{ `index: ${ activeRowInfo.index }` }}</span>
  </div>
</template>

<script>
  import { defineComponent } from 'vue';

  import { DATA_COLUMNS, DATA_TABLE } from './options';
  export default defineComponent({
    components: {},
    data() {
      return {
        tableData: [...DATA_TABLE],
        columns: [{ type: 'selection', width: 20, }, ...DATA_COLUMNS],
        activeRowInfo: {},
      };
    },
    methods: {
      isRowSelectEnable({ index }) {
        return index % 3 === 0;
      },
      handleRowSelect(arg) {
        console.log('handleRowSelect', arg);
      },
      handleRowClick(e, row, index, rows, source) {
        Object.assign(this.activeRowInfo, { e, row, index, rows, source });
        console.log('active row', this.activeRowInfo);
      },
    },
  });
</script>
