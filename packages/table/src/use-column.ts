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
import { debounce } from 'lodash';
import { reactive, watch } from 'vue';

import { SORT_OPTION } from './const';
import useColumnTemplate from './plugins/use-column-template';
import { IColSortBehavior, ISortShape, TablePropTypes } from './props';

/**
 * 渲染column settings
 * @param props: TablePropTypes
 * @param targetColumns 解析之后的column配置（主要用来处理通过<bk-column>配置的数据结构）
 */
export default (props: TablePropTypes) => {
  const resolvedColumns = reactive(props.columns ?? []);
  const throttleUpdate = debounce(instance => {
    const { resolveColumns } = useColumnTemplate();

    resolvedColumns.length = 0;
    resolvedColumns.push(...resolveColumns(instance));
  });

  /**
   * 初始化Column配置
   * @param column 传入
   * @param remove 是否移除当前列
   */
  const initColumns = tableInstance => {
    throttleUpdate(tableInstance);
  };

  watch(
    () => [props.columns],
    () => {
      resolvedColumns.length = 0;
      resolvedColumns.push(...props.columns);
    },
  );

  const getColumns = () => {
    return resolvedColumns;
  };

  const getActiveColumn = () => {
    if (props.colSortBehavior === IColSortBehavior.independent) {
      const filters = [SORT_OPTION.ASC, SORT_OPTION.DESC];
      // @ts-ignore
      return getColumns().filter(col => filters.includes((col.sort as ISortShape)?.value))?.[0];
    }
    return null;
  };

  return {
    initColumns,
    getColumns,
    getActiveColumn,
    columns: resolvedColumns,
  };
};
