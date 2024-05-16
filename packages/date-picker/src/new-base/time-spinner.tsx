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

import type { ExtractPropTypes } from 'vue';
import { computed, defineComponent, PropType, ref, watch } from 'vue';

import { useLocale, usePrefix } from '@bkui-vue/config-provider';
import { scrollTop } from '@bkui-vue/shared';

import { selectYearMonthProps, timePanelProps } from '../new-props';
import { firstUpperCase, pad } from '../utils';

const timeSpinnerProps = {
  isVisible: {
    type: Boolean,
    default: false,
  },
  hours: {
    type: [Number, String],
    default: NaN,
  },
  minutes: {
    type: [Number, String],
    default: NaN,
  },
  seconds: {
    type: [Number, String],
    default: NaN,
  },
  showSeconds: {
    type: Boolean,
    default: true,
  },
  steps: {
    type: Array as PropType<Array<number>>,
    default: () => [],
  },
};

export type TimeSpinnerProps = Readonly<ExtractPropTypes<typeof timeSpinnerProps>>;

export default defineComponent({
  name: 'TimeSpinner',
  props: {
    ...selectYearMonthProps,
    ...timeSpinnerProps,
    ...timePanelProps,
  },
  emits: ['change', 'pickClick'],
  setup(props, { emit }) {
    const t = useLocale('datePicker');
    const hoursRef = ref(null);
    const minutesRef = ref(null);
    const secondsRef = ref(null);

    const spinerSteps = ref([1, 1, 1].map((one, i) => Math.abs(props.steps[i]) || one));
    // const compiled = ref(false);
    const focusedColumn = ref(-1);
    const focusedTime = ref([0, 0, 0]);

    const { resolveClassName } = usePrefix();

    const emitChange = changes => {
      emit('change', changes);
      emit('pickClick');
    };

    const getCellCls = cell => {
      return [
        resolveClassName('time-picker-cells-cell'),
        {
          [resolveClassName('time-picker-cells-cell-selected')]: cell.selected,
          [resolveClassName('time-picker-cells-cell-focused')]: cell.focused,
          [resolveClassName('time-picker-cells-cell-disabled')]: cell.disabled,
        },
      ];
    };

    const handleClick = (type, cell) => {
      if (cell.disabled) {
        return;
      }
      const data = { [type]: cell.text };
      emitChange(data);
    };

    // const scrollActiveOptionIntoView = () => {
    //   const yearSelectedNode = hoursRef.value?.querySelectorAll?.(
    //     `.${resolveClassName('time-picker-cells-cell-selected')}`,
    //   );
    //   yearSelectedNode?.[0]?.scrollIntoView({
    //     block: 'center',
    //     behavior: 'instant',
    //   });
    //   const monthSelectedNode = minutesRef.value?.querySelectorAll?.(
    //     `.${resolveClassName('time-picker-cells-cell-selected')}`,
    //   );
    //   console.error(monthSelectedNode);
    //   monthSelectedNode?.[0]?.scrollIntoView({
    //     block: 'center',
    //     behavior: 'instant',
    //   });
    // };

    const getDomRef = type => {
      let domRef;
      if (type === 'hours') {
        domRef = hoursRef;
      } else if (type === 'minutes') {
        domRef = minutesRef;
      } else {
        domRef = secondsRef;
      }
      return domRef.value;
    };

    const scroll = (type, index) => {
      const domRef = getDomRef(type);
      const from = domRef.scrollTop;
      const to = 32 * getScrollIndex(type, index);
      scrollTop(domRef, from, to, 500);
    };

    const scrollIdx = (idxs: string[]) => {
      for (const idx of idxs) {
        let listRef;
        if (idx === 'hours') {
          listRef = hoursList;
        } else if (idx === 'minutes') {
          listRef = minutesList;
        } else {
          listRef = secondsList;
        }
        scroll(
          idx,
          listRef.value.findIndex(obj => obj.text === props[idx]),
        );
      }
    };

    const getScrollIndex = (type, index) => {
      const t = firstUpperCase(type);
      const disabled = props[`disabled${t}`];
      let ret: number = index;
      if (disabled.length && props.hideDisabledOptions) {
        let count = 0;
        disabled.forEach(item => (item <= index ? (count += 1) : ''));
        ret -= count;
      }
      return ret;
    };

    const hoursList = computed(() => {
      const hours = [];
      const step = spinerSteps.value[0];
      const focusedHour = focusedColumn.value === 0 && focusedTime.value[0];
      const hourTmpl = {
        text: 0,
        selected: false,
        disabled: false,
        hide: false,
      };

      for (let i = 0; i < 24; i += step) {
        const hour = JSON.parse(JSON.stringify(hourTmpl));
        hour.text = i;
        hour.focused = i === focusedHour;

        if (props.disabledHours.length && props.disabledHours.indexOf(i) > -1) {
          hour.disabled = true;
          if (props.hideDisabledOptions) {
            hour.hide = true;
          }
        }
        if (props.hours === i) {
          hour.selected = true;
        }
        hours.push(hour);
      }

      return hours;
    });

    const minutesList = computed(() => {
      const minutes = [];
      const step = spinerSteps.value[1];
      const focusedMinute = focusedColumn.value === 1 && focusedTime.value[1];
      const minuteTmpl = {
        text: 0,
        selected: false,
        disabled: false,
        hide: false,
      };

      for (let i = 0; i < 60; i += step) {
        const minute = JSON.parse(JSON.stringify(minuteTmpl));
        minute.text = i;
        minute.focused = i === focusedMinute;

        if (props.disabledMinutes.length && props.disabledMinutes.indexOf(i) > -1) {
          minute.disabled = true;
          if (props.hideDisabledOptions) {
            minute.hide = true;
          }
        }
        if (props.minutes === i) {
          minute.selected = true;
        }
        minutes.push(minute);
      }
      return minutes;
    });

    const secondsList = computed(() => {
      const seconds = [];
      const step = spinerSteps.value[2];
      const focusedMinute = focusedColumn.value === 2 && focusedTime.value[2];
      const secondTmpl = {
        text: 0,
        selected: false,
        disabled: false,
        hide: false,
      };

      for (let i = 0; i < 60; i += step) {
        const second = JSON.parse(JSON.stringify(secondTmpl));
        second.text = i;
        second.focused = i === focusedMinute;

        if (props.disabledSeconds.length && props.disabledSeconds.indexOf(i) > -1) {
          second.disabled = true;
          if (props.hideDisabledOptions) {
            second.hide = true;
          }
        }
        if (props.seconds === i) {
          second.selected = true;
        }
        seconds.push(second);
      }

      return seconds;
    });

    const styles = computed(() => ({
      width: props.showSeconds ? '33.33%' : '50%',
    }));

    watch(
      () => props.hours,
      _val => {
        scrollIdx(['hours']);
        // scroll(
        //   'hours',
        //   hoursList.value.findIndex(obj => obj.text === val),
        // );
        // if (!compiled.value) {
        //   return;
        // }
        // scroll(
        //   'hours',
        //   hoursList.value.findIndex(obj => obj.text === val),
        // );
      },
    );

    watch(
      () => props.minutes,
      _val => {
        // if (!compiled.value) {
        //   return;
        // }
        // scroll(
        //   'minutes',
        //   minutesList.value.findIndex(obj => obj.text === val),
        // );
        scrollIdx(['minutes']);
        // scroll(
        //   'minutes',
        //   minutesList.value.findIndex(obj => obj.text === val),
        // );
      },
    );

    watch(
      () => props.seconds,
      _val => {
        // if (!compiled.value) {
        //   return;
        // }
        // scroll(
        //   'seconds',
        //   minutesList.value.findIndex(obj => obj.text === val),
        // );
        scrollIdx(['seconds']);
        // scroll(
        //   'seconds',
        //   secondsList.value.findIndex(obj => obj.text === val),
        // );
      },
    );

    watch(
      () => props.isVisible,
      () => {
        scrollIdx(['hours', 'minutes', 'seconds']);
      },
    );

    // onMounted(() => {
    //   nextTick(() => {
    //     scrollIdx(['hours', 'minutes', 'seconds']);
    //   });
    //   // setTimeout(() => {
    //   //   // compiled.value = true;
    //   //   // bindWheelEvent();

    //   //   scroll(
    //   //     'hours',
    //   //     hoursList.value.findIndex(obj => obj.text === props.hours),
    //   //   );
    //   //   scroll(
    //   //     'minutes',
    //   //     minutesList.value.findIndex(obj => obj.text === props.minutes),
    //   //   );
    //   //   scroll(
    //   //     'seconds',
    //   //     secondsList.value.findIndex(obj => obj.text === props.seconds),
    //   //   );
    //   // }, 500);
    //   // setTimeout(() => {
    //   //   scrollActiveOptionIntoView();
    //   // }, 2000);
    // });

    return {
      hoursRef,
      minutesRef,
      secondsRef,

      resolveClassName,
      t,

      focusedColumn,
      styles,

      getCellCls,
      handleClick,

      hoursList,
      minutesList,
      secondsList,
    };
  },
  render() {
    return (
      <div
        class={[
          this.resolveClassName('time-picker-cells'),
          this.showSeconds ? this.resolveClassName('time-picker-cells-with-seconds') : '',
        ]}
      >
        <div class={this.resolveClassName('time-picker-cells-title-wrapper')}>
          <div
            class={[this.resolveClassName('time-picker-cells-title'), this.focusedColumn === 0 ? 'active' : '']}
            style={this.styles}
          >
            {this.t.hour}
          </div>
          <div
            class={[this.resolveClassName('time-picker-cells-title'), this.focusedColumn === 1 ? 'active' : '']}
            style={this.styles}
          >
            {this.t.min}
          </div>
          <div
            class={[this.resolveClassName('time-picker-cells-title'), this.focusedColumn === 2 ? 'active' : '']}
            v-show={this.showSeconds}
            style={this.styles}
          >
            {this.t.sec}
          </div>
        </div>
        <div
          class={this.resolveClassName('time-picker-cells-list')}
          ref='hoursRef'
          style={this.styles}
        >
          <ul class={this.resolveClassName('time-picker-cells-ul')}>
            {this.hoursList.map(item => (
              <li
                class={this.getCellCls(item)}
                v-show={!item.hide}
                onClick={() => this.handleClick('hours', item)}
              >
                {pad(item.text)}
              </li>
            ))}
          </ul>
        </div>
        <div
          class={this.resolveClassName('time-picker-cells-list')}
          ref='minutesRef'
          style={this.styles}
        >
          <ul class={this.resolveClassName('time-picker-cells-ul')}>
            {this.minutesList.map(item => (
              <li
                class={this.getCellCls(item)}
                v-show={!item.hide}
                onClick={() => this.handleClick('minutes', item)}
              >
                {pad(item.text)}
              </li>
            ))}
          </ul>
        </div>
        <div
          class={this.resolveClassName('time-picker-cells-list')}
          v-show={this.showSeconds}
          ref='secondsRef'
          style={this.styles}
        >
          <ul class={this.resolveClassName('time-picker-cells-ul')}>
            {this.secondsList.map(item => (
              <li
                class={this.getCellCls(item)}
                v-show={!item.hide}
                onClick={() => this.handleClick('seconds', item)}
              >
                {pad(item.text)}
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  },
});
