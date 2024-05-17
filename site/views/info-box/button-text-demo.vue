<template>
  <div>
    <bk-button
      theme="primary"
      @click="handleDefault"
    >
      提示框
    </bk-button>
  </div>
</template>

<script setup>
import InfoBox from '@bkui-vue/info-box';

const handleDefault = () => {
  InfoBox({
    title: '确认要删除1？',
    content: '确认要删除？',
    headerAlign: 'center',
    footerAlign: 'center',
    confirmText: '删除',
    cancelText: '取消',
  });
};
</script>
