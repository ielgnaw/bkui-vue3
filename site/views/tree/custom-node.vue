<template>
  <div class="row">
    <div class="column">
      <span>自定义节点内容</span>

      <div class="cell">
        <bk-tree
          :data="treeData"
          level-line
          label="name"
          children="children"
        >
          <template #default="{ data }">
            <span style="color: #3a84ff;">(自定义节点)：{{ JSON.stringify(data) }}</span>
          </template>
        </bk-tree>
      </div>
    </div>
    <div class="column">
      <span>自定义节点展开\收起</span>

      <div class="cell">
        <bk-tree
          :data="treeData"
          level-line
          label="name"
          children="children"
        >
          <template #nodeAction="item">
            <span
              :style="`color: ${item.__attr__.isOpen ? '#FF9C01;' : '#EA3636;'}`"
            >
              {{ item.__attr__.hasChildNode ? (item.__attr__.isOpen ? '--' : '+') : '*' }}
            </span>
          </template>
        </bk-tree>
      </div>
    </div>
    <div class="column">
      <span>自定义节点节点类型</span>

      <div class="cell">
        <bk-tree
          :data="treeData"
          level-line
          label="name"
          children="children"
        >
          <template #nodeType="item">
            <span style="padding: 0 5px;">
              {{ item.__attr__.hasChildNode ? 'P' : 'C' }}
            </span>
          </template>
        </bk-tree>
      </div>
    </div>
    <div class="column">
      <span>自定义节点后缀</span>

      <div class="cell">
        <bk-tree
          :data="treeData"
          level-line
          label="name"
          children="children"
        >
          <template #nodeAppend>
            <span style="padding: 0 5px; color: red;">Append</span>
          </template>
        </bk-tree>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { BASIC_DATA } from './options';
  const treeData = [...BASIC_DATA];
</script>
<style scoped>
.custom-node {
  display: flex;
  width: 18px;
  height: 18px;
  padding: 0 5px;
  margin: 0 2px 0 0;
  background: #cccc;
  align-items: center;
}

.custom-root {
  background: #fafb;
}

.row {
  .column {
    width: 25%;
  }
}
</style>
<style scoped>
@import './tree.less';
</style>
