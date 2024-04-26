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
import { usePrefix } from 'bkui-vue';
import { Ref } from 'vue';

import BkSimpleBar from './bk-scrollbar';
import { VirtualRenderProps } from './props';

export default (target: Ref<HTMLElement>, props: VirtualRenderProps) => {
  let instance: BkSimpleBar = null;
  const { resolveClassName } = usePrefix();
  const classNames = {
    contentEl: resolveClassName('scrollbar-content-el'),
    wrapper: resolveClassName('scrollbar-wrapper'),
    scrollbar: resolveClassName('scrollbar'),
    track: resolveClassName('scrollbar-track'),
    visible: resolveClassName('scrollbar-visible'),
    horizontal: resolveClassName('scrollbar-horizontal'),
    vertical: resolveClassName('scrollbar-vertical'),
    hover: resolveClassName('scrollbar-hover'),
    dragging: resolveClassName('scrollbar-dragging'),
    scrolling: resolveClassName('scrollbar-scrolling'),
    scrollable: resolveClassName('scrollbar-scrollable'),
    mouseEntered: resolveClassName('scrollbar-mouse-entered'),
  };

  const init = (scrollFn?, delegateXContent?, delegateYContent?) => {
    instance = new BkSimpleBar(target.value, {
      classNames,
      wrapperNode: target.value,
      useSystemScrollYBehavior: !props.enabled,
      useSystemScrollXBehavior: true,
      delegateXContent,
      delegateYContent,
      onScrollCallback: scrollFn,
    });
    // instance.getScrollElement().addEventListener('scroll', scrollFn);
  };

  const scrollTo = (x, y) => {
    if (props.scrollbar?.enabled) {
      // instance.s.scrollTo(x, y, 100, { keepStruct: props.scrollbar?.keepStruct ?? false });
      return;
    }

    target.value.scrollTo(x, y);
  };

  return {
    init,
    instance,
    scrollTo,
    classNames,
  };
};
