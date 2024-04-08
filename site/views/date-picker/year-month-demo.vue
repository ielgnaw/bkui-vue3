<template>
  <!-- <bk-date-picker
      :value="initYearDateTime"
      type="year"
      :open="true"
      @change="handleYearChange"
    /> -->

  <!-- :cell-class="getCellClass" -->
  <!-- <div>
    <p style="font-size: 14px;">
      年选择器 {{ yearValue }}
    </p>
    <bk-date-picker
      v-model="initYearDateTime"
      type="year"
      :append-to-body="false"
      @change="handleYearChange"
    />
  </div>
  <div>
    <p style="font-size: 14px;">
      季度选择器 {{ quarterValue }}
    </p>
    <bk-date-picker
      v-model="initQuarterDateTime"
      type="quarter"
      :append-to-body="true"
      @change="handleQuarterChange"
    />
  </div> -->
  <div>
    <p style="font-size: 14px;">
      月选择器 {{ monthValue }}
    </p>
    <bk-date-picker
      v-model="initMonthDateTime"
      type="month"
      @change="handleMonthChange"
    />
  </div>
</template>

<script setup>
  import { ref } from 'vue';
  const initYearDateTime = ref(new Date(2016, 12, 5));
  const yearValue = ref('');
  const handleYearChange = (val) => {
    console.warn('handleChange', val, initYearDateTime);
    yearValue.value = val;
  };
  // setTimeout(() => {
  //   console.error(('setTimeoutsetTimeoutsetTimeout'));
  //   initDateTime.value = new Date(2220, 1, 19);
  // }, 3000);

  const initMonthDateTime = ref(new Date(2024, 5));
  const monthValue = ref('');
  const handleMonthChange = (val) => {
    console.warn('handleChange', val, initMonthDateTime);
    monthValue.value = val;
  };

  const initQuarterDateTime = ref(new Date(2018, 5, 5));
  const quarterValue = ref('');
  const handleQuarterChange = (val) => {
    console.warn('handleChange', val, initQuarterDateTime);
    quarterValue.value = val;
  };

  const getCellClass = (_cell) => {
    const hasPoint = Math.random() * 10 > 5;
    return hasPoint ? 'cell-x-Class' : '';
  };
</script>
<style lang="less">
  .cell-x-Class {
    position: relative;
    &::after {
      content: '';
      background: red;
      position: absolute;
      left: 15px;
      bottom: 0;
      border-radius: 50%;
      border: solid 1px red;
      width: 26px;
    }
  }
</style>
