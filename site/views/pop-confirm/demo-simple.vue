<template>
  <div>
    <bk-pop-confirm
      width="288"
      content="删除结果数据时，将同时删除该结果数据下的所有样本曲线，请确认！"
      trigger="click"
      @confirm="ensure"
    >
      <bk-button>删除</bk-button>
    </bk-pop-confirm>
  </div>
</template>
<script>
  import { defineComponent } from 'vue';

  export default defineComponent({
    components: {},
    setup() {
      function ensure() {
        console.log('ensure');
      }
      return {
        ensure,
      };
    },
  });
</script>
