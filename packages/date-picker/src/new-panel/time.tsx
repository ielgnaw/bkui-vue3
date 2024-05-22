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

import { computed, defineComponent, ref, watch } from 'vue';

import { useLocale, usePrefix } from '@bkui-vue/config-provider';
import { clickoutside } from '@bkui-vue/directives';
import { capitalize } from '@bkui-vue/shared';

import TimeSpinner from '../new-base/time-spinner';
// import Confirm from '../base/confirm';
import type { DatePickerValueType } from '../new-interface';
import { timePanelProps } from '../new-props';
import {
  ALL_YEARS,
  // formatDateLabels,
  PANEL_WIDTH,
  // timePickerKey
} from '../utils';

// import Time from './time';

export default defineComponent({
  name: 'TimePanel',
  directives: {
    clickoutside,
  },
  props: timePanelProps,
  emits: ['pick'],
  setup(props, { emit }) {
    const t = useLocale('datePicker');
    const { resolveClassName } = usePrefix();
    // const dateWrapperRef = ref<HTMLElement>(null);
    const timeWrapperRef = ref<HTMLElement>(null);

    const dates = ref((props.value as DatePickerValueType[]).slice().sort() as any);

    const panelDate = ref(props.startDate || dates.value[0] || new Date());

    const allYears = ref(ALL_YEARS);
    const selectedHours = ref<number>(panelDate.value.getHours());
    const selectedMinutes = ref<number>(panelDate.value.getMinutes());
    const selectedSeconds = ref<number>(panelDate.value.getSeconds());

    const setPanelDate = () => {
      dates.value = props.value;
      const pDate = props.multiple ? dates.value[dates.value.length - 1] : props.startDate || dates.value[0];
      panelDate.value = pDate || new Date();
    };

    const handleChange = val => {
      const newDate = new Date(panelDate.value);
      Object.keys(val).forEach(type => newDate[`set${capitalize(type)}`](val[type]));
      dates.value = [newDate];
      emit('pick', newDate);
    };

    const handlePick = value => {
      const val = new Date(value);

      dates.value = [val];
      emit('pick', val);
    };

    // const handleToggleDateTime = (idx: string) => {
    //   dateTimeActive.value = idx;
    //   dateWrapperRef.value.style.transform = `translateX(${idx === 'date' ? 0 : '-100%'})`;
    //   timeWrapperRef.value.style.transform = `translateX(${idx === 'date' ? '100%' : 0})`;
    // };

    const showSeconds = computed(() => !(props.format || '').match(/mm$/));

    watch(
      () => panelDate.value,
      (v: Date) => {
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
        if (v) {
          setPanelDate();
        }
      },
    );

    return {
      t,
      resolveClassName,

      // dateWrapperRef,
      timeWrapperRef,

      dates,
      allYears,
      selectedHours,
      selectedMinutes,
      selectedSeconds,
      panelDate,

      showSeconds,

      handleChange,
      handlePick,
      // handleToggleDateTime,
    };
  },

  render() {
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
          <div
            ref='timeWrapperRef'
            class={this.resolveClassName('date-picker-time-wrapper')}
          >
            <div class={this.resolveClassName('picker-time-panel-content')}>
              <TimeSpinner
                ref='timeSpinnerRef'
                isVisible={this.opened}
                showSeconds={this.showSeconds}
                // steps={this.steps}
                hours={this.selectedHours}
                minutes={this.selectedMinutes}
                seconds={this.selectedSeconds}
                // disabledHours={this.disabledHMS.disabledHours}
                // disabledMinutes={this.disabledHMS.disabledMinutes}
                // disabledSeconds={this.disabledHMS.disabledSeconds}
                // hideDisabledOptions={this.hideDisabledOptions}
                onChange={this.handleChange}
              />
              {this.showNow ? (
                <>
                  <div
                    class={this.resolveClassName('picker-today-shortcut')}
                    onClick={() => this.handlePick(new Date())}
                  >
                    {this.t.now}
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    );
  },
});
