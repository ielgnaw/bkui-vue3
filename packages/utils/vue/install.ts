/**
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

import { App, Plugin } from 'vue';

export interface OriginComponent {
  name: string;
  install?: Plugin;
}

export const withInstall = <T extends OriginComponent>(
  component: T) => {
  component.install = function (app: App, { prefix } = {}) {
    const pre = app.config.globalProperties.bkUIPrefix || prefix || 'Bk';
    app.component(pre + component.name, component);
  };
  return component as typeof component & Plugin;
};

export const withInstallProps = <T extends OriginComponent, K extends Record<string, unknown>>(
  component: T,
  childComponents: K,
  isProps = false) => {
  component.install = function (app: App, { prefix } = {}) {
    const pre = app.config.globalProperties.bkUIPrefix || prefix || 'Bk';
    app.component(pre + component.name, component);
    !isProps && Object.values(childComponents).forEach((child: any) => {
      app.component(pre + child.name, child);
    });
  };
  Object.keys(childComponents).forEach((key) => {
    component[key] = childComponents[key];
  });
  return component as typeof component & Plugin & Readonly<typeof childComponents>;
};
