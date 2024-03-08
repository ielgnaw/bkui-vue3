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
import Select from '@bkui-vue/select';

import QuarterTable from '../new-base/quarter-table';
import type { DatePickerShortcutsType, DatePickerValueType, DisabledDateType } from '../new-interface';
import { ALL_YEARS, iconBtnCls, PANEL_WIDTH, siblingMonth } from '../utils';

const { Option } = Select;

const quarterPanelProps = {
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

export type QuarterPanelProps = Readonly<ExtractPropTypes<typeof quarterPanelProps>>;

export default defineComponent({
  name: 'YearPanel',
  props: quarterPanelProps,
  emits: ['pick'],
  setup(props, { emit }) {
    const { resolveClassName } = usePrefix();

    const dates = ref((props.value as DatePickerValueType[]).slice().sort() as any);

    const panelDate = ref(props.startDate || dates.value[0] || new Date());

    const allYears = ref(ALL_YEARS);
    const selectedYear = ref<number>(panelDate.value.getFullYear());

    const changeYear = dir => {
      panelDate.value = siblingMonth(panelDate.value, dir * 12);
    };

    const handlePick = value => {
      const val = new Date(value);

      dates.value = [val];
      emit('pick', val);
    };

    const handleSelectYear = (year: number) => {
      panelDate.value = new Date(year, panelDate.value.getMonth(), panelDate.value.getDate());
    };

    watch(
      () => panelDate.value,
      (v: Date) => {
        selectedYear.value = v.getFullYear();
      },
    );

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
      allYears,
      selectedYear,
      panelDate,

      changeYear,
      handlePick,
      handleSelectYear,
    };
  },

  render() {
    const renderDatePanelLabel = () => {
      // return (
      //   <>
      //     <span
      //       // onClick={() => this.panelLabelClick('year')}
      //       class={this.resolveClassName('date-picker-header-label')}
      //     >
      //       {this.panelDate.getFullYear()}
      //     </span>
      //   </>
      // );
      return (
        <Select
          v-model={this.selectedYear}
          class={this.resolveClassName('date-picker-quarter-selectyear')}
          clearable={false}
          size='small'
          behavior='simplicity'
          popoverOptions={{
            offset: 4,
            boundary: 'parent',
            extCls: this.resolveClassName('date-picker-quarter-selectyear-popover'),
          }}
          scrollActiveOptionBehavior='instant'
          onChange={(year: number) => this.handleSelectYear(year)}
        >
          {this.allYears.map((d, i) => (
            <Option
              id={d.value}
              key={i}
              name={d.label}
            />
          ))}
        </Select>
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
            <QuarterTable
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
