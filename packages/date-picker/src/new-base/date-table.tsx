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

import jsCalendar from 'js-calendar';
import type { ExtractPropTypes } from 'vue';
import { computed, defineComponent, PropType } from 'vue';

import { useLocale, usePrefix } from '@bkui-vue/config-provider';

import type { DatePickerValueType, DisabledDateType, PickerTypeType } from '../new-interface';
import { clearHours, isInRange } from '../utils';

const dateTableProps = {
  tableDate: {
    type: Date,
    required: true,
  },
  disabledDate: Function as PropType<DisabledDateType>,
  // selectionMode: {
  //   type: String,
  //   required: true,
  // },
  type: {
    type: String as PropType<PickerTypeType>,
    default: 'date',
    validator(value) {
      const validList: PickerTypeType[] = [
        'year',
        'yearrange',
        'quarter',
        'quarterrange',
        'month',
        'monthrange',
        'date',
        'daterange',
        'datetime',
        'datetimerange',
        'time',
        'timerange',
      ];
      if (validList.indexOf(value) < 0) {
        console.error(`type property is not valid: '${value}'`);
        return false;
      }
      return true;
    },
  },
  value: {
    type: [Date, String, Number, Array] as PropType<DatePickerValueType | null>,
  },
  rangeState: {
    type: Object,
    default: () => ({
      from: null,
      to: null,
      selecting: false,
    }),
  },
  // focusedDate: {
  //   type: Date,
  //   required: true,
  // },
} as const;

export type DateTableProps = Readonly<ExtractPropTypes<typeof dateTableProps>>;

