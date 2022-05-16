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

import { test, describe, expect } from 'vitest';

import { mount } from '@vue/test-utils';

import Link from '../';

const linkContent = 'bk-link is testing';
describe('Link.tsx', () => {
  test('render test', async () => {
    const wrapper = await mount(Link, {
      slots: {
        default: linkContent,
      },
    });
    expect(wrapper.text()).toEqual(linkContent);
    expect(wrapper.classes()).toContain('bk-link');
  });

  test('emit click event when is not disabled', async () => {
    const wrapper = await mount(Link, {
      slots: {
        default: linkContent,
      },
    });

    await wrapper.trigger('click');
    expect(wrapper.emitted('click')).toBeDefined();
  });

  test('disabled render', async () => {
    const wrapper = await mount(Link, {
      slots: {
        default: linkContent,
      },
      props: {
        disabled: true,
      },
    });

    expect(wrapper.classes()).toContain('is-disabled');
  });

  test('test link underline', async () => {
    const wrapper = await mount(Link, {
      slots: {
        default: linkContent,
      },
      props: {
        underline: true,
      },
    });

    expect(wrapper.classes()).toContain('has-underline');
  });

  test('test link theme', async () => {
    const themes = ['default', 'primary', 'success', 'warning', 'danger'];
    const { validator } = Link.props.theme;
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    themes.forEach(async (theme: string) => {
      const wrapper = await mount(Link, {
        slots: {
          default: linkContent,
        },
        props: {
          theme,
        },
      });
      expect(validator(theme)).toBe(true);
      expect(wrapper.classes()).toContain(theme);
    });

    expect(validator('batman')).toBe(false);
  });
});
