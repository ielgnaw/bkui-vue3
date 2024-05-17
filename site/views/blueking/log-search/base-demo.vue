<template>
  <div class="app">
    <log-search
      :show-auto-query="true"
      :service-config="serviceConfig"
    />
  </div>
</template>
<script setup lang="ts">
import LogSearch from '@blueking/log-search';
// 如果项目没有安装bkui-vue, dayjs 则可使用全量版本
// import LogSearch from '@blueking/log-search/vue3';

import '@blueking/log-search/dist/vue3-light.css';

const serviceConfig = {
  fetchIndexSetList: () => Promise.resolve(), // 索引集列表
  fetchSearchConditions: () => Promise.resolve(), // 查询条件
  fetchSearchConditionOptions: () => Promise.resolve(), // 查询条件候选值
  fetchSearchHistory: () => Promise.resolve(), // 历史查询
  fetchQueryStringInspect: () => Promise.resolve(), // 检索语句语法检测
  fetchUserSettings: () => Promise.resolve(), // 用户配置
  updateUserSettings: () => Promise.resolve(), // 保存用户配置
  fetchLogSearch: () => Promise.resolve(), // 表格查询
  fetchLogBarChart: () => Promise.resolve(), // 趋势图查询
  fetchLogFields: () => Promise.resolve(), // 表格字段
  fetchFieldsSettings: () => Promise.resolve(), // 用户使用的表格字段配置
  createFieldSettings: () => Promise.resolve(), // 新增表格字段配置
  updateFieldSettings: () => Promise.resolve(), // 保存表格字段配置
  updateUseFieldSettings: () => Promise.resolve(), // 更新用户当前使用表格字段配置
  deleteFieldSettings: () => Promise.resolve(), // 删除表格字段配置
  exportLog: () => Promise.resolve(), // 日志下载
  fetchLogContext: () => Promise.resolve(), // 上下文
  fetchRealTimeLog: () => Promise.resolve(), // 实时日志
}
</script>
