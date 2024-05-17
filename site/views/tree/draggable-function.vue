<template>
  <div class="row">
    <div class="column">
      <div class="cell">
        <bk-tree
          :data="treeData"
          label="name"
          children="children"
          draggable
          :disable-drag="disableDrag"
          :disable-drop="disableDrop"
        >
          <template #node="item">
            <div>
              isFolder：{{ String(item.isFolder) }},
              disDraggable：{{ String(item.disabled) }},
              <span style="color: #3a84ff;">{{ item.name }}</span>，
            </div>
          </template>
        </bk-tree>
      </div>
    </div>
  </div>
</template>

<script>
  import { defineComponent } from 'vue';

  import { DRAG_TEST_DATA } from './options';
  export default defineComponent({
    components: {},
    data() {
      return {
        treeData: [...DRAG_TEST_DATA],
        disableDrag: node => node.disabled,
        disableDrop: node => !node.isFolder,
      };
    },
  });
</script>
<style scoped>
@import './tree.less';
</style>
