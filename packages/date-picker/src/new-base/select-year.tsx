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

import type { ExtractPropTypes } from 'vue';
import { defineComponent, nextTick, onBeforeUnmount, onMounted, PropType, ref } from 'vue';

import { usePrefix } from '@bkui-vue/config-provider';
import { BKPopover, IBKPopover } from '@bkui-vue/shared';
import type { Placement } from '@popperjs/core';

import type { DatePickerPlacementType } from '../interface';
import { ALL_YEARS } from '../utils';

const pickerDropdownProps = {
  placement: {
    type: String as PropType<DatePickerPlacementType>,
    default: 'bottom',
    validator: value => {
      const validList: DatePickerPlacementType[] = [
        'top',
        'top-start',
        'top-end',
        'bottom',
        'bottom-start',
        'bottom-end',
        'left',
        'left-start',
        'left-end',
        'right',
        'right-start',
        'right-end',
      ];
      if (validList.indexOf(value) < 0) {
        console.error(`placement property is not valid: '${value}'`);
        return false;
      }
      return true;
    },
  },
  className: {
    type: String,
  },
  extPopoverCls: {
    type: String,
  },
  triggerRef: {
    type: Object,
  },
  selectedYear: {
    type: String,
  },
  onClick: Function as PropType<(e: MouseEvent) => void>,
} as const;

export type PickerDropdownProps = Readonly<ExtractPropTypes<typeof pickerDropdownProps>>;

export default defineComponent({
  name: 'SelectYear',
  props: pickerDropdownProps,
  emits: ['changeVisible', 'selectYear'],
  setup(props, { emit }) {
    let popoverInstance: any = Object.create(null);
    const contentRef = ref(null);

    const allYears = ref(ALL_YEARS);

    onMounted(() => {
      updateDropdown();
    });
    onBeforeUnmount(() => {
      destoryDropdown();
    });

    const forceUpdate = () => {
      if (popoverInstance) {
        popoverInstance?.forceUpdate?.();
      }
    };

    const destoryDropdown = () => {
      if (popoverInstance && Object.keys(popoverInstance).length !== 0) {
        const instance = popoverInstance as IBKPopover;
        instance.isShow && instance.hide();
        instance.destroy();
        popoverInstance = null;
        emit('changeVisible', false);
      }
    };

    const scrollActiveOptionIntoView = () => {
      const optionsDom = contentRef.value?.querySelectorAll?.('.is-selected');
      optionsDom?.[0]?.scrollIntoView({
        block: 'center',
        behavior: 'instant',
      });
    };

    const updateDropdown = () => {
      nextTick(() => {
        if (popoverInstance && Object.keys(popoverInstance).length !== 0) {
          popoverInstance.update();
        } else {
          popoverInstance = new BKPopover(props.triggerRef as HTMLElement, contentRef.value as HTMLElement, {
            placement: props.placement as Placement,
            trigger: 'manual',
            modifiers: [
              {
                name: 'computeStyles',
                options: {
                  adaptive: false, // true by default
                  gpuAcceleration: false,
                },
              },
              {
                name: 'offset',
                options: {
                  offset: [2, -4],
                },
              },
            ],
          });
        }

        scrollActiveOptionIntoView();
      });
    };

    const handleSelectYear = (v: number) => {
      emit('selectYear', v);
      // nextTick(() => {
      //   scrollActiveOptionIntoView();
      // });
    };

    const { resolveClassName } = usePrefix();

    // watch(
    //   () => props.selectedYear,
    //   () => {
    //     scrollActiveOptionIntoView();
    //   },
    // );

    return {
      contentRef,

      allYears,

      forceUpdate,
      updateDropdown,
      destoryDropdown,
      resolveClassName,

      handleSelectYear,
    };
  },
  render() {
    return (
      <div
        ref='contentRef'
        class={[this.className, this.extPopoverCls]}
        onClick={this.onClick}
      >
        <div class={this.resolveClassName('date-picker-selectyear')}>
          <ul class={this.resolveClassName('date-picker-selectyear-items')}>
            {this.allYears.map(v => (
              <li
                class={[
                  this.resolveClassName('date-picker-selectyear-item'),
                  this.selectedYear === String(v.value) ? 'is-selected' : '',
                ]}
                onClick={() => this.handleSelectYear(v.value)}
              >
                <span title={String(v.value)}>{v.value}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  },
});
