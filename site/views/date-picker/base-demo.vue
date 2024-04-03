<template>
  <div>
    <p style="font-size: 14px;">
      日期选择器 {{ dateValue }}
    </p>
    <bk-date-picker
      v-model="initDate"
      clearable
      open
      append-to-body
      :disable-date="disableDate"
      @change="handleChange"
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
</script>
