<template>
  <!-- format="HH:mm" -->
  <bk-time-picker
    v-model="dateValue"
    clearable
    editable
    @change="handleChange"
  />
</template>

<script setup>
  import { ref } from 'vue';
  const dateValue = ref('12:12:12');
  const handleChange = (date) => {
    console.log('handleChange', date);
    dateValue.value = date;
  };
</script>
