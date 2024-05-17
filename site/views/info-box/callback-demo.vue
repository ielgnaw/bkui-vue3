<template>
  <div>
    <bk-button
      theme="primary"
      @click="handleShow"
    >
      点击删除(成功)
    </bk-button>
  </div>
</template>

<script setup>
import InfoBox from '@bkui-vue/info-box';

const handleShow = () => {
  InfoBox({
    title: '确认要删除1？',
    content: '删除后不可恢复',
    onConfirm() {
      console.log('删除成功');
    },
    onCancel() {
      console.log('删除失败');
    },
  });
};
</script>
