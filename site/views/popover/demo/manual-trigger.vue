<template>
  <bk-button @click="handleBtnClick(true)"> 手动设置Isshow = true </bk-button>
  <bk-button @click="handleBtnClick(false)"> 手动设置Isshow = false </bk-button>
  <bk-popover
    width="450"
    :is-show="isShow"
    theme="light"
    trigger="manual"
    @after-hidden="handleAfterHidden"
  >
    <bk-button> 占位区域 </bk-button>
    <template #content>
      <div>
        今天天气不错 今天天气不错 今天天气不错 今天天气不错 今天天气不错 今天天气不错 今天天气不错 今天天气不错
        今天天气不错 今天天气不错 今天天气不错 今天天气不错 今天天气不错 今天天气不错 今天天气不错 今天天气不错
        今天天气不错 今天天气不错 今天天气不错 今天天气不错 今天天气不错 今天天气不错 今天天气不错 今天天气不错
        今天天气不错 今天天气不错 今天天气不错 今天天气不错 今天天气不错 今天天气不错 今天天气不错 今天天气不错
        今天天气不错 今天天气不错 今天天气不错 今天天气不错 今天天气不错 今天天气不错 今天天气不错 今天天气不错
        今天天气不错 今天天气不错 今天天气不错 今天天气不错 今天天气不错 今天天气不错 今天天气不错 今天天气不错
        今天天气不错 今天天气不错 今天天气不错 今天天气不错 今天天气不错 今天天气不错 今天天气不错 今天天气不错
        今天天气不错 今天天气不错 今天天气不错 今天天气不错 今天天气不错 今天天气不错 今天天气不错 今天天气不错
        今天天气不错 今天天气不错 今天天气不错 今天天气不错 今天天气不错 今天天气不错 今天天气不错 今天天气不错
      </div>
    </template>
  </bk-popover>
</template>
<script>
  export default {
    data() {
      return {
        isShow: false,
      };
    },
    methods: {
      handleBtnClick(val) {
        this.isShow = val;
      },
      handleAfterHidden({ isShow }) {
        this.isShow = isShow;
      },
    },
  };
</script>