export default defineComponent({
  name: 'DateTable',
  props: dateTableProps,
  emits: ['pick', 'pickClick', 'changeRange'],
  setup(props, { emit }) {
    const t = useLocale('datePicker');
    const calendar = computed(() => new jsCalendar.Generator({ onlyDays: true, weekStart: 0 }));

    const headerDays = computed(() => {
      const translatedDays = [
        t.value.weekdays.sun,
        t.value.weekdays.mon,
        t.value.weekdays.tue,
        t.value.weekdays.wed,
        t.value.weekdays.thu,
        t.value.weekdays.fri,
        t.value.weekdays.sat,
      ];
      return translatedDays.splice(0, 7 - 0).concat(translatedDays.splice(0, 0));
    });

    const dates = computed(() => {
      const rangeSelecting = /* props.type === 'range' &&  */ props.rangeState.selecting;
      return rangeSelecting ? [props.rangeState.from] : props.value;
    });

    const days = computed(() => {
      const tableYear = props.tableDate.getFullYear();
      const tableMonth = props.tableDate.getMonth();
      const today = clearHours(new Date());

      const selectedDays = (dates.value as any[]).filter(Boolean).map(clearHours);
      const [minDay, maxDay] = (dates.value as any[]).map(clearHours);
      const rangeStart = props.rangeState.from && clearHours(props.rangeState.from);
      const rangeEnd = props.rangeState.to && clearHours(props.rangeState.to);

      const isRange = false; /* props.type === 'range'; */
      const disableTestFn = typeof props.disabledDate === 'function' && props.disabledDate;

      const ret = calendar
        .value(tableYear, tableMonth, (cell, _lang: string) => {
          if (cell.date instanceof Date) {
            cell.date.setTime(cell.date.getTime() + cell.date.getTimezoneOffset() * 60000);
          }

          const time = cell.date && clearHours(cell.date);
          const dateIsInCurrentMonth = cell.date && tableMonth === cell.date.getMonth();

          return {
            ...cell,
            type: time === today ? 'today' : cell.type,
            selected: dateIsInCurrentMonth && selectedDays.includes(time),
            disabled: cell.date && disableTestFn && disableTestFn(new Date(time)),
            range: dateIsInCurrentMonth && isRange && isInRange(time, rangeStart, rangeEnd),
            start: dateIsInCurrentMonth && isRange && time === minDay,
            end: dateIsInCurrentMonth && isRange && time === maxDay,
          };
        })
        .cells.slice(0);

      let firstPrevMonth = -1;
      let firstNextMonth = -1;
      ret.forEach((cell, index) => {
        if (cell.type === 'prevMonth') {
          // 设置过
          if (firstPrevMonth === 1) {
            cell.firstPrevMonth = 0;
            firstPrevMonth = 0;
          }
          // 没有设置过
          if (firstPrevMonth === -1) {
            cell.firstPrevMonth = 1;
            firstPrevMonth = 1;
          }

          const prev = ret[index - 1];
          prev && (prev.lastPrevMonth = 0);
          cell.lastPrevMonth = 1;
        }

        if (cell.type === 'nextMonth') {
          // 设置过
          if (firstNextMonth === 1) {
            cell.firstNextMonth = 0;
            firstNextMonth = 0;
          }
          // 没有设置过
          if (firstNextMonth === -1) {
            cell.firstNextMonth = 1;
            firstNextMonth = 1;
          }

          const prev = ret[index - 1];
          prev && (prev.lastNextMonth = 0);
          cell.lastNextMonth = 1;
        }
      });
      return ret;
    });

    const handleClick = cell => {
      if (cell.disabled || cell.type === 'weekLabel') {
        return;
      }
      const newDate = new Date(clearHours(cell.date));

      emit('pick', newDate);
      emit('pickClick');
    };
    const handleMouseMove = cell => {
      if (!props.rangeState.selecting) {
        return;
      }
      if (cell.disabled) {
        return;
      }
      const newDate = cell.date;
      emit('changeRange', newDate);
    };

    const { resolveClassName } = usePrefix();

    const getCellCls = cell => [
      resolveClassName('date-picker-cells-cell'),
      resolveClassName('date-picker-cells-cell-day'),
      {
        [resolveClassName('date-picker-cells-cell-selected')]: cell.selected || cell.start || cell.end,
        [resolveClassName('date-picker-cells-cell-disabled')]: cell.disabled,
        [resolveClassName('date-picker-cells-cell-today')]: cell.type === 'today',
        [resolveClassName('date-picker-cells-cell-prev-month')]: cell.type === 'prevMonth',
        [resolveClassName('date-picker-cells-cell-prev-month-first')]: cell.firstPrevMonth === 1,
        [resolveClassName('date-picker-cells-cell-prev-month-last')]: cell.lastPrevMonth === 1,
        [resolveClassName('date-picker-cells-cell-next-month')]: cell.type === 'nextMonth',
        [resolveClassName('date-picker-cells-cell-next-month-first')]: cell.firstNextMonth === 1,
        [resolveClassName('date-picker-cells-cell-next-month-last')]: cell.lastNextMonth === 1,
        [resolveClassName('date-picker-cells-cell-week-label')]: cell.type === 'weekLabel',
        [resolveClassName('date-picker-cells-cell-range')]: cell.range && !cell.start && !cell.end,
        // [`bk-date-picker-cells-focused`]: clearHours(cell.date) === clearHours(this.focusedDate)
      },
    ];
    return {
      headerDays,
      days,
      getCellCls,
      handleClick,
      handleMouseMove,
      resolveClassName,
    };
  },
  render() {
    return (
      <div class={[this.resolveClassName('date-picker-cells'), this.resolveClassName('date-picker-cells-date')]}>
        <div class={this.resolveClassName('date-picker-cells-header')}>
          {this.headerDays.map(day => (
            <span class={this.resolveClassName('date-picker-cells-header-week')}>{day}</span>
          ))}
        </div>
        {this.days.map(cell => (
          <span
            class={this.getCellCls(cell)}
            onClick={() => this.handleClick(cell)}
            onMouseenter={() => this.handleMouseMove(cell)}
          >
            <em>{cell.desc}</em>
          </span>
        ))}
      </div>
    );
  },
});
