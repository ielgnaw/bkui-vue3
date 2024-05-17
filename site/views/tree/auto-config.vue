<template>
  <div class="row">
    <div class="column">
      <span>默认连线: <code>level-line="true"</code></span>
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
      <div class="cell">
        <bk-tree
          :data="autoOpen"
          label="name"
          children="children"
          :auto-open-parent-node="false"
        />
      </div>
    </div>
    <div class="column">
      <bk-button @click="handleAutoSelect">
        设置选中节点
      </bk-button>
      <div class="cell">
        <bk-tree
          ref="refAutoSelect"
          :data="autoCheck"
          label="name"
          children="children"
          :selected="selected"
        />
      </div>
    </div>
  </div>
</template>

<script>
  import { defineComponent } from 'vue';

  import { AUTO_CHECKED_DATA, AUTO_OPEN_DATA, BASIC_DATA } from './options';
  export default defineComponent({
    components: {},
    data() {
      return {
        treeData: [...BASIC_DATA],
        autoOpen: [...AUTO_OPEN_DATA],
        autoCheck: [...AUTO_CHECKED_DATA],
        selected: null,
      };
    },
    methods: {
      handleAutoSelect() {
        const treeData = this.$refs.refAutoSelect.getData();
        const { length } = treeData.data;
        const randomIndex = Math.floor(Math.random() * length);
        this.selected = treeData.data[randomIndex];
      },
    },
  });
</script>
<style scoped>
@import './tree.less';
</style>
