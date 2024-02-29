<template>
  <!-- <div>
    <p style="font-size: 14px;">
      年选择器 {{ yearValue }}
    </p>
    <bk-date-picker
      v-model="initDateTime"
      type="year"
      @change="handleYearChange"
    />
  </div> -->
  <div>
    <p style="font-size: 14px;">
      月选择器 {{ monthValue }}
    </p>
    <bk-date-picker
      v-model="initDateTime"
      type="month"
      @change="handleMonthChange"
    />
  </div>

  <div>
    <p style="font-size: 14px;">
      季度选择器 {{ quarterValue }}
    </p>
    <bk-date-picker
      v-model="initDateTime"
      type="quarter"
      @change="handleQuarterChange"
    />
  </div>
</template>

<script setup>
  import { ref } from 'vue';
  const initDateTime = ref(new Date(2016, 12, 5));
  const yearValue = ref('');
  const handleYearChange = (val) => {
    console.warn('handleChange', val, initDateTime);
    yearValue.value = val;
  };
  setTimeout(() => {
    console.error(('setTimeoutsetTimeoutsetTimeout'));
    initDateTime.value = new Date(2220, 1, 19);
  }, 3000);
  const monthValue = ref('');
  const handleMonthChange = (val) => {
    console.warn('handleChange', val, initDateTime);
    monthValue.value = val;
  };

  const quarterValue = ref('');
  const handleQuarterChange = (val) => {
    console.warn('handleChange', val, initDateTime);
    quarterValue.value = val;
  };
</script>
