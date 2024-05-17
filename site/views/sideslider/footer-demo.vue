<template>
  <div>
    <bk-button
      @click="handleOpen"
      text
      theme="primary"
    >
      自定义footer
    </bk-button>
    <bk-sideslider
      v-model:isShow="isShow"
      title="我是自定义标题"
      quick-close
    >
      <template #default>
        <div :style="{ height: `${contentHeight}px` }" />
      </template>
      <template #footer>
        <bk-button
          theme="primary"
          @click="contentHeight = 1000"
        >
          设置内容高度1000px
        </bk-button>
        <bk-button
          style="margin-left: 8px"
          @click="contentHeight = 400"
        >
          设置内容高度400px
        </bk-button>
      </template>
    </bk-sideslider>
  </div>
</template>

<script setup>
import { defineComponent, ref } from 'vue';

const isShow = ref(false);
const contentHeight = ref(400);

const handleOpen = () => {
  isShow.value = true;
};
</script>
