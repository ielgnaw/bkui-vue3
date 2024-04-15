<template>
  <div>
    <p style="font-size: 14px;">
      日期选择器 {{ dateValue }}
    </p>
    <bk-date-picker
      v-model="initDate"
      clearable
      :disable-date="disableDate"
      @change="handleChange"
    />
  </div>
  <div style="height: 300px;"></div>
  <div>
    <p style="font-size: 14px;">
      月选择器 {{ monthValue }}
    </p>
    <bk-date-picker
      v-model="initMonthDateTime"
      type="month"
      open
      @change="handleMonthChange"
    />
  </div>
</template>

<script setup>
  import { ref } from 'vue';
  const initDate = ref(new Date());
  const disableDate = date => date && date.valueOf() < Date.now() - 86400;
  const dateValue = ref('');
  const handleChange = (val) => {
    console.warn('handleChange', val, initDate);
    dateValue.value = val;
  };

  const initMonthDateTime = ref(new Date(2024, 5));
  const monthValue = ref('');
  const handleMonthChange = (val) => {
    console.warn('handleChange', val, initMonthDateTime);
    monthValue.value = val;
  };
</script>
