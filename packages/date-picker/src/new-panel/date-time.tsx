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

import { computed, defineComponent, type ExtractPropTypes, PropType, ref, Transition, watch } from 'vue';

import { useLocale, usePrefix } from '@bkui-vue/config-provider';
import { clickoutside } from '@bkui-vue/directives';
import { AngleDoubleLeft, AngleDoubleRight, AngleLeft, AngleRight } from '@bkui-vue/icon';
import { capitalize } from '@bkui-vue/shared';

import { DateIcon, TimeIcon } from '../common';
import DateTable from '../new-base/date-table';
import SelectYearMonth from '../new-base/select-year-month';
import TimeSpinner from '../new-base/time-spinner';
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

  format: String,
} as const;

export type DatePanelProps = Readonly<ExtractPropTypes<typeof datePanelProps>>;

export default defineComponent({
  name: 'DateTimePanel',
  directives: {
    clickoutside,
  },
  props: datePanelProps,
  emits: ['pick', 'pick-success', 'pick-clear', 'pick-click', 'selection-mode-change'],
  setup(props, { emit }) {
    const t = useLocale('datePicker');
    const { resolveClassName } = usePrefix();
    const triggerRef = ref<HTMLElement>(null);
    const dateWrapperRef = ref<HTMLElement>(null);
    const timeWrapperRef = ref<HTMLElement>(null);
    const selectYearRef = ref(null);
    const showSelectYear = ref(false);
    const dateTimeActive = ref('date');

    const dates = ref((props.value as DatePickerValueType[]).slice().sort() as any);

    const panelDate = ref(props.startDate || dates.value[0] || new Date());

    const allYears = ref(ALL_YEARS);
    const selectedYear = ref<number>(panelDate.value.getFullYear());
    const selectedMonth = ref<string>(pad(panelDate.value.getMonth() + 1));
    const selectedDate = ref<string>(pad(panelDate.value.getDate()));
    const selectedHours = ref<number>(panelDate.value.getHours());
    const selectedMinutes = ref<number>(panelDate.value.getMinutes());
    const selectedSeconds = ref<number>(panelDate.value.getSeconds());

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

    const handleChange = val => {
      const newDate = new Date(panelDate.value);
      Object.keys(val).forEach(type => newDate[`set${capitalize(type)}`](val[type]));
      dates.value = [newDate];
      emit('pick', newDate);
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

    const handleToggleDateTime = (idx: string) => {
      dateTimeActive.value = idx;
      dateWrapperRef.value.style.transform = `translateX(${idx === 'date' ? 0 : '-100%'})`;
      timeWrapperRef.value.style.transform = `translateX(${idx === 'date' ? '100%' : 0})`;
    };

    const showSeconds = computed(() => !(props.format || '').match(/mm$/));

    watch(
      () => panelDate.value,
      (v: Date) => {
        selectedYear.value = v.getFullYear();
        selectedMonth.value = pad(v.getMonth() + 1);
        selectedDate.value = pad(v.getDate());

        selectedHours.value = v.getHours();
        selectedMinutes.value = v.getMinutes();
        selectedSeconds.value = v.getSeconds();
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
      resolveClassName,

      triggerRef,
      selectYearRef,
      dateWrapperRef,
      timeWrapperRef,

      showSelectYear,
      dateTimeActive,
      dates,
      allYears,
      selectedYear,
      selectedMonth,
      selectedDate,
      selectedHours,
      selectedMinutes,
      selectedSeconds,
      panelDate,

      showSeconds,

      changeYear,
      changeMonth,
      handlePick,
      handleChange,
      handleSelectYear,
      handleSelectMonth,
      handleShowSelectYear,
      handleCloseSelectYear,
      handleToggleDateTime,
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
          <div class={this.resolveClassName('picker-date-time-tab')}>
            <div class={['date', this.dateTimeActive === 'date' ? 'active' : '']}>
              <div
                class='date-time-tab-inner'
                onClick={() => this.handleToggleDateTime('date')}
              >
                <DateIcon
                  class='date-time-tab-icon'
                  fillColor={this.dateTimeActive === 'date' ? '#63656e' : '#c4c6cc'}
                />
                <span class='date-time-tab-label'>
                  {this.selectedYear}-{this.selectedMonth}-{this.selectedDate}
                </span>
              </div>
            </div>
            <div class={['time', this.dateTimeActive === 'time' ? 'active' : '']}>
              <div
                class='date-time-tab-inner'
                onClick={() => this.handleToggleDateTime('time')}
              >
                <TimeIcon
                  class='date-time-tab-icon'
                  fillColor={this.dateTimeActive === 'time' ? '#63656e' : '#c4c6cc'}
                />
                <span class='date-time-tab-label'>
                  {pad(this.selectedHours)}:{pad(this.selectedMinutes)}:{pad(this.selectedSeconds)}
                </span>
              </div>
            </div>
          </div>
          <div
            ref='dateWrapperRef'
            class={this.resolveClassName('date-picker-date-wrapper')}
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
            </div>
          </div>
          <div
            ref='timeWrapperRef'
            class={this.resolveClassName('date-picker-time-wrapper')}
          >
            <div class={this.resolveClassName('picker-time-panel-content')}>
              <TimeSpinner
                ref='timeSpinnerRef'
                isVisible={this.dateTimeActive === 'time'}
                showSeconds={this.showSeconds}
                // steps={this.steps}
                hours={this.selectedHours}
                minutes={this.selectedMinutes}
                seconds={this.selectedSeconds}
                // disabledHours={this.disabledHMS.disabledHours}
                // disabledMinutes={this.disabledHMS.disabledMinutes}
                // disabledSeconds={this.disabledHMS.disabledSeconds}
                // hideDisabledOptions={this.hideDisabledOptions}
                // onPick-click={this.handlePickClick}
                onChange={this.handleChange}
              />
            </div>
          </div>
        </div>
      </div>
    );
  },
});
