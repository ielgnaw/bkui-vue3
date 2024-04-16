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

import { defineComponent, type ExtractPropTypes, PropType, ref, Transition, watch } from 'vue';

import { useLocale, usePrefix } from '@bkui-vue/config-provider';
import { clickoutside } from '@bkui-vue/directives';
import { AngleDoubleLeft, AngleDoubleRight, AngleLeft, AngleRight } from '@bkui-vue/icon';

import DateTable from '../new-base/date-table';
import SelectYearMonth from '../new-base/select-year-month';
// import Confirm from '../base/confirm';
import type {
  DatePickerShortcutsType,
  DatePickerValueType,
  DisabledDateType,
  PickerTypeType,
  // SelectionModeType,
} from '../new-interface';
import {
  ALL_YEARS,
  iconBtnCls,
  pad,
  // formatDateLabels,
  PANEL_WIDTH,
  PICKER_TYPE_LIST,
  siblingMonth,
  // timePickerKey
} from '../utils';

// import Time from './time';

const datePanelProps = {
  value: {
    type: [Date, String, Number, Array] as PropType<DatePickerValueType | null>,
  },
  type: {
    type: String as PropType<PickerTypeType>,
    default: 'date',
    validator(value) {
      const validList: PickerTypeType[] = PICKER_TYPE_LIST;
      if (validList.indexOf(value) < 0) {
        console.error(`type property is not valid: '${value}'`);
        return false;
      }
      return true;
    },
  },
  shortcuts: {
    type: Array as PropType<DatePickerShortcutsType>,
    default: () => [],
  },
  multiple: {
    type: Boolean,
    default: false,
  },
  clearable: {
    type: Boolean,
    default: true,
  },
  shortcutClose: {
    type: Boolean,
    default: false,
  },
  startDate: {
    type: Date,
  },
  focusedDate: {
    type: Date,
    required: true,
  },
  confirm: {
    type: Boolean,
    default: false,
  },
  showTime: {
    type: Boolean,
    default: false,
  },
  disabledDate: {
    // type: Function,
    type: Function as PropType<DisabledDateType>,
    default: () => false,
  },
  timePickerOptions: {
    type: Object as PropType<Record<string, any>>,
    default: () => ({}),
  },
  opened: {
    type: Boolean,
    default: false,
  },
  showToday: {
    type: Boolean,
    default: true,
  },
} as const;

export type DatePanelProps = Readonly<ExtractPropTypes<typeof datePanelProps>>;

