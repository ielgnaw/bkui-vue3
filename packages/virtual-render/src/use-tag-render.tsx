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
import { computed, h, onMounted, onUnmounted, ref } from 'vue';

import { VirtualRenderProps } from './props';
import useFixTop from './use-fix-top';
import { VisibleRender } from './v-virtual-render';
export default (props: VirtualRenderProps, ctx) => {
  const { renderAs, contentAs } = props;

  /** 指令触发Scroll事件，计算当前startIndex & endIndex & scrollTop & translateY */
  const handleScrollCallback = (event, _startIndex, _endIndex, _scrollTop, translateY, scrollLeft, pos) => {
    ctx.emit('content-scroll', [event, { translateY, translateX: scrollLeft, pos }]);
  };

  let instance = null;
  const binding = computed(() => ({
    lineHeight: props.lineHeight,
    handleScrollCallback,
    pagination: {},
    throttleDelay: props.throttleDelay,
    onlyScroll: props.scrollEvent,
  }));

  const refRoot = ref(null);

  /** 虚拟渲染外层容器样式 */
  const wrapperStyle = computed(() => {
    const height = typeof props.height === 'number' ? `${props.height}px` : props.height;
    return {
      height,
      width: typeof props.width === 'number' ? `${props.width}px` : props.width,
      display: 'inline-block',
      maxHeight: props.maxHeight ?? height,
      ...props.wrapperStyle,
    };
  });

  const { scrollTo, fixToTop } = useFixTop(props, refRoot);

  ctx.expose({
    scrollTo,
    fixToTop,
  });

  onMounted(() => {
    instance = new VisibleRender(binding, refRoot.value);
    instance.install();
  });

  onUnmounted(() => {
    instance?.uninstall();
  });

  return {
    rendAsTag: () =>
      h(
        // @ts-ignore:next-line
        renderAs,
        {
          class: props.className,
          style: wrapperStyle.value,
          ref: refRoot,
        },
        [
          ctx.slots.beforeContent?.() ?? '',
          h(
            contentAs,
            {
              class: props.contentClassName,
              style: props.contentStyle,
            },
            [
              ctx.slots.default?.({
                data: props.list,
              }) ?? '',
            ],
          ),
          ctx.slots.afterContent?.() ?? '',
          ctx.slots.afterSection?.() ?? '',
        ],
      ),
  };
};
