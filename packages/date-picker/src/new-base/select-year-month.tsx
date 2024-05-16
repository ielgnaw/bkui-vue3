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

import { defineComponent, nextTick, onBeforeUnmount, onMounted, ref } from 'vue';

import { usePrefix } from '@bkui-vue/config-provider';
import { BKPopover, IBKPopover } from '@bkui-vue/shared';
import type { Placement } from '@popperjs/core';

import { selectYearMonthProps } from '../new-props';
import { ALL_MONTHS, ALL_YEARS } from '../utils';

export default defineComponent({
  name: 'SelectYearMonth',
  props: selectYearMonthProps,
  emits: ['changeVisible', 'selectYear', 'selectMonth'],
  setup(props, { emit }) {
    let popoverInstance: any = Object.create(null);
    const contentRef = ref(null);
    const yearRef = ref(null);
    const monthRef = ref(null);

    const allYears = ref(ALL_YEARS);
    const allMonths = ref(ALL_MONTHS);

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
                  offset: [2, 0],
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
    };
    const handleSelectMonth = (v: number) => {
      emit('selectMonth', v);
    };

    const scrollActiveOptionIntoView = () => {
      const yearSelectedNode = yearRef.value?.querySelectorAll?.('.is-selected');
      yearSelectedNode?.[0]?.scrollIntoView({
        block: 'center',
        behavior: 'instant',
      });

      const monthSelectedNode = monthRef.value?.querySelectorAll?.('.is-selected');
      monthSelectedNode?.[0]?.scrollIntoView({
        block: 'center',
        behavior: 'instant',
      });
    };

    const { resolveClassName } = usePrefix();

    return {
      contentRef,
      yearRef,
      monthRef,

      allYears,
      allMonths,

      forceUpdate,
      updateDropdown,
      destoryDropdown,
      resolveClassName,

      handleSelectYear,
      handleSelectMonth,
    };
  },
  render() {
    return (
      <div
        ref='contentRef'
        style={{ zIndex: 1, backgroundColor: '#fff', boxShadow: '0 0 6px #dcdee5' }}
        onClick={this.onClick}
      >
        <div
          ref='yearRef'
          class={this.resolveClassName('date-picker-selectyearmonth')}
        >
          <ul class={this.resolveClassName('date-picker-selectyearmonth-items')}>
            {this.allYears.map(v => (
              <li
                class={[
                  this.resolveClassName('date-picker-selectyearmonth-item'),
                  this.selectedYear === String(v.value) ? 'is-selected' : '',
                ]}
                onClick={() => this.handleSelectYear(v.value)}
              >
                <span title={String(v.value)}>{v.label}</span>
              </li>
            ))}
          </ul>
        </div>
        <div
          ref='monthRef'
          class={this.resolveClassName('date-picker-selectyearmonth')}
        >
          <ul class={this.resolveClassName('date-picker-selectyearmonth-items')}>
            {this.allMonths.map(v => (
              <li
                class={[
                  this.resolveClassName('date-picker-selectyearmonth-item'),
                  this.selectedMonth === String(v.value) ? 'is-selected' : '',
                ]}
                onClick={() => this.handleSelectMonth(v.value)}
              >
                <span title={String(v.value)}>{v.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  },
});