export default defineComponent({
  name: 'DatePanel',
  directives: {
    clickoutside,
  },
  props: datePanelProps,
  emits: ['pick', 'pick-success', 'pick-clear', 'pick-click', 'selection-mode-change'],
  setup(props, { emit }) {
    const t = useLocale('datePicker');
    const triggerRef = ref<HTMLElement>(null);
    const selectYearRef = ref(null);
    const showSelectYear = ref(false);
    const { resolveClassName } = usePrefix();

    const dates = ref((props.value as DatePickerValueType[]).slice().sort() as any);

    const panelDate = ref(props.startDate || dates.value[0] || new Date());

    const allYears = ref(ALL_YEARS);
    const selectedYear = ref<number>(panelDate.value.getFullYear());
    const selectedMonth = ref<string>(pad(panelDate.value.getMonth() + 1));

    const changeYear = dir => {
      panelDate.value = siblingMonth(panelDate.value, dir * 12);
    };

    const changeMonth = dir => {
      panelDate.value = siblingMonth(panelDate.value, dir);
    };

    const setPanelDate = () => {
      dates.value = props.value;
      const pDate = props.multiple ? dates.value[dates.value.length - 1] : props.startDate || dates.value[0];
      panelDate.value = pDate || new Date();
    };

    const handlePick = value => {
      const val = new Date(value);

      dates.value = [val];
      emit('pick', val);
    };

    const handleSelectYear = (year: number) => {
      panelDate.value = new Date(year, panelDate.value.getMonth(), panelDate.value.getDate());
    };

    const handleSelectMonth = (month: number) => {
      panelDate.value = new Date(panelDate.value.getFullYear(), month - 1, panelDate.value.getDate());
    };

    const handleShowSelectYear = () => {
      showSelectYear.value = true;
      selectYearRef.value?.updateDropdown();
    };

    const handleCloseSelectYear = () => {
      showSelectYear.value = false;
      selectYearRef.value?.destoryDropdown();
    };

    watch(
      () => panelDate.value,
      (v: Date) => {
        selectedYear.value = v.getFullYear();
        selectedMonth.value = pad(v.getMonth() + 1);
      },
    );

    watch(
      () => props.value,
      () => {
        setPanelDate();
      },
    );

    watch(
      () => props.opened,
      v => {
        if (!v) {
          handleCloseSelectYear();
        } else {
          setPanelDate();
        }
      },
    );

    return {
      t,

      triggerRef,
      selectYearRef,

      showSelectYear,

      resolveClassName,

      dates,
      allYears,
      selectedYear,
      selectedMonth,
      panelDate,

      changeYear,
      changeMonth,
      handlePick,
      handleSelectYear,
      handleSelectMonth,
      handleShowSelectYear,
      handleCloseSelectYear,
    };
  },

  render() {
    const renderDatePanelLabel = () => {
      return (
        <>
          <div
            class={this.resolveClassName('date-picker-selectyear-wrapper')}
            v-clickoutside={this.handleCloseSelectYear}
          >
            <div
              class={this.resolveClassName('date-picker-year-label')}
              ref='triggerRef'
              onClick={() => this.handleShowSelectYear()}
            >
              {this.selectedYear}&nbsp;&nbsp;-&nbsp;&nbsp;{this.selectedMonth}
            </div>
            <Transition name={this.resolveClassName('fade-down-transition')}>
              <SelectYearMonth
                ref='selectYearRef'
                triggerRef={this.triggerRef}
                v-show={this.showSelectYear}
                selectedYear={String(this.selectedYear)}
                selectedMonth={String(this.selectedMonth)}
                onSelectYear={(v: number) => this.handleSelectYear(v)}
                onSelectMonth={(v: number) => this.handleSelectMonth(v)}
              ></SelectYearMonth>
            </Transition>
          </div>
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
            <span
              class={iconBtnCls('prev')}
              onClick={() => this.changeMonth(-1)}
            >
              <AngleLeft style={{ fontSize: '20px', lineHeight: 1, verticalAlign: 'text-bottom' }}></AngleLeft>
            </span>
            {renderDatePanelLabel()}
            {/* {this.datePanelLabel && Object.keys(this.datePanelLabel).length > 0 ? (
              <span>
                <span
                  class={this.resolveClassName('date-picker-header-label')}
                  v-show={this.showLabelFirst}
                  onClick={() => this.datePanelLabel.labels[0].handler()}
                >
                  {this.datePanelLabel.labels[0].label}--
                </span>
                {this.currentView === 'date' ? ` ${this.datePanelLabel.separator} ` : ' '}
                <span
                  class={this.resolveClassName('date-picker-header-label')}
                  v-show={this.showLabelSecond}
                  onClick={() => this.datePanelLabel.labels[1].handler()}
                >
                  {this.datePanelLabel.labels[1].label}++
                </span>
              </span>
            ) : (
              ''
            )} */}
            <span
              class={iconBtnCls('next', '-double')}
              onClick={() => this.changeYear(+1)}
            >
              <AngleDoubleRight
                style={{ fontSize: '20px', lineHeight: 1, verticalAlign: 'text-bottom' }}
              ></AngleDoubleRight>
            </span>
            <span
              class={iconBtnCls('next')}
              onClick={() => this.changeMonth(+1)}
            >
              <AngleRight style={{ fontSize: '20px', lineHeight: 1, verticalAlign: 'text-bottom' }}></AngleRight>
            </span>
          </div>

          <div class={this.resolveClassName('picker-panel-content')}>
            <DateTable
              tableDate={this.panelDate as Date}
              disabledDate={this.disabledDate}
              type={this.type}
              value={this.dates as DatePickerValueType}
              // focusedDate={this.focusedDate}
              onPick={this.handlePick}
            />
            {this.type === 'date' && this.showToday ? (
              <>
                <div
                  class={this.resolveClassName('picker-today-shortcut')}
                  onClick={() => this.handlePick(new Date())}
                >
                  {this.t.today}
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>
    );
  },
});
