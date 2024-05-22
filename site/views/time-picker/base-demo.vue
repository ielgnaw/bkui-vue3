<template>
  <!-- format="HH:mm" -->
  <!-- format="HH时 mm分 ss秒" -->
  <bk-time-picker
    v-model="dateValue"
    clearable
    editable
    show-now
    @change="handleChange"
  />
</template>

<script setup>
  import { ref } from 'vue';
  const dateValue = ref('22:12:12');
  const handleChange = (date) => {
    console.log('handleChange', date);
    dateValue.value = date;
  };
</script>
