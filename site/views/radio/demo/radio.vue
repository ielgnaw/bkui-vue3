<template>
  <bk-radio
    v-model="value"
    label="QQ"
    :before-change="handleBeforeChange"
  />
  <bk-radio
    v-model="value"
    label="微信"
  />
  <bk-radio
    v-model="value"
    label="Email"
  />
  <div style="margin-top: 10px;">
    选中：{{ value }}
  </div>
</template>
<script setup>
  import { ref } from 'vue';

  import { BkRadio } from '@bkui-vue/radio';
  const handleBeforeChange = () => {
    return false;
  }

  const value = ref('微信');
</script>
