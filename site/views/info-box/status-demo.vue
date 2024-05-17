<template>
  <div>
    <bk-button
      theme="success"
      @click="handleDefault1"
    >
      成功
    </bk-button>

    <bk-button
      theme="danger"
      class="ml10"
      style="margin-left: 15px"
      @click="handleDefault2"
    >
      错误
    </bk-button>

    <bk-button
      theme="warning"
      class="ml10"
      style="margin-left: 15px"
      @click="handleDefault3"
    >
      警告
    </bk-button>

    <bk-button
      class="ml10"
      style="margin-left: 15px"
      @click="handleDefault4"
    >
      loading
    </bk-button>
  </div>
</template>

<script setup>
import { h } from 'vue';

import InfoBox from '@bkui-vue/info-box';
const handleDefault1 = () => {
  InfoBox({
    type: 'success',
    title: '添加用户成功',
    content: h(
      'a',
      {
        style: {
          color: '#3a84ff',
          textDecoration: 'none',
          cursor: 'pointer',
        },
      },
      '继续添加',
    ),
  });
};

const handleDefault2 = () => {
  InfoBox({
    type: 'danger',
    title: '添加用户失败',
  });
};

const handleDefault3 = () => {
  InfoBox({
    type: 'warning',
    title: '此操作存在安全风险',
  });
};

const handleDefault4 = () => {
  InfoBox({
    type: 'loading',
    title: 'loding',
    content: '请稍等',
  });
};
</script>
