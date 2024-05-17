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

import { defineComponent, type ExtractPropTypes, PropType, ref, watch } from 'vue';

import { usePrefix } from '@bkui-vue/config-provider';
import { AngleDoubleLeft, AngleDoubleRight } from '@bkui-vue/icon';

import YearTable from '../new-base/year-table';
import type { DatePickerShortcutsType, DatePickerValueType, DisabledDateType } from '../new-interface';
import { getYearCells, iconBtnCls, PANEL_WIDTH } from '../utils';

const yearPanelProps = {
  value: {
    type: [Date, String, Number, Array] as PropType<DatePickerValueType | null>,
  },
  shortcuts: {
    type: Array as PropType<DatePickerShortcutsType>,
    default: () => [],
  },
  multiple: {
    type: Boolean,
    default: false,
  },
  startDate: {
    type: Date,
  },
  // format: {
  //   type: String,
  //   default: 'yyyy-MM-dd',
  // },
  disabledDate: {
    type: Function as PropType<DisabledDateType>,
    default: () => false,
  },
  cellClass: {
    type: Function,
    default: () => '',
  },
} as const;

export type YearPanelProps = Readonly<ExtractPropTypes<typeof yearPanelProps>>;

export default defineComponent({
  name: 'YearPanel',
  props: yearPanelProps,
  emits: ['pick'],
  setup(props, { emit }) {
    const { resolveClassName } = usePrefix();

    const dates = ref((props.value as DatePickerValueType[]).slice().sort() as any);

    const panelDate = ref(props.startDate || dates.value[0] || new Date());

    const changeYear = dir => {
      panelDate.value = new Date((panelDate.value as Date).getFullYear() + dir * 10, 0, 1);
    };

    const handlePick = value => {
      const val = new Date(value.getFullYear(), 0, 1);

      dates.value = [val];
      emit('pick', val);
    };

    watch(
      () => props.value,
      newVal => {
        dates.value = newVal;
        const pDate = props.multiple ? dates.value[dates.value.length - 1] : props.startDate || dates.value[0];
        panelDate.value = pDate || new Date();
      },
    );

    return {
      resolveClassName,

      dates,
      panelDate,

      changeYear,
      handlePick,
    };
  },

  render() {
    const renderDatePanelLabel = () => {
      const startYear = Math.floor(this.panelDate.getFullYear() / 10) * 10;
      const yearCells = getYearCells(startYear);
      const firstYear = yearCells[0].date;
      const lastYear = yearCells[yearCells.length - 1].date;
      return (
        <>
          <span class={this.resolveClassName('date-picker-header-label')}>
            {firstYear.getFullYear()} - {lastYear.getFullYear()}
          </span>
        </>
      );
    };

    return (
      <div
        class={this.resolveClassName('picker-panel-body-wrapper')}
        onMousedown={(e: MouseEvent) => {
          e.preventDefault();
        }}
      >
        <div
          class={this.resolveClassName('picker-panel-body')}
          style={{ width: `${PANEL_WIDTH}px` }}
        >
          <div class={this.resolveClassName('date-picker-header')}>
            <span
              class={iconBtnCls('prev', '-double')}
              onClick={() => this.changeYear(-1)}
            >
              <AngleDoubleLeft
                style={{ fontSize: '20px', lineHeight: 1, verticalAlign: 'text-bottom' }}
              ></AngleDoubleLeft>
            </span>
            {renderDatePanelLabel()}
            <span
              class={iconBtnCls('next', '-double')}
              onClick={() => this.changeYear(+1)}
            >
              <AngleDoubleRight
                style={{ fontSize: '20px', lineHeight: 1, verticalAlign: 'text-bottom' }}
              ></AngleDoubleRight>
            </span>
          </div>

          <div class={this.resolveClassName('picker-panel-content')}>
            <YearTable
              tableDate={this.panelDate as Date}
              disabledDate={this.disabledDate}
              value={this.dates as DatePickerValueType}
              cellClass={this.cellClass}
              onPick={this.handlePick}
            />
          </div>
        </div>
      </div>
    );
  },
});
