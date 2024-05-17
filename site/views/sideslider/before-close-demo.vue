<template>
  <div>
    <bk-button
      text
      theme="primary"
      @click="handleOpen"
    >
      打开侧栏
    </bk-button>

    <bk-sideslider
      v-model:isShow="isShow"
      title="我是标题"
      :before-close="beforeClose"
    >
      hello world!!!
    </bk-sideslider>
  </div>
</template>
<script setup>
import InfoBox from '@bkui-vue/info-box';
import { ref } from 'vue';

const isShow = ref(false);

const beforeClose = () =>
  new Promise((resolve, reject) => {
    InfoBox({
      title: '确认关闭?',
      infoType: 'warning',
      onConfirm: () => resolve(true),
      onCancel: () => reject(),
    });
  });

const handleOpen = () => {
  isShow.value = true;
};
</script>
