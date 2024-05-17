<template>
  <div>
    <bk-table
      :columns="columns"
      :data="tableData"
      :pagination="pagination"
      :height="300"
      border="horizontal"
      remote-pagination
      @page-value-change="handlePageValueChange"
      @page-limit-change="handlePageLimitChange"
      @column-sort="handleColumnSort"
    />
  </div>
</template>

<script>
  import { defineComponent } from 'vue';

  import { DATA_FIX_COLUMNS } from './options';

  export default defineComponent({
    components: {},
    data() {
      return {
        tableData: [],
        columns: [...DATA_FIX_COLUMNS],
        pagination: { count: 100, limit: 10, current: 1 },
      };
    },
    mounted() {
      this.setCurrentData();
    },
    methods: {
      setCurrentData() {
        const start = (this.pagination.current - 1) * this.pagination.limit;
        setTimeout(() => {
          this.tableData = new Array(this.pagination.limit).fill('')
            .map((_, index) => ({
              ip: `${start + index}--192.168.0.x`,
              source: `${start + index}_QQ`,
              status: '创建中',
              create_time: `2018-05-25 15:02:24.${start + index}`,
            }));

        }, 100);

      },
      handlePageValueChange(value) {
        this.pagination.current = value;
        console.log('handlePageValueChange', value);
        this.setCurrentData();
      },
      handlePageLimitChange(limit) {
        this.pagination.limit = limit;
        this.setCurrentData();
      },
      handleColumnSort(...args) {
        console.log('sort', args);
      },
    },
  });
</script>
