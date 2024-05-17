<template>
  <div>
    <bk-button
      @click="handleRight"
      text
      theme="primary"
    >
      右侧
    </bk-button>
    <bk-button
      @click="handleLeft"
      style="margin-left: 10px"
      text
      theme="primary"
    >
      左侧
    </bk-button>

    <bk-sideslider
      v-model:isShow="isShowRight"
      title="我是标题"
      quick-close
      transfer
    >
      right
    </bk-sideslider>
    <bk-sideslider
      v-model:isShow="isShowLeft"
      title="我是标题"
      quick-close
      direction="left"
      transfer
    >
      left
    </bk-sideslider>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const isShowRight = ref(false);
const isShowLeft = ref(false);

const handleRight = () => {
  isShowRight.value = true;
};

const handleLeft = () => {
  isShowLeft.value = true;
};
</script>
