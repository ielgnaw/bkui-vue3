<template>
  <bk-radio-group
    v-model="radioGroupValue"
  >
    <bk-radio label="QQ" :before-change="() => handleBeforeChange('QQ')"/>
    <bk-radio label="微信" :before-change="() => handleBeforeChange('微信')"/>
    <bk-radio label="Email" :before-change="() => handleBeforeChange('Email')"/>
  </bk-radio-group>
  <div style="margin-top: 10px;">
    选中：{{ radioGroupValue }}
  </div>
</template>
<script setup>
  import { ref } from 'vue';
  import InfoBox from '@bkui-vue/info-box';
  const flag = ref(false);
  const hasPackage = ref(true);
  const radioGroupValue = ref('微信');
  function handleBeforeChange(item) {
      if (hasPackage.value && !flag.value) {
        InfoBox({
          title: ('确认要切换类型吗'),
          subTitle: ('before-change 配置项示例'),
          confirmText: ('确认'),
          cancelText: ('取消'),
          onCancel: () => { },
          onConfirm: () => {
            radioGroupValue.value = item;
          },
        });
        return false;
      }
      return true;
    }
</script>

