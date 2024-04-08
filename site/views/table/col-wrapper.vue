<template>
  <div :class="className">
    <slot name="body" />
    <slot />
  </div>
</template>
<script setup>
  import { ref } from 'vue';
  const className = ref('col-wrapper-xxx');
</script>
