/*
 * Tencent is pleased to support the open source community by making
 * 蓝鲸智云PaaS平台社区版 (BlueKing PaaS Community Edition) available.
 *
 * Copyright (C) 2021 THL A29 Limited, a Tencent company.  All rights reserved.
 *
 * 蓝鲸智云PaaS平台社区版 (BlueKing PaaS Community Edition) is licensed under the MIT License.
 *
 * License for 蓝鲸智云PaaS平台社区版 (BlueKing PaaS Community Edition):
 *
 * ---------------------------------------------------
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
 * documentation files (the "Software"), to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and
 * to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of
 * the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO
 * THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF
 * CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
 */

import { type ComponentPublicInstance, computed, onMounted, provide, ref, watch } from 'vue';

// import { usePrefix } from '@bkui-vue/config-provider';
// import { useFormItem } from '@bkui-vue/shared';
// import type { DatePickerPanelType, SelectionModeType } from './interface';
import { DatePickerPanelType } from './new-interface';
import { datePickerKey, EVENT_CODE, /* extractTime,  */ formatDate, isAllEmptyArr, parseDate } from './utils';

export function useCalendar(props, slots, emit) {
  // const { resolveClassName } = usePrefix();
  // const formItem = useFormItem();

  const isRange = props.type.includes('range');
  const emptyArray = isRange ? [null, null] : [null];

  const initialArr = isRange ? ((props.value || props.modelValue) as any[]) : [props.value || props.modelValue];
  const initialValue = isAllEmptyArr(initialArr)
    ? emptyArray
    : parseDate(props.value || props.modelValue, props.type, props.multiple, props.format);

  const internalValue = ref(initialValue);
  const focusedDate = ref(initialValue[0] || props.startDate || new Date());
  const forceInputRerender = ref(1);
  const visible = ref(false);
  const isFocused = ref(false);
  // input 输入框输入的值
  const userInputValue = ref(formatDate(props.value || props.modelValue, props.type, props.multiple, props.format));
  const showClose = ref(false);
  const inputRef = ref(null);
  const pickerPanelRef = ref(null);
  const pickerDropdownRef = ref(null);

  const reset = () => {
    pickerPanelRef?.value?.reset();
  };

  const setInputRef = (el: Element | ComponentPublicInstance | null) => {
    inputRef.value = el;
  };

  const inputFocus = () => {
    inputRef?.value?.focus();
  };

  const emitChange = () => {
    // nextTick(() => {
    // 使用 :value 或 :model-value 的时候才需要 handleChange，此时没有触发 update:modelValue
    // 使用 v-model 时才会触发 update:modelValue 事件
    emit('update:modelValue', publicVModelValue.value);
    emit('change', publicStringValue.value);
    // this.dispatch('bk-form-item', 'form-change');
    if (props.type.indexOf('time') < 0) {
      inputRef?.value?.blur();
    }
    // });
  };

  const handleIconClick = () => {
    inputRef?.value?.focus();
    inputRef?.value?.click();
  };

  const handleClose = (e?: Event) => {
    // if (disableCloseUnderTransfer.value) {
    //   disableCloseUnderTransfer.value = false;
    //   return false;
    // }
    if (e && e.type === 'mousedown' && visible.value) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    if (visible.value) {
      const pickerPanel = pickerPanelRef?.value?.$el;
      if (e && pickerPanel && pickerPanel.contains(e.target)) {
        return;
      }
      visible.value = false;
      e?.preventDefault();
      e?.stopPropagation();
      return;
    }
    isFocused.value = false;
    // disableClickOutSide.value = false;
  };

  const handleClear = () => {
    visible.value = false;
    // emit('changeVisible', visible.value);
    internalValue.value = internalValue.value.map(() => null);
    emit('clear');
    emitChange();
    reset();
    showClose.value = false;
    // shortcut.value = null;
    // setTimeout(() => onSelectionModeChange(props.type), 500);
  };

  const handleFocus = () => {
    if (props.readonly) {
      return;
    }
    isFocused.value = true;
    // console.error('focusfocusfocusfocus');
    if (!props.disabled) {
      visible.value = true;
      // emit('changeVisible', state.visible);
    }
    // if (props.readonly) {
    //   return;
    // }
    // isFocused.value = true;
    // if (e && e.type === 'focus') {
    //   return;
    // }
    // if (!props.disabled) {
    //   visible.value = true;
    //   // emit('changeVisible', state.visible);
    // }
  };

  const handleBlur = () => {
    // console.error('handleBlurhandleBlurhandleBlur');
    visible.value = false;
    // if (internalFocus.value) {
    //   internalFocus.value = false;
    //   return;
    // }
    // if (visible.value) {
    //   e.preventDefault();
    //   return;
    // }
    // isFocused.value = false;
    // onSelectionModeChange(props.type);
    // internalValue.value = internalValue.value.slice();
    // reset();
    // pickerPanelRef?.value?.onToggleVisibility(false);
    // formItem?.validate?.('blur');
  };

  const handleInputChange = e => {
    // debugger;
    const newDate = parseDate(userInputValue.value, props.type, props.multiple, props.format);
    const isValidDate = newDate.reduce((valid, date) => valid && date instanceof Date, true);
    const isArrayValue = props.type.includes('range') || props.multiple;
    const valueToTest = isArrayValue ? newDate : newDate[0];
    const isDisabled = props.disabledDate?.(valueToTest);
    if (!isDisabled && isValidDate) {
      // 格式化，例如输入 2024-1 则格式化成 2024-01，输入框显示的值 displayValue 会根据 userInputValue 的值来变化
      userInputValue.value = formatDate(e.target.value, props.type, props.multiple, props.format);
      internalValue.value = newDate;
      emitChange();
    } else {
      // 输入不正确，或者输入的数据是 disabled 的，那么就还原之前的
      userInputValue.value = formatDate(internalValue.value[0], props.type, props.multiple, props.format);
    }

    // const oldValue = visualValue.value;
    // const newValue = e.target.value;
    // const newDate = parseDate(newValue, props.type, props.multiple, props.format);
    // const valueToTest = isArrayValue ? newDate : newDate[0];
    // const isDisabled = props.disabledDate?.(valueToTest);
    // const isValidDate = newDate.reduce((valid, date) => valid && date instanceof Date, true);
    // if (newValue !== oldValue && !isDisabled && isValidDate) {
    //   emitChange(props.type);
    //   internalValue.value = newDate;
    // } else {
    //   forceInputRerender.value = forceInputRerender.value + 1;
    // }
  };

  const handleInputInput = e => {
    userInputValue.value = e.target.value;
    //   const isArrayValue = props.type.includes('range') || props.multiple;
    //   const oldValue = visualValue.value;
    //   const newValue = e.target.value;
    //   const newDate = parseDate(newValue, props.type, props.multiple, props.format);
    //   const valueToTest = isArrayValue ? newDate : newDate[0];
    //   const isDisabled = props.disabledDate?.(valueToTest);
    //   const isValidDate = newDate.reduce((valid, date) => valid && date instanceof Date, true);
    //   if (newValue !== oldValue && !isDisabled && isValidDate) {
    //     tmpValue.value = newDate;
    //   }
  };

  const handleInputMouseenter = () => {
    if (props.readonly || props.disabled) {
      return;
    }
    // if (visualValue?.value) {
    showClose.value = true;
    // }
    // internalValue.value = tmpValue.value;
  };
  const handleInputMouseleave = _e => {
    // if (e.toElement?.classList.contains('clear-action')) {
    //   return;
    // }
    showClose.value = false;
    // internalValue.value = tmpValue.value;
  };

  const handleKeydown = (e: KeyboardEvent) => {
    if (props.readonly || props.disabled) {
      return;
    }

    const { code } = e;
    if (code === EVENT_CODE.enter || code === EVENT_CODE.numpadEnter) {
      // 刷新 input，文本改变时，会触发 change 事件即执行 handleInputChange
      // 不执行如下代码也可改变值
      // forceInputRerender.value = forceInputRerender.value + 1;
    }

    // const { keyCode } = e;
    // // tab
    // if (keyCode === 9) {
    //   if (visible.value) {
    //     e.stopPropagation();
    //     e.preventDefault();
    //     if (isConfirm.value) {
    //       const selector = `.${resolveClassName('picker-confirm')} > *`;
    //       const tabbable = pickerDropdownRef.value.$el.querySelectorAll(selector);
    //       internalFocus.value = true;
    //       const element = [...tabbable][e.shiftKey ? 'pop' : 'shift']();
    //       element.focus();
    //     } else {
    //       handleClose();
    //     }
    //   } else {
    //     // this.focused = false;
    //   }
    // }
    // // left, top, right, bottom
    // const arrows = [37, 38, 39, 40];
    // if (!visible.value && arrows.includes(keyCode)) {
    //   visible.value = true;
    //   // emit('changeVisible', visible.value);
    //   return;
    // }
    // // esc
    // if (keyCode === 27) {
    //   if (visible.value) {
    //     e.stopPropagation();
    //     handleClose();
    //   }
    // }
    // // enter
    // // if (keyCode === 13 && state.timeEnterMode) {
    // //   const timePickers = findChildComponents(this, 'TimeSpinner');
    // //   if (timePickers.length > 0) {
    // //     const columnsPerPicker = timePickers[0].showSeconds ? 3 : 2;
    // //     const pickerIndex = Math.floor(state.focusedTime.column / columnsPerPicker);
    // //     const value = state.focusedTime.time[pickerIndex];
    // //     timePickers[pickerIndex].chooseValue(value);
    // //     return;
    // //   }
    // // }
    // if (!arrows.includes(keyCode)) {
    //   return;
    // }
    // if (focusedTime.value.active) {
    //   e.preventDefault();
    // }
    // // const timePickers = findChildComponents(this, 'TimeSpinner');
    // // if (timePickers.length > 0) {
    // //   this.navigateTimePanel(keyValueMapper[keyCode]);
    // // }
  };

  const onPick = (_dates, _visible = false, _shortcut) => {
    let dates = _dates;
    if (props.multiple) {
      const pickedTimeStamp = dates.getTime();
      const indexOfPickedDate = internalValue.value.findIndex(date => date && date.getTime() === pickedTimeStamp);
      const allDates = [...internalValue.value, dates].filter(Boolean);
      const timeStamps = allDates
        .map(date => date.getTime())
        .filter((ts, i, arr) => arr.indexOf(ts) === i && i !== indexOfPickedDate);
      internalValue.value = timeStamps.map(ts => new Date(ts));
    } else {
      dates = parseDate(_dates, props.type, props.multiple, props.format);
      internalValue.value = Array.isArray(dates) ? dates : [dates];
      // console.error('internalValue.value', internalValue.value);
    }

    if (internalValue.value[0]) {
      [focusedDate.value] = internalValue.value;
    }

    // focusedTime.value = {
    //   ...focusedTime.value,
    //   time: internalValue.value.map(extractTime),
    // };

    // if (!isConfirm.value) {
    //   onSelectionModeChange(props.type);
    //   visible.value = _visible;
    // }

    // 点击至今后，datetimerange 不关闭弹框，因为有可能需要修改开始日期的时间，daterange 可以直接关闭弹框
    // if (type === 'upToNow' && props.type === 'daterange') {
    //   onPickSuccess();
    // }

    // shortcut.value = _shortcut;

    emitChange();

    // 抛出快捷项选择变化事件
    // const shortcutIndex = props.shortcuts.findIndex(item => item === shortcut.value);
    // emit('shortcut-change', shortcut.value, shortcutIndex);
  };

  const opened = computed(() => (props.open === null ? visible.value : props.open));

  const longWidthCls = computed(() => {
    let cls = '';
    if (props.fontSize === 'medium') {
      cls = 'medium-width';
    } else if (props.fontSize === 'large') {
      cls = 'large-width';
    }
    return cls;
  });

  const fontSizeCls = computed(() => {
    let cls = '';
    if (props.fontSize === 'medium') {
      cls = 'medium-font';
    } else if (props.fontSize === 'large') {
      cls = 'large-font';
    }
    return cls;
  });

  // input 输入框显示的值
  const displayValue = computed(() => {
    // 展示快捷文案
    // if (shortcut.value?.text && props.useShortcutText) {
    //   return shortcut.value.text;
    // }
    // return visualValue.value;

    if (userInputValue.value !== null) {
      return userInputValue.value;
    }
    return '';

    // return userInputValue.value || '';
  });

  const publicVModelValue = computed(() => {
    if (props.multiple) {
      return internalValue.value.slice();
    }
    const isRange = props.type.includes('range');
    let val = internalValue.value.map(date => (date instanceof Date ? new Date(date) : date || ''));
    if (props.type.match(/^time/)) {
      val = val.map(v => formatDate(v, props.type, props.multiple, props.format));
    }
    return isRange || props.multiple ? val : val[0];
  });

  const publicStringValue = computed(() => {
    if (props.type.match(/^time/)) {
      return publicVModelValue.value;
    }
    if (props.multiple) {
      return formatDate(publicVModelValue.value, props.type, props.multiple, props.format);
    }
    return Array.isArray(publicVModelValue.value)
      ? publicVModelValue.value.map(v => formatDate(v, props.type, props.multiple, props.format))
      : formatDate(publicVModelValue.value, props.type, props.multiple, props.format);
  });

  const panel = computed<DatePickerPanelType>(() => {
    // const isRange = props.type === 'daterange' || props.type === 'datetimerange';
    // return isRange ? 'DateRangePanel' : 'DatePanel';
    let ret = DatePickerPanelType.DatePanel;
    switch (props.type) {
      case 'year':
        ret = DatePickerPanelType.YearPanel;
        break;
      case 'quarter':
        ret = DatePickerPanelType.QuarterPanel;
        break;
      case 'month':
        ret = DatePickerPanelType.MonthPanel;
        break;

      default:
        break;
    }
    return ret;
  });

  const localReadonly = computed(() => {
    // 如果当前使用快捷选择，且配置展示快捷文案，则输入框不允许编辑
    // if (shortcut.value?.text && props.useShortcutText) {
    //   return true;
    // }
    return !props.editable || props.readonly;
  });

  watch(visible, v => {
    if (v === false) {
      pickerDropdownRef.value?.destoryDropdown();
    }
    pickerDropdownRef.value?.updateDropdown();
    // TODO: provide/inject
    // if (!visible) {
    //   this.dispatch('bk-form-item', 'form-blur');
    // }
    emit('open-change', v);
  });

  watch(
    () => props.modelValue,
    newValue => {
      internalValue.value = parseDate(newValue, props.type, props.multiple, props.format);
      // if (props.withValidate) {
      //   formItem?.validate?.('change');
      // }
    },
  );

  watch(
    () => props.open,
    open => {
      visible.value = open === true;
    },
  );

  // watch(
  //   () => props.type,
  //   type => {
  //     onSelectionModeChange(type);
  //   },
  //   {
  //     immediate: true,
  //   },
  // );

  watch(
    () => publicVModelValue,
    (now, before) => {
      const newValue = JSON.stringify(now);
      const oldValue = JSON.stringify(before);
      const shouldEmitInput = newValue !== oldValue || typeof now !== typeof before;
      if (shouldEmitInput) {
        emit('input', now);
      }
    },
  );

  watch(
    () => internalValue.value,
    v => {
      const d = Array.isArray(v) ? v[0] : v;
      userInputValue.value = formatDate(d, props.type, props.multiple, props.format);
    },
  );

  onMounted(() => {
    // 如果是 date-picker 那么 time-picker 就是回车模式
    // if (props.type.indexOf('date') > -1) {
    //   timeEnterMode.value = true;
    // } else {
    //   // 如果不是 date-picker 那么 time-picker 就是 time 的 props enter-mode
    //   // timeEnterMode.value = this.enterMode;
    //   timeEnterMode.value = true;
    // }

    // const initialValue = props.modelValue;
    // const parsedValue = publicVModelValue.value;
    // if (typeof initialValue !== typeof parsedValue || JSON.stringify(initialValue) !== JSON.stringify(parsedValue)) {
    //   emit('input', publicVModelValue.value);
    // }

    if (props.open !== null) {
      visible.value = props.open;
    }
    // this.$on('focus-input', () => this.focus())
    provide(datePickerKey, {
      props,
      focus: () => inputFocus(),
    });
  });

  return {
    inputRef,
    pickerPanelRef,
    pickerDropdownRef,

    visible,
    userInputValue,
    showClose,
    forceInputRerender,
    internalValue,
    focusedDate,

    reset,
    setInputRef,
    handleFocus,
    handleBlur,
    handleIconClick,
    handleClose,
    handleClear,
    handleInputChange,
    handleInputInput,
    handleInputMouseenter,
    handleInputMouseleave,
    handleKeydown,
    onPick,

    longWidthCls,
    fontSizeCls,
    opened,
    displayValue,
    panel,
    localReadonly,
  };

  /*
  const shortcut = ref(null);
  if (props.shortcutSelectedIndex !== -1) {
    shortcut.value = props.shortcuts[props.shortcutSelectedIndex] || null;
    if (shortcut.value) {
      const v = shortcut.value.value();
      initialValue = Array.isArray(v) ? v : [v];
    }
  }
  // const internalFocus = ref(false);
  const selectionMode = ref<SelectionModeType>('date');
  const pickerDropdownRef = ref(null);
  const disableCloseUnderTransfer = ref(false);
  const disableClickOutSide = ref(false);
  const timeEnterMode = ref(true);
  const focusedTime = ref({
    column: 0,
    picker: 0,
    time: initialValue.map(extractTime),
    active: false,
  });


  function onSelectionModeChange(_type): SelectionModeType {
    // let type = _type;
    // if (_type.match(/^date/)) {
    //   type = 'date';
    // }

    // if (_type.match(/time/)) {
    //   type = 'time';
    // }

    // // type: date, daterange, datetime, datetimerange => selectionMode: date
    // // type: month => selectionMode: month
    // // type: quarter => selectionMode: quarter
    // // type: year => selectionMode: year
    // // type: time, timerange => selectionMode: time
    // console.error(3444, type);
    // selectionMode.value = ['year', 'month', 'quarter', 'date', 'time'].indexOf(type) > -1 && type;
    // return selectionMode.value;
    selectionMode.value = _type;
    return selectionMode.value;
  }

  // const setPickerDropdownRef = (el: Element | ComponentPublicInstance | null) => {
  //   pickerDropdownRef.value = el;
  // };

  const isConfirm = computed(
    () => !!slots.trigger || props.type === 'datetime' || props.type === 'datetimerange' || props.multiple,
  );

  const hasHeader = computed(() => !!slots.header);
  const hasFooter = computed(() => !!slots.footer);
  const hasShortcuts = computed(() => !!slots.shortcuts);
  const hasConfirm = computed(() => !!slots.confirm);
  const ownPickerProps = computed(() => props.options);
  // 限制 allow-cross-day 属性只在 time-picker 组件 type 为 timerange 时生效
  const allowCrossDayProp = computed(() => (panel.value === 'RangeTimePickerPanel' ? props.allowCrossDay : false));

  watch(visible, v => {
    if (v === false) {
      pickerDropdownRef.value?.destoryDropdown();
    }
    pickerDropdownRef.value?.updateDropdown();
    // TODO: provide/inject
    // if (!visible) {
    //   this.dispatch('bk-form-item', 'form-blur');
    // }
    emit('open-change', v);
  });

  watch(
    () => props.modelValue,
    newValue => {
      internalValue.value = parseDate(newValue, props.type, props.multiple, props.format);
      if (props.withValidate) {
        formItem?.validate?.('change');
      }
    },
  );

  watch(
    () => props.open,
    open => {
      visible.value = open === true;
    },
  );

  watch(
    () => props.type,
    type => {
      onSelectionModeChange(type);
    },
    {
      immediate: true,
    },
  );

  watch(
    () => publicVModelValue,
    (now, before) => {
      const newValue = JSON.stringify(now);
      const oldValue = JSON.stringify(before);
      const shouldEmitInput = newValue !== oldValue || typeof now !== typeof before;
      if (shouldEmitInput) {
        emit('input', now);
      }
    },
  );

  watch(
    () => internalValue.value,
    v => {
      const d = Array.isArray(v) ? v[0] : v;
      userInputValue.value = formatDate(d, props.type, props.multiple, props.format);
    },
  );

  return {
    longWidthCls,
    fontSizeCls,
    hasHeader,
    hasFooter,
    hasShortcuts,
    hasConfirm,
    forceInputRerender,
    internalValue,
    ownPickerProps,
    allowCrossDayProp,
    displayValue,
    selectionMode,
    focusedDate,
    isConfirm,

    inputRef,
    setInputRef,
    pickerDropdownRef,

    reset,
    handleClose,
    handleFocus,
    handleBlur,
    showClose,
    handleIconClick,
    handleKeydown,
    handleInputChange,
    handleInputInput,
    handleClear,
    onPick,

    panel,
    opened,
    handleInputMouseenter,
    handleInputMouseleave,
  }; */
}
