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

import { type ComponentPublicInstance, defineComponent, ref, SlotsType, Teleport, Transition, type VNode } from 'vue';

import { usePrefix } from '@bkui-vue/config-provider';
import { clickoutside } from '@bkui-vue/directives';
import { Close } from '@bkui-vue/icon';

import PickerDropdown from './base/picker-dropdown';
import { DateIcon, TimeIcon } from './common';
import TimePanel from './new-panel/time';
// import VueTypes, { toType, toValidableType } from 'vue-types';
// import { PropTypes } from '@bkui-vue/shared';
import { datePickerProps, timePanelProps, timePickerProps } from './new-props';
import { useCalendar } from './new-use-calendar';

export default defineComponent({
  name: 'TimePicker',
  directives: {
    clickoutside,
  },
  props: {
    ...datePickerProps,
    ...timePickerProps,
    ...timePanelProps,
  },
  emits: ['open-change', 'input', 'change', 'update:modelValue', 'clear', 'shortcut-change', 'pick-success'],
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
            {this.type === 'time' || this.type === 'timerange' ? <TimeIcon /> : <DateIcon />}
          </span>
          <input
            type='text'
            class={[
              this.resolveClassName('date-picker-editor'),
              this.readonly ? 'readonly' : '',
              this.fontSizeCls,
              this.behavior === 'simplicity' ? 'only-bottom-border' : '',
            ]}
            ref={(el: Element | ComponentPublicInstance | null) => this.setInputRef(el)}
            key={this.forceInputRerender}
            readonly={this.localReadonly}
            disabled={this.disabled}
            placeholder={this.placeholder}
            value={this.displayValue}
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
      let view: VNode = null;

      switch (this.panel) {
        case 'TimePanel':
          view = (
            <TimePanel
              ref='pickerPanelRef'
              value={this.internalValue}
              multiple={this.multiple}
              clearable={this.clearable}
              shortcuts={this.shortcuts}
              shortcutClose={this.shortcutClose}
              type={this.type}
              startDate={this.startDate}
              focusedDate={this.focusedDate}
              disabledDate={this.disabledDate}
              timePickerOptions={this.timePickerOptions}
              opened={this.opened}
              onPick={this.onPick}
              format={this.format}
            />
          );
          break;
        default:
          break;
      }
      return view;
    };

    // const shortcutsSlot = this.hasShortcuts ? { shortcuts: () => this.$slots.shortcuts?.() || null } : {};

    return (
      <div
        class={[this.resolveClassName('date-picker'), this.type === 'datetimerange' ? 'long' : '', this.longWidthCls]}
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
          to={this.teleportTo}
          disabled={!this.appendToBody}
        >
          <Transition name='bk-fade-down-transition'>
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
              {renderPanel()}
              {/* {this.panel === 'RangeTimePickerPanel' ? (
                <TimeRangePanel
                  ref='pickerPanelRef'
                  clearable={this.clearable}
                  shortcuts={this.shortcuts}
                  multiple={this.multiple}
                  shortcutClose={this.shortcutClose}
                  value={this.internalValue}
                  startDate={this.startDate}
                  disabledDate={this.disabledDate}
                  onPick={this.onPick}
                  onPick-clear={this.handleClear}
                  onPick-success={this.onPickSuccess}
                  v-slots={shortcutsSlot}
                  disabledHours={this.ownPickerProps.disabledHours}
                  disabledMinutes={this.ownPickerProps.disabledMinutes}
                  disabledSeconds={this.ownPickerProps.disabledSeconds}
                  allowCrossDay={this.allowCrossDayProp}
                  format={this.format}
                />
              ) : (
                <TimePanel
                  ref='pickerPanelRef'
                  clearable={this.clearable}
                  confirm={this.isConfirm}
                  shortcuts={this.shortcuts}
                  multiple={this.multiple}
                  shortcutClose={this.shortcutClose}
                  value={this.internalValue}
                  startDate={this.startDate}
                  disabledDate={this.disabledDate}
                  onPick={this.onPick}
                  onPick-clear={this.handleClear}
                  onPick-success={this.onPickSuccess}
                  v-slots={shortcutsSlot}
                  disabledHours={this.ownPickerProps.disabledHours}
                  disabledMinutes={this.ownPickerProps.disabledMinutes}
                  disabledSeconds={this.ownPickerProps.disabledSeconds}
                  format={this.format}
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
