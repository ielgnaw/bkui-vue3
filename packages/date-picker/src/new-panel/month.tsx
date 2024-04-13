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

import {
  /* type ComponentPublicInstance,  */ defineComponent,
  type ExtractPropTypes,
  PropType,
  ref,
  Transition,
  watch,
} from 'vue';

import { usePrefix } from '@bkui-vue/config-provider';
import { clickoutside } from '@bkui-vue/directives';
import { AngleDoubleLeft, AngleDoubleRight } from '@bkui-vue/icon';

import MonthTable from '../new-base/month-table';
import SelectYear from '../new-base/select-year';
import type { DatePickerShortcutsType, DatePickerValueType, DisabledDateType } from '../new-interface';
import { ALL_YEARS, iconBtnCls, PANEL_WIDTH, siblingMonth } from '../utils';

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
  opened: {
    type: Boolean,
    default: false,
  },
} as const;

export type QuarterPanelProps = Readonly<ExtractPropTypes<typeof quarterPanelProps>>;

export default defineComponent({
  name: 'MonthPanel',
  directives: {
    clickoutside,
  },
  props: quarterPanelProps,
  emits: ['pick'],
  setup(props, { emit }) {
    const triggerRef = ref<HTMLElement>(null);
    const selectYearRef = ref(null);
    const showSelectYear = ref(false);

    const { resolveClassName } = usePrefix();

    const dates = ref((props.value as DatePickerValueType[]).slice().sort() as any);

    const panelDate = ref(new Date());

    const allYears = ref(ALL_YEARS);
    const selectedYear = ref<number>(panelDate.value.getFullYear());

    const changeYear = dir => {
      panelDate.value = siblingMonth(panelDate.value, dir * 12);
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

    // const handleSelectToggle = (v: boolean) => {
    //   console.error(123123, v, props.inputRef);
    //   props.inputRef.blur();
    // };
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
      triggerRef,
      selectYearRef,

      showSelectYear,

      resolveClassName,

      dates,
      allYears,
      selectedYear,
      panelDate,

      changeYear,
      handlePick,
      handleSelectYear,
      handleShowSelectYear,
      handleCloseSelectYear,
    };
  },

  render() {
    const renderDatePanelLabel = () => {
      return (
        <div
          class={this.resolveClassName('date-picker-selectyear-wrapper')}
          v-clickoutside={this.handleCloseSelectYear}
        >
          <div
            class={this.resolveClassName('date-picker-year-label')}
            ref='triggerRef'
            onClick={() => this.handleShowSelectYear()}
          >
            {this.selectedYear}
          </div>
          <Transition name={this.resolveClassName('fade-down-transition')}>
            <SelectYear
              ref='selectYearRef'
              triggerRef={this.triggerRef}
              v-show={this.showSelectYear}
              selectedYear={String(this.selectedYear)}
              onSelectYear={(v: number) => this.handleSelectYear(v)}
            ></SelectYear>
          </Transition>
        </div>
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
            <MonthTable
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
