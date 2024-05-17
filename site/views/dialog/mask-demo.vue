<template>
  <bk-button
    text
    theme="primary"
    @click="handleShow"
  >
    打开弹框
  </bk-button>
  <bk-dialog
    v-model:is-show="isShow"
    title="没有遮罩的 dialog"
    theme="primary"
    :show-mask="false"
  >
    没有遮罩
  </bk-dialog>
</template>

<script setup>
import { ref } from 'vue';

const isShow = ref(false);

const handleShow = () => {
  isShow.value = true;
};
</script>
