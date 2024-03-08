<template>
  <div>
    <p style="font-size: 14px;">
      年选择器 {{ yearValue }}
    </p>
    <bk-date-picker
      v-model="initYearDateTime"
      type="year"
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
      @change="handleQuarterChange"
    />
  </div>
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

  const initQuarterDateTime = ref(new Date(2024, 3, 5));
  const quarterValue = ref('');
  const handleQuarterChange = (val) => {
    console.warn('handleChange', val, initQuarterDateTime);
    quarterValue.value = val;
  };
</script>
