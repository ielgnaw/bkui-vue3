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
import { InjectionKey, ref, customRef, watch, Ref } from 'vue';
import { OnFirstUpdateFnType } from '@bkui-vue/shared';
import { ISelectContext, IOptionGroupContext, IPopoverConfig } from './type';

export const selectKey: InjectionKey<ISelectContext> = Symbol('BkSelect');
export const optionGroupKey: InjectionKey<IOptionGroupContext> = Symbol('BkOptionGroup');

export function useFocus() {
  const isFocus = ref(false);
  const handleFocus = () => {
    isFocus.value = true;
  };
  const handleBlur = () => {
    isFocus.value = false;
  };
  return {
    isFocus,
    handleFocus,
    handleBlur,
  };
}

export function useHover() {
  const isHover = ref(false);
  const setHover = () => {
    isHover.value = true;
  };
  const cancelHover = () => {
    isHover.value = false;
  };
  return {
    isHover,
    setHover,
    cancelHover,
  };
}

export function useRegistry<T>(data: Ref<Set<T>>) {
  // 注册item
  const register = (item: T) => {
    if (!item) return;
    return data.value.add(item);
  };
  // 删除item
  const unregister = (item: T) => data.value.delete(item);
  return {
    register,
    unregister,
  };
}

export function useDebouncedRef<T>(value, delay = 200) {
  let timeout;
  let innerValue = value;
  return customRef<T>((track, trigger) => ({
    get() {
      track();
      return innerValue;
    },
    set(newValue) {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        innerValue = newValue;
        trigger();
      }, delay);
    },
  }));
}

export function usePopover(config: IPopoverConfig) {
  const { popoverMinWidth } = config;
  const popperWidth = ref<string | number>('auto');
  const isPopoverShow = ref(false);
  // 初始化PopoverWidth（默认跟输入框宽度一致）
  const onPopoverFirstUpdate: OnFirstUpdateFnType = (instance) => {
    const { reference } = instance.elements;
    popperWidth.value = Math.max((reference as HTMLElement).offsetWidth, popoverMinWidth);
  };
  const togglePopover = () => {
    isPopoverShow.value = !isPopoverShow.value;
  };
  const hidePopover = () => {
    isPopoverShow.value = false;
  };
  const showPopover = () => {
    isPopoverShow.value = true;
  };
  return {
    isPopoverShow,
    popperWidth,
    togglePopover,
    onPopoverFirstUpdate,
    hidePopover,
    showPopover,
  };
}

export function useRemoteSearch(method: Function) {
  const searchKey = useDebouncedRef<string>('');
  const searchLoading = ref(false);
  watch(searchKey, async () => {
    searchLoading.value = true;
    await method(searchKey.value);
    searchLoading.value = false;
  });
  return {
    searchKey,
    searchLoading,
  };
}

export function toLowerCase(value = '') {
  if (!value) return value;

  return String(value).trim()
    .toLowerCase();
};
