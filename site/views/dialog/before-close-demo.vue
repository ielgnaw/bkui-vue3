<template>
  <div>
    <bk-button
      text
      theme="primary"
      @click="handleShow"
    >
      打开dialog
    </bk-button>
    <bk-dialog
      v-model:is-show="isShow"
      title="关闭前确认"
      :theme="'primary'"
      :before-close="beforeClose"
      @confirm="handleConfirm"
    >
      <div>关闭前确认</div>
    </bk-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue';

import BkButton from '@bkui-vue/button';
import BkDialog from '@bkui-vue/dialog';
import InfoBox from '@bkui-vue/info-box';

const isShow = ref(false);

const beforeClose = () =>
  new Promise((resolve, reject) => {
    InfoBox({
      title: '确认关闭弹框',
      onConfirm: () => resolve(true),
      onCancel: () => reject(),
    });
  });

const handleShow = () => {
  isShow.value = true;
};

const handleConfirm = () => {
  isShow.value = false;
};
</script>
