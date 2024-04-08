<template>
  <date-picker v-model="value" />
</template>
<script setup lang="ts">
import { ref } from 'vue';

import DatePicker from '@blueking/date-picker';

import '@blueking/date-picker/vue3/vue3.css';
const value = ref(['now-1d', 'now']);
</script>
