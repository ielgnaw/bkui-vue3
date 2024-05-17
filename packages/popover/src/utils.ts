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
import { v4 as uuidv4 } from 'uuid';

const CachedConst: any = {};

export const isAvailableId = (query: string) => {
  const container = document.querySelector(query);
  return container instanceof HTMLElement;
};

export const getFullscreenUid = () => {
  if (!CachedConst.fullscreenReferId) {
    CachedConst.fullscreenReferId = `id_${uuidv4()}`;
  }

  return CachedConst.fullscreenReferId;
};

export const isElement = element => element instanceof Element || element instanceof HTMLDocument;

export const contentAsHTMLElement = content => {
  if (isElement(content)) {
    return {
      isElement: true,
      content,
      vNode: undefined,
    };
  }

  if (/^(#|\.)/.test(content)) {
    const target = document.querySelector(content);
    const isEle = isElement(target);
    return {
      isElement: isEle,
      content: isEle ? target : content,
      vNode: isEle ? undefined : content,
    };
  }

  return {
    isElement: false,
    content,
    vNode: content,
  };
};
