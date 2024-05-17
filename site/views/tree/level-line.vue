<template>
  <div class="row">
    <div class="column">
      <span>默认连线</span>

      <div class="cell">
        <bk-tree
          :data="treeData"
          level-line
          label="name"
          children="children"
        />
      </div>
    </div>
    <div class="column">
      <span>自定义连线</span>

      <div class="cell">
        <bk-tree
          :data="treeData"
          :level-line="'solid 1px red'"
          label="name"
          children="children"
        />
      </div>
    </div>
  </div>
</template>

<script>
  import { defineComponent } from 'vue';

  import { BASIC_DATA } from './options';
  export default defineComponent({
    components: {},
    data() {
      return {
        treeData: [...BASIC_DATA],
      };
    },
  });
</script>
<style scoped>
@import './tree.less';
</style>
