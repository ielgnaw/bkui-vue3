<template>
  <div>
    <bk-button
      theme="primary"
      @click="handleShow"
    >
      提示框
    </bk-button>
  </div>
</template>

<script setup>
import InfoBox from '@bkui-vue/info-box';

const handleShow = () => {
  InfoBox({
    title: '左对齐 title',
    content: '集中 centen',
    headerAlign: 'left',
    contentAlign: 'center',
    footerAlign: 'right',
    onConfirm() {
      console.log('删除成功');
    },
    onCancel() {
      console.log('删除失败');
    },
  });
};
</script>
