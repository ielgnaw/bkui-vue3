<template>
  <div>
    <bk-button
      theme="primary"
      @click="handleDefault1"
    >
      提示框
    </bk-button>
    <bk-button
      theme="primary"
      style="margin-left: 15px"
      @click="handleDefault2"
    >
      提示框2
    </bk-button>
  </div>
</template>

<script setup>
import InfoBox from '@bkui-vue/info-box';

const handleDefault1 = () => {
  InfoBox({
    title: '确认要删除？',
    confirmFn() {},
  });
};

const handleDefault2 = () => {
  InfoBox({
    title: '请确认是否重置？',
    content: '重置后不可恢复',
  });
};
</script>
