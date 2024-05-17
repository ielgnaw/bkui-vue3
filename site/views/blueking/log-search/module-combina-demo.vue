<template>
  <div class="app">
    <p class="title">全功能组合</p>
    <img class="example-image" :src="examplaImgUlr1">
    <p class="title">无查询结果统计/收起查询结果统计（收起时有展开icon）</p>
    <img class="example-image" :src="examplaImgUlr2">
    <p class="title">无查询结果统计与图表趋势</p>
    <img class="example-image" :src="examplaImgUlr3">
  </div>
</template>

<script setup>
  import examplaImgUlr1 from '../../../imgs/log-search-example-1.png';
  import examplaImgUlr2 from '../../../imgs/log-search-example-2.png';
  import examplaImgUlr3 from '../../../imgs/log-search-example-3.png';
</script>

<style>
.example-image {
  width: 80%;
  height: 100%;
  margin-bottom: 24px;
  object-fit: cover;
}

.title {
  font-size: 14px;
  font-weight: 500;
}
</style>
