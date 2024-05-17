<template>
  <div>
    <bk-button
      @click="handleOpen"
      text
      theme="primary"
    >
      自定义标题和内容
    </bk-button>
    <bk-sideslider
      v-model:isShow="isShow"
      title="我是自定义标题"
    >
      <template #default>
        <div style="height: 1200px">我是自定义内容</div>
      </template>
    </bk-sideslider>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const isShow = ref(false);

const handleOpen = () => {
  isShow.value = true;
};
</script>
