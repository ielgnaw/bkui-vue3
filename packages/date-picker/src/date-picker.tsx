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
  type ComponentPublicInstance,
  // computed,
  defineComponent,
  ref,
  SlotsType,
  Teleport,
  Transition,
  type VNode,
} from 'vue';

import { usePrefix } from '@bkui-vue/config-provider';
import { clickoutside } from '@bkui-vue/directives';
import { Close } from '@bkui-vue/icon';

import PickerDropdown from './base/picker-dropdown';
import { dateIcon, timeIcon } from './common';
// import { createDefaultTrigger } from './common';
// import { DatePickerPanelType, type SelectionModeType } from './new-interface';
import DatePanel from './new-panel/date';
import MonthPanel from './new-panel/month';
import QuarterPanel from './new-panel/quarter';
import YearPanel from './new-panel/year';
import { datePickerProps } from './new-props';
import { useCalendar } from './new-use-calendar';
// import DateRangePanel from './panel/date-range';
import { PANEL_WIDTH } from './utils';

export default defineComponent({
  name: 'DatePicker',
  directives: {
    clickoutside,
  },
  props: datePickerProps,
  emits: [
    'open-change',
    'input',
    'change',
    'update:modelValue',
    'clear',
    'shortcut-change',
    'pick-success',
    'pick-first',
  ],
  // slots: ['header'],
  slots: Object as SlotsType<{
    header?: () => any;
    trigger?: (displayValue: string) => any;
    footer?: () => any;
    shortcuts?: (arg?: { change: Function }) => any;
    confirm?: {};
  }>,
  setup(props, { slots, emit }) {
    const { resolveClassName } = usePrefix();
    const params = useCalendar(props, slots, emit);

    const triggerRef = ref<HTMLElement>(null);

    return {
      resolveClassName,
      // defaultTrigger,
      triggerRef,
      ...params,
    };
  },
  render() {
    const renderTrigger = () => {
      return (
        <div>
          <span
            class={['icon-wrapper', this.disabled ? 'disabled' : '']}
            onClick={this.handleIconClick}
          >
            {this.type === 'time' || this.type === 'timerange' ? timeIcon : dateIcon}
          </span>
          {/* {this.displayValue}--{this.showClose}-- */}
          <input
            type='text'
            class={[
              this.resolveClassName('date-picker-editor'),
              this.readonly ? 'readonly' : '',
              this.fontSizeCls,
              this.behavior === 'simplicity' ? 'only-bottom-border' : '',
            ]}
            // ref='inputRef'
            ref={(el: Element | ComponentPublicInstance | null) => this.setInputRef(el)}
            key={this.forceInputRerender}
            readonly={this.localReadonly}
            disabled={this.disabled}
            placeholder={this.placeholder}
            value={this.displayValue}
            // onClick={this.handleFocus}
            onClick={e => {
              e.stopPropagation();
              e.preventDefault();
            }}
            onFocus={this.handleFocus}
            onBlur={this.handleBlur}
            onKeydown={this.handleKeydown}
            onChange={this.handleInputChange}
            onInput={this.handleInputInput}
          />
          {this.clearable && this.showClose ? (
            <Close
              onClick={this.handleClear}
              class='clear-action'
            />
          ) : (
            ''
          )}
        </div>
      );
    };

    const renderPanel = () => {
      let panel: VNode = null;
      console.error(this.panel);
      switch (this.panel) {
        case 'YearPanel':
          panel = (
            <YearPanel
              ref='pickerPanelRef'
              value={this.internalValue}
              multiple={this.multiple}
              startDate={this.startDate}
              disabledDate={this.disabledDate}
              cellClass={this.cellClass}
              onPick={this.onPick}
            />
          );
          break;
        case 'QuarterPanel':
          panel = (
            <QuarterPanel
              ref='pickerPanelRef'
              value={this.internalValue}
              multiple={this.multiple}
              startDate={this.startDate}
              disabledDate={this.disabledDate}
              cellClass={this.cellClass}
              onPick={this.onPick}
              // inputRef={this.inputRef}
            />
          );
          break;
        case 'MonthPanel':
          panel = (
            <MonthPanel
              ref='pickerPanelRef'
              value={this.internalValue}
              multiple={this.multiple}
              startDate={this.startDate}
              disabledDate={this.disabledDate}
              cellClass={this.cellClass}
              onPick={this.onPick}
            />
          );
          break;
        // case 'DatePanel':
        //   panel = (
        //     <DatePanel
        //       ref='pickerPanelRef'
        //       value={this.internalValue}
        //       multiple={this.multiple}
        //       clearable={this.clearable}
        //       shortcuts={this.shortcuts}
        //       shortcutClose={this.shortcutClose}
        //       // selectionMode={this.selectionMode}
        //       type={this.type}
        //       startDate={this.startDate}
        //       focusedDate={this.focusedDate}
        //       disabledDate={this.disabledDate}
        //       // confirm={this.isConfirm}
        //       showTime={this.type === 'datetime' || this.type === 'datetimerange'}
        //       timePickerOptions={this.timePickerOptions}
        //       onPick={this.onPick}
        //       // onPick-clear={this.handleClear}
        //       // onPick-success={this.onPickSuccess}
        //       // onSelection-mode-change={this.onSelectionModeChange}
        //       // v-slots={slots}
        //     />
        //   );
        //   break;
        default:
          break;
      }
      return panel;
    };
    return (
      <div
        class={[this.resolveClassName('date-picker'), this.type === 'datetimerange' ? 'long' : '', this.longWidthCls]}
        style={{
          '--panel-width': `${PANEL_WIDTH}px`,
        }}
        v-clickoutside={this.handleClose}
      >
        <div
          ref='triggerRef'
          class={this.resolveClassName('date-picker-rel')}
          onMouseenter={this.handleInputMouseenter}
          onMouseleave={this.handleInputMouseleave}
        >
          {this.$slots.trigger?.(this.displayValue) ?? renderTrigger()}
        </div>
        <Teleport
          to='body'
          disabled={!this.appendToBody}
        >
          <Transition name={this.resolveClassName('fade-down-transition')}>
            <PickerDropdown
              class={[this.appendToBody ? this.resolveClassName('date-picker-transfer') : '']}
              ref='pickerDropdownRef'
              v-show={this.opened}
              triggerRef={this.triggerRef}
              placement={this.placement}
              extPopoverCls={this.extPopoverCls}
              appendToBody={this.appendToBody}
            >
              {/* {this.hasHeader ? (
                <div class={[this.resolveClassName('date-picker-top-wrapper'), this.headerSlotCls]}>
                  {this.$slots.header?.() ?? null}
                </div>
              ) : null} */}
              {/* {this.panel}--{this.type}--{this.selectionMode} */}
              {renderPanel()}
              {/* {this.panel === 'DateRangePanel' ? (
                <DateRangePanel
                  ref='pickerPanelRef'
                  type={this.type}
                  showTime={this.type === 'datetime' || this.type === 'datetimerange'}
                  confirm={this.isConfirm}
                  shortcuts={this.shortcuts}
                  shortcutClose={this.shortcutClose}
                  modelValue={this.internalValue}
                  selectionMode={this.selectionMode}
                  startDate={this.startDate}
                  disabledDate={this.disabledDate}
                  focusedDate={this.focusedDate}
                  timePickerOptions={this.timePickerOptions}
                  onPick={this.onPick}
                  onPick-clear={this.handleClear}
                  onPick-success={this.onPickSuccess}
                  onSelection-mode-change={this.onSelectionModeChange}
                  v-slots={slots}
                  shortcutSelectedIndex={this.shortcutSelectedIndex}
                  onPick-first={this.onPickFirst}
                />
              ) : (
                <DatePanel
                  ref='pickerPanelRef'
                  clearable={this.clearable}
                  showTime={this.type === 'datetime' || this.type === 'datetimerange'}
                  confirm={this.isConfirm}
                  shortcuts={this.shortcuts}
                  multiple={this.multiple}
                  shortcutClose={this.shortcutClose}
                  selectionMode={this.selectionMode}
                  modelValue={this.internalValue}
                  startDate={this.startDate}
                  disabledDate={this.disabledDate}
                  focusedDate={this.focusedDate}
                  timePickerOptions={this.timePickerOptions}
                  onPick={this.onPick}
                  onPick-clear={this.handleClear}
                  onPick-success={this.onPickSuccess}
                  onSelection-mode-change={this.onSelectionModeChange}
                  v-slots={slots}
                />
              )}
              {this.hasFooter ? (
                <div class={[this.resolveClassName('date-picker-footer-wrapper'), this.footerSlotCls]}>
                  {this.$slots.footer?.() ?? null}
                </div>
              ) : null} */}
            </PickerDropdown>
          </Transition>
        </Teleport>
      </div>
    );
  },
});
