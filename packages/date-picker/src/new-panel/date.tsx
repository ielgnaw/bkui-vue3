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

// import type { Placement } from '@popperjs/core';
// import { bkZIndexManager, BKPopover, IBKPopover } from '@bkui-vue/shared';
import type { ExtractPropTypes, VNode } from 'vue';
import {
  // onMounted,
  // onBeforeUnmount,
  computed,
  defineComponent,
  getCurrentInstance,
  nextTick,
  PropType,
  provide,
  reactive,
  ref,
  toRefs,
  watch,
} from 'vue';

import { usePrefix } from '@bkui-vue/config-provider';
import { AngleDoubleLeft, AngleDoubleRight, AngleLeft, AngleRight } from '@bkui-vue/icon';

import Confirm from '../base/confirm';
import type { DatePickerShortcutsType, DatePickerValueType, DisabledDateType, SelectionModeType } from '../interface';
import DateTable from '../new-base/date-table';
import MonthTable from '../new-base/month-table';
import QuarterTable from '../new-base/quarter-table';
import YearTable from '../new-base/year-table';
import { formatDateLabels, getYearCells, iconBtnCls, pad, PANEL_WIDTH, siblingMonth, timePickerKey } from '../utils';

import Time from './time';

const datePanelProps = {
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
  clearable: {
    type: Boolean,
    default: true,
  },
  shortcutClose: {
    type: Boolean,
    default: false,
  },
  selectionMode: {
    type: String as PropType<SelectionModeType>,
    default: 'date',
    // validator(v) {
    //   if (['year', 'month', 'quarter', 'date', 'time'].indexOf(v) < 0) {
    //     console.error(`selectionMode property is not valid: '${v}'`);
    //     return false;
    //   }
    //   return true;
    // },
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
  // format: {
  //   type: String,
  //   default: 'yyyy-MM-dd',
  // },
  disabledDate: {
    // type: Function,
    type: Function as PropType<DisabledDateType>,
    default: () => false,
  },
  timePickerOptions: {
    type: Object as PropType<Record<string, any>>,
    default: () => ({}),
  },
} as const;

export type DatePanelProps = Readonly<ExtractPropTypes<typeof datePanelProps>>;

const getTableType = curView => `${curView}-table`;

export default defineComponent({
  name: 'DatePanel',
  props: datePanelProps,
  emits: ['pick', 'pick-success', 'pick-clear', 'pick-click', 'selection-mode-change'],
  setup(props, { slots, emit }) {
    const { resolveClassName } = usePrefix();

    const dates = ref((props.value as DatePickerValueType[]).slice().sort() as any);

    // type: date, daterange, datetime, datetimerange => selectionMode: date
    // type: month => selectionMode: month
    // type: quarter => selectionMode: quarter
    // type: year => selectionMode: year
    // type: time, timerange => selectionMode: time

    // selectionMode = props.type
    // 'year' | 'month' | 'quarter' | 'date' | 'daterange' | 'datetime' | 'datetimerange' | 'time' | 'timerange'
    const currentView = ref(props.selectionMode || 'date');

    // currentView: year => tableType: year-table
    // currentView: month => tableType: month-table
    // currentView: quarter => tableType: quarter-table
    // currentView: date => tableType: date-table
    // currentView: daterange => tableType: daterange-table
    // currentView: datetime => tableType: datetime-table
    // currentView: datetimerange => tableType: datetimerange-table
    // currentView: time => tableType: time-table
    // currentView: timerange => tableType: timerange-table
    const tableType = ref(getTableType(currentView.value));

    const panelDate = ref(props.startDate || dates.value[0] || new Date());

    const resetView = () => {
      setTimeout(() => {
        currentView.value = props.selectionMode;
        tableType.value = getTableType(currentView.value);
      }, 500);
    };

    const changeYear = dir => {
      if (props.selectionMode === 'year' || tableType.value === 'year-table') {
        panelDate.value = new Date((panelDate.value as Date).getFullYear() + dir * 10, 0, 1);
      } else {
        panelDate.value = siblingMonth(panelDate.value, dir * 12);
      }
    };

    const changeMonth = dir => {
      panelDate.value = siblingMonth(panelDate.value, dir);
    };

    const handlePickSuccess = () => {
      resetView();
      emit('pick-success');
    };

    const handleShortcutClick = shortcut => {
      if (shortcut.value) {
        // pick 参数：dates, visible, type, isUseShortCut
        emit('pick', shortcut.value(), false, props.selectionMode, shortcut);
      }
      if (shortcut.onClick) {
        shortcut.onClick(this);
      }
      if (props.shortcutClose) {
        handlePickSuccess();
      }
    };

    const handlePreSelection = value => {
      panelDate.value = value;
      if (currentView.value === 'date' || currentView.value === 'datetime') {
        if (tableType.value === 'year-table') {
          tableType.value = 'month-table';
        } else if (tableType.value === 'month-table') {
          tableType.value = getTableType(currentView.value);
        }
      } else {
        tableType.value = getTableType(currentView.value);
      }
    };

    const handlePick = (value, _visible = false, type, _shortcut) => {
      // console.error('handlePick', value, _visible, type, _shortcut);
      let val = value;
      if (props.selectionMode === 'year') {
        val = new Date(value.getFullYear(), 0, 1);
      } else if (props.selectionMode === 'month') {
        val = new Date((panelDate.value as Date).getFullYear(), value.getMonth(), 1);
      } else {
        val = new Date(value);
      }

      dates.value = [val];
      // pick 参数：dates, visible, type, isUseShortCut
      emit('pick', val, false, type || props.selectionMode);
    };

    const reset = () => {
      currentView.value = props.selectionMode;
      tableType.value = getTableType(currentView.value);
    };

    const panelPickerHandlers = computed(() => {
      return tableType.value === `${currentView.value}-table` ? handlePick : handlePreSelection;
    });

    // const { proxy } = getCurrentInstance();
    // provide(timePickerKey, {
    //   panelDate: state.panelDate,
    //   parentName: proxy.$options.name,
    // });

    // const timePickerRef = ref(null);
    // const timeSpinnerRef = ref(null);
    // const timeSpinnerEndRef = ref(null);

    // watch(
    //   () => state.currentView,
    //   val => {
    //     emit('selection-mode-change', val);

    //     if (state.currentView === 'time') {
    //       nextTick(() => {
    //         const spinner = timePickerRef.value.timeSpinnerRef;
    //         spinner.updateScroll();
    //       });
    //     }
    //   },
    // );

    watch(
      () => props.selectionMode,
      type => {
        currentView.value = type;
        tableType.value = getTableType(type);
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

    // const handlePickClear = () => {
    //   resetView();
    //   emit('pick-clear');
    // };

    // const onToggleVisibility = open => {
    //   if (open) {
    //     timeSpinnerRef?.value?.updateScroll();
    //     timeSpinnerEndRef?.value?.updateScroll();
    //   }
    // };

    // const handleToggleTime = () => {
    //   state.currentView = state.currentView === 'time' ? 'date' : 'time';
    // };

    const hasShortcuts = computed(() => !!slots.shortcuts);

    // const datePanelLabel = computed(() => {
    //   const locale = 'zh-CN';
    //   const datePanelLabelStr = '[yyyy]-[mm]';
    //   const date = panelDate.value;
    //   const { labels, separator } = formatDateLabels(locale, datePanelLabelStr, date);

    //   const handler = type => () => {
    //     tableType.value = getTableType(type);
    //   };

    //   return {
    //     separator,
    //     labels: labels.map((obj: any) => {
    //       const ret = obj;
    //       ret.handler = handler(obj.type);
    //       return ret;
    //     }),
    //   };
    // });

    // const showLabelFirst = computed(
    //   () => (datePanelLabel as any).value.labels[0].type === 'year' || currentView.value === 'date',
    // );

    // const showLabelSecond = computed(
    //   () => (datePanelLabel as any).value.labels[1].type === 'year' || currentView.value === 'date',
    // );

    // watch(
    //   currentView,
    //   v => {
    //     tableType.value = `${v}-table`;
    //   },
    //   {
    //     immediate: true,
    //   },
    // );

    const isTime = computed(() => currentView.value === 'time');
    const timeDisabled = computed(() => !dates.value[0]);

    // function handlePickClick() {
    //   emit('pick-click');
    // }

    // const { resolveClassName } = usePrefix();

    const panelLabelClick = (type: string) => {
      console.error('typetypetypetype', type);
      tableType.value = getTableType(type);
    };

    return {
      resolveClassName,
      currentView,
      tableType,
      dates,
      panelDate,
      hasShortcuts,
      // datePanelLabel,
      // showLabelFirst,
      // showLabelSecond,

      changeYear,
      changeMonth,

      timeDisabled,
      isTime,

      handleShortcutClick,
      panelPickerHandlers,
      reset,

      panelLabelClick,

      // datePanelLabel,
      // handleShortcutClick,
      // changeYear,
      // changeMonth,
      // reset,
      // hasShortcuts,
      // timeDisabled,
      // onToggleVisibility,
      // handleToggleTime,
      // handlePickSuccess,
      // handlePickClear,
      // handlePick,
      // handlePickClick,
      // timePickerRef,
      // resolveClassName,
    };
  },

  render() {
    const renderView = () => {
      let view: VNode = null;
      switch (this.tableType) {
        case 'date-table':
          view = (
            <DateTable
              tableDate={this.panelDate as Date}
              disabledDate={this.disabledDate}
              selectionMode={this.selectionMode}
              value={this.dates as DatePickerValueType}
              // focusedDate={this.focusedDate}
              onPick={this.panelPickerHandlers}
            />
          );
          break;
        case 'datetime-table':
          view = (
            <DateTable
              tableDate={this.panelDate as Date}
              disabledDate={this.disabledDate}
              selectionMode={this.selectionMode}
              value={this.dates as DatePickerValueType}
              // focusedDate={this.focusedDate}
              onPick={this.panelPickerHandlers}
            />
          );
          break;
        case 'year-table':
          view = (
            <YearTable
              tableDate={this.panelDate as Date}
              disabledDate={this.disabledDate}
              selectionMode={this.selectionMode}
              value={this.dates as DatePickerValueType}
              // focusedDate={this.focusedDate}
              onPick={this.panelPickerHandlers}
            />
          );
          break;
        case 'quarter-table':
          view = (
            <QuarterTable
              tableDate={this.panelDate as Date}
              disabledDate={this.disabledDate}
              selectionMode={this.selectionMode}
              value={this.dates as DatePickerValueType}
              // focusedDate={this.focusedDate}
              onPick={this.panelPickerHandlers}
            />
          );
          break;
        case 'month-table':
          view = (
            <MonthTable
              tableDate={this.panelDate as Date}
              disabledDate={this.disabledDate}
              selectionMode={this.selectionMode}
              value={this.dates as DatePickerValueType}
              // focusedDate={this.focusedDate}
              onPick={this.panelPickerHandlers}
            />
          );
          break;
        default:
          break;
      }
      return view;
    };

    // const date = this.panelDate;
    // const locale = 'zh-CN';
    // const datePanelLabelStr = '[yyyy]-[mm]';
    // const { labels, separator } = formatDateLabels(locale, datePanelLabelStr, date);
    // console.error('labels', labels);

    const renderDatePanelLabel = () => {
      let view: VNode = null;
      const startYear = Math.floor(this.panelDate.getFullYear() / 10) * 10;
      const yearCells = getYearCells(startYear);
      const firstYear = yearCells[0].date;
      const lastYear = yearCells[yearCells.length - 1].date;
      switch (this.tableType) {
        case 'datetime-table':
        case 'date-table':
          view = (
            <>
              <span>
                <span
                  class={this.resolveClassName('date-picker-header-label')}
                  onClick={() => this.panelLabelClick('year')}
                >
                  {this.panelDate.getFullYear()}
                </span>
                &nbsp;-&nbsp;
                <span
                  class={this.resolveClassName('date-picker-header-label')}
                  onClick={() => this.panelLabelClick('month')}
                >
                  {pad(this.panelDate.getMonth() + 1)}
                </span>
              </span>
            </>
          );
          break;
        case 'year-table':
          view = (
            <>
              <span>
                <span>
                  {firstYear.getFullYear()} - {lastYear.getFullYear()}
                </span>
              </span>
            </>
          );
          break;
        case 'month-table':
          view = (
            <>
              <span
                onClick={() => this.panelLabelClick('year')}
                class={this.resolveClassName('date-picker-header-label')}
              >
                {this.panelDate.getFullYear()}
              </span>
            </>
          );
          break;
        case 'quarter-table':
          view = (
            <>
              <span
                onClick={() => this.panelLabelClick('year')}
                class={this.resolveClassName('date-picker-header-label')}
              >
                {this.panelDate.getFullYear()}
              </span>
            </>
          );
          break;
        default:
          break;
      }
      return view;
    };

    return (
      <div
        class={[
          this.resolveClassName('picker-panel-body-wrapper'),
          this.shortcuts.length || this.hasShortcuts ? this.resolveClassName('picker-panel-with-sidebar') : '',
        ]}
        onMousedown={(e: MouseEvent) => {
          e.preventDefault();
        }}
      >
        {this.shortcuts.length ? (
          <div class={`${this.resolveClassName('picker-panel-sidebar')}`}>
            {this.shortcuts.map(shortcut => (
              <div
                class={this.resolveClassName('picker-panel-shortcut')}
                onClick={() => this.handleShortcutClick(shortcut)}
              >
                {shortcut.text}
              </div>
            ))}
          </div>
        ) : (
          ''
        )}
        <div
          class={this.resolveClassName('picker-panel-body')}
          style={{
            width: this.tableType === 'datetime-table' ? `${PANEL_WIDTH * 2 - 40}px` : `${PANEL_WIDTH}px`,
            paddingRight: this.tableType === 'datetime-table' ? `${PANEL_WIDTH - 40}px` : 0,
          }}
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
            {this.tableType === 'date-table' || this.tableType === 'datetime-table' ? (
              <span
                class={iconBtnCls('prev')}
                onClick={() => this.changeMonth(-1)}
                // v-show={this.currentView === 'date'}
              >
                <AngleLeft style={{ fontSize: '20px', lineHeight: 1, verticalAlign: 'text-bottom' }}></AngleLeft>
              </span>
            ) : (
              ''
            )}
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
            {this.tableType === 'date-table' || this.tableType === 'datetime-table' ? (
              <span
                class={iconBtnCls('next')}
                onClick={() => this.changeMonth(+1)}
              >
                <AngleRight style={{ fontSize: '20px', lineHeight: 1, verticalAlign: 'text-bottom' }}></AngleRight>
              </span>
            ) : (
              ''
            )}
          </div>

          <div class={this.resolveClassName('picker-panel-content')}>
            {renderView()}
            {/*  {this.currentView !== 'time' ? (
              (() => {
                switch (this.tableType) {
                  case 'date-table':
                    return (
                      <DateTable
                        tableDate={this.panelDate as Date}
                        disabledDate={this.disabledDate}
                        selectionMode={this.selectionMode}
                        value={this.dates as DatePickerValueType}
                        focusedDate={this.focusedDate}
                        onPick={this.panelPickerHandlers}
                      />
                    );
                  case 'year-table':
                    return (
                      <YearTable
                        tableDate={this.panelDate as Date}
                        disabledDate={this.disabledDate}
                        selectionMode={this.selectionMode}
                        value={this.dates as DatePickerValueType}
                        focusedDate={this.focusedDate}
                        onPick={this.panelPickerHandlers}
                      />
                    );
                  case 'month-table':
                    return (
                      <MonthTable
                        tableDate={this.panelDate as Date}
                        disabledDate={this.disabledDate}
                        selectionMode={this.selectionMode}
                        value={this.dates as DatePickerValueType}
                        focusedDate={this.focusedDate}
                        onPick={this.panelPickerHandlers}
                      />
                    );
                  default:
                    return null;
                }
              })()
            ) : (
              <Time
                ref='timePickerRef'
                value={this.dates}
                format={this.format}
                selectionMode={this.selectionMode}
                disabledDate={this.disabledDate}
                // v-bind={this.timePickerOptions}
                onPick={this.handlePick}
                onPick-click={this.handlePickClick}
                onPick-clear={this.handlePickClear}
                onPick-success={this.handlePickSuccess}
                onPick-toggle-time={this.handleToggleTime}
              />
            )}*/}
          </div>

          {/* {this.confirm ? (
            <Confirm
              clearable={this.clearable}
              showTime={this.showTime}
              timeDisabled={this.timeDisabled}
              isTime={this.isTime}
              // onPick-toggle-time={this.handleToggleTime}
              // onPick-clear={this.handlePickClear}
              // onPick-success={this.handlePickSuccess}
              v-slots={this.$slots}
            ></Confirm>
          ) : (
            ''
          )} */}
        </div>
        {this.tableType === 'datetime-table' ? (
          <>
            <div
              style={{
                position: 'absolute',
                left: `${PANEL_WIDTH}px`,
              }}
            >
              aadsasddas
            </div>
          </>
        ) : null}
        {this.hasShortcuts ? (
          <div class={this.resolveClassName('picker-panel-sidebar')}>{this.$slots.shortcuts?.() ?? null}</div>
        ) : null}
      </div>
    );
  },
});
