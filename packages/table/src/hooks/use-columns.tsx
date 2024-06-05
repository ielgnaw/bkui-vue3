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
import { v4 as uuidv4 } from 'uuid';
import { computed, isRef, reactive, ref, watch } from 'vue';

import { useLocale } from '@bkui-vue/config-provider';

import { COL_MIN_WIDTH, COLUMN_ATTRIBUTE, IEmptyObject } from '../const';
import { Column, IColSortBehavior, IFilterShape, Settings, TablePropTypes } from '../props';
import {
  getRowText,
  isColumnHidden,
  resolveColumnFilterProp,
  resolveColumnSortProp,
  resolveColumnSpan,
  resolvePropVal,
} from '../utils';

const useColumns = (props: TablePropTypes) => {
  const t = useLocale('table');
  const tableColumnSchema = reactive(new WeakMap());
  const tableColumnList = reactive([]);
  const uuid = uuidv4();
  const sortColumns = reactive([]);
  const filterColumns = reactive([]);

  /**
   * 用来记录列的排序状态
   * @param col
   * @param sortOption
   * @returns
   */
  const setSortColumns = (col: Column, sortOption = {}) => {
    sortColumns.forEach(item => (item.active = false));
    const target = sortColumns.find(item => item.col === col);
    if (target) {
      Object.assign(target, sortOption, { active: true });
      return;
    }

    sortColumns.push({ col, ...sortOption, active: true });
  };

  /**
   * 用来记录列的过滤状态
   * @param col
   * @param filterOption
   * @returns
   */
  const setFilterColumns = (col: Column, filterOption = {}) => {
    const target = filterColumns.find(item => item.col === col);
    if (target) {
      Object.assign(target, filterOption);
      return;
    }

    filterColumns.push({ col, ...filterOption });
  };

  const visibleColumns = reactive([]);
  const setVisibleColumns = () => {
    visibleColumns.length = 0;
    visibleColumns.push(...tableColumnList.filter(col => !isHiddenColumn(col)));
  };

  const headHeight = computed(() => {
    if (props.showHead) {
      return props.headHeight;
    }

    return 0;
  });

  const resolveDraggableColumn = () => {
    if (props.rowDraggable) {
      tableColumnList.unshift({
        minWidth: 50,
        width: props.rowDraggable?.width ?? 60,
        label: props.rowDraggable?.label ?? t.value.sort,
        type: 'drag',
      });
    }
  };

  /**
   * 判定是否需要合并行或者列配置
   */
  const neepColspanOrRowspan = (attrs = ['rowspan', 'colspan']) =>
    tableColumnList.some(col => attrs.some(name => typeof col[name] === 'function' || /^\d$/.test(`${col[name]}`)));

  const needColSpan = computed(() => neepColspanOrRowspan(['colspan']));
  const needRowSpan = computed(() => neepColspanOrRowspan(['rowspan']));

  const getColumnSpanConfig = (col: Column, index: number, skipColNum: number) => {
    let skipColumnNum = skipColNum;
    const colspan = resolveColumnSpan(col, index, null, null, 'colspan');
    const target = {
      skipCol: false,
      skipColLen: 0,
    };

    if (skipColumnNum > 0) {
      target.skipColLen = skipColumnNum;
      target.skipCol = true;
      skipColumnNum = skipColumnNum - 1;
    }

    if (colspan > 1) {
      target.skipColLen = colspan;
      skipColumnNum = colspan - 1;
    }

    return { ...target, skipColumnNum };
  };

  const resolveMinWidth = (col: Column) => {
    if (/^\d+/.test(`${col.minWidth}`)) {
      return col.minWidth;
    }

    let minWidth = COL_MIN_WIDTH;
    if (col.sort) {
      minWidth = minWidth + 18;
    }

    if (col.filter) {
      minWidth = minWidth + 28;
    }
    return minWidth;
  };

  const resolveEventListener = (col: Column) => {
    const listeners = getColumnAttribute(col, COLUMN_ATTRIBUTE.LISTENERS) as Map<string, any>;

    if (!listeners) {
      return {};
    }

    return Array.from(listeners?.keys()).reduce((handle: any, key: string) => {
      const eventName = key.split('_').slice(-1)[0];
      return Object.assign(handle, {
        [eventName]: (e: MouseEvent) => {
          listeners.get(key).forEach((fn: Function) => Reflect.apply(fn, this, [e, col]));
        },
      });
    }, {});
  };

  const resolveFilterFn = (col: Column) => {
    if (!col.filter) {
      return null;
    }

    const getRegExp = (val: string | number | boolean, flags = 'ig') =>
      new RegExp(`${val}`.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'), flags);

    const defaultFilterFn = (checked: string[], row: any) => {
      const { match } = col.filter as IFilterShape;
      const matchText = getRowText(row, resolvePropVal(col, 'field', [col, row]));
      if (match !== 'fuzzy') {
        return checked.includes(matchText);
      }

      return checked.some((str: string) => getRegExp(str, 'img').test(matchText));
    };

    const filterFn =
      typeof (col.filter as IFilterShape).filterFn === 'function'
        ? // eslint-disable-next-line max-len
          (checked: string[], row: any, index: number, data: any[]) =>
            (col.filter as IFilterShape).filterFn(checked, row, col, index, data)
        : (checked: string[], row: any) => (checked.length ? defaultFilterFn(checked, row) : true);

    return filterFn;
  };

  /**
   * Format columns
   * @param columns
   */
  const formatColumns = () => {
    resolveDraggableColumn();
    let skipColNum = 0;
    (tableColumnList || []).forEach((col, index) => {
      const { skipCol, skipColumnNum, skipColLen } = needColSpan.value
        ? getColumnSpanConfig(col, index, skipColNum)
        : { skipCol: false, skipColumnNum: 0, skipColLen: 0 };

      skipColNum = skipColumnNum;
      if (!tableColumnSchema.has(col)) {
        const { type, fn, scope, active, enabled } = resolveColumnSortProp(col, props);
        const filterFn = resolveFilterFn(col);
        const settings = (props.settings ?? {}) as Settings;
        const filterObj = resolveColumnFilterProp(col);

        if (filterObj.enabled) {
          setFilterColumns(col, {
            [COLUMN_ATTRIBUTE.COL_FILTER_FN]: filterFn,
            [COLUMN_ATTRIBUTE.COL_FILTER_VALUES]: filterObj.checked ?? [],
          });
        }

        if (enabled) {
          setSortColumns(col, {
            [COLUMN_ATTRIBUTE.COL_SORT_TYPE]: type,
            [COLUMN_ATTRIBUTE.COL_SORT_FN]: fn,
            [COLUMN_ATTRIBUTE.COL_SORT_SCOPE]: scope,
          });
        }

        tableColumnSchema.set(col, {
          [COLUMN_ATTRIBUTE.CALC_WIDTH]: undefined,
          [COLUMN_ATTRIBUTE.RESIZE_WIDTH]: undefined,
          [COLUMN_ATTRIBUTE.COL_RECT]: reactive({
            width: null,
            left: null,
            right: null,
            height: null,
          }),
          [COLUMN_ATTRIBUTE.COL_MIN_WIDTH]: resolveMinWidth(col),
          [COLUMN_ATTRIBUTE.LISTENERS]: new Map(),
          [COLUMN_ATTRIBUTE.WIDTH]: col.width,
          [COLUMN_ATTRIBUTE.IS_HIDDEN]: isColumnHidden(settings.fields ?? [], col, settings.checked ?? []),
          [COLUMN_ATTRIBUTE.COL_SORT_TYPE]: ref(type),
          [COLUMN_ATTRIBUTE.COL_SORT_FN]: fn,
          [COLUMN_ATTRIBUTE.COL_FILTER_OBJ]: filterObj,
          [COLUMN_ATTRIBUTE.COL_FILTER_FN]: filterFn,
          [COLUMN_ATTRIBUTE.COL_FILTER_SCOPE]: undefined,
          [COLUMN_ATTRIBUTE.COL_SORT_SCOPE]: scope,
          [COLUMN_ATTRIBUTE.COL_SORT_ACTIVE]: ref(active),
          [COLUMN_ATTRIBUTE.COL_IS_DRAG]: false,
          [COLUMN_ATTRIBUTE.COL_SPAN]: { skipCol, skipColumnNum, skipColLen },
          [COLUMN_ATTRIBUTE.COL_UID]: uuidv4(),
          [COLUMN_ATTRIBUTE.SELECTION_DISABLED]: false,
          [COLUMN_ATTRIBUTE.SELECTION_INDETERMINATE]: false,
          [COLUMN_ATTRIBUTE.SELECTION_VAL]: false,
          [COLUMN_ATTRIBUTE.COL_RESIZEABLE]: col.resizable !== false,
          [COLUMN_ATTRIBUTE.COL_FIXED_STYLE]: reactive({}),
        });
      }

      Object.assign(tableColumnSchema.get(col), {
        [COLUMN_ATTRIBUTE.COL_SPAN]: { skipCol, skipColumnNum, skipColLen },
        [COLUMN_ATTRIBUTE.COL_MIN_WIDTH]: resolveMinWidth(col),
      });
    });
  };

  const setFixedStyle = (column: Column, style: any) => {
    setColumnAttribute(column, COLUMN_ATTRIBUTE.COL_FIXED_STYLE, style);
  };

  const getFixedStlye = (column: Column) => {
    return getColumnAttribute(column, COLUMN_ATTRIBUTE.COL_FIXED_STYLE) ?? {};
  };

  const getColumnRect = (column: Column) => {
    return getColumnAttribute(column, COLUMN_ATTRIBUTE.COL_RECT);
  };

  type ColumnRect = { left?: number; right?: number; width?: number; height?: number };
  const setColumnRect = (col, { left, right, width, height }: ColumnRect) => {
    const source = getColumnRect(col);
    const target = {
      left: left ?? source.left,
      right: right ?? source.right,
      width: width ?? source.width,
      height: height ?? source.height,
    };
    setColumnAttribute(col, COLUMN_ATTRIBUTE.COL_RECT, target);
  };

  const debounceUpdateColumns = debounce(columns => {
    tableColumnList.length = 0;
    tableColumnList.push(...columns);
    formatColumns();

    setVisibleColumns();
  });

  const setColumnIsHidden = (column: Column, value = false) => {
    setColumnAttribute(column, COLUMN_ATTRIBUTE.IS_HIDDEN, value);
  };

  const setColumnResizeWidth = (column: Column, value: number) => {
    setColumnAttribute(column, COLUMN_ATTRIBUTE.RESIZE_WIDTH, value);
  };

  const setColumnSortOption = (column: Column, option: Record<string, any>) => {
    const { type, fn, scope, active } = option;
    const target = {
      [COLUMN_ATTRIBUTE.COL_SORT_TYPE]: type,
      [COLUMN_ATTRIBUTE.COL_SORT_FN]: fn,
      [COLUMN_ATTRIBUTE.COL_SORT_ACTIVE]: active,
      [COLUMN_ATTRIBUTE.COL_SORT_SCOPE]: scope,
    };

    [
      COLUMN_ATTRIBUTE.COL_SORT_TYPE,
      COLUMN_ATTRIBUTE.COL_SORT_FN,
      COLUMN_ATTRIBUTE.COL_SORT_ACTIVE,
      COLUMN_ATTRIBUTE.COL_SORT_SCOPE,
    ].forEach(name => {
      if (target[name] !== undefined) {
        setColumnAttribute(column, name, target[name]);
      }
    });
  };

  const setColumnFilterOption = (column: Column, option: Record<string, any>) => {
    if (tableColumnSchema.has(column)) {
      Object.assign(tableColumnSchema.get(column)[COLUMN_ATTRIBUTE.COL_FILTER_OBJ], option);
    }
  };

  const ORDER_LIST = [COLUMN_ATTRIBUTE.RESIZE_WIDTH, COLUMN_ATTRIBUTE.CALC_WIDTH, COLUMN_ATTRIBUTE.WIDTH];

  /**
   * 获取当前列实际宽度
   * width props中设置的默认宽度
   * calcWidth 计算后的宽度
   * resizeWidth 拖拽重置之后的宽度
   * @param colmun 当前列配置
   * @param orders 获取宽度顺序
   * @returns
   */
  const getColumnOrderWidth = (col: Column, orders = ORDER_LIST): number => {
    return (
      getColumnAttribute(col, orders[0]) ?? getColumnAttribute(col, orders[1]) ?? getColumnAttribute(col, orders[2])
    );
  };

  /**
   * 指定列是否展示状态
   * @param col
   */
  const isHiddenColumn = (col: Column) => {
    return getColumnAttribute(col, COLUMN_ATTRIBUTE.IS_HIDDEN) ?? false;
  };

  /**
   * 获取列所在ID
   * @param col
   */
  const getColumnId = (col: Column) => {
    return getColumnAttribute(col, COLUMN_ATTRIBUTE.COL_UID);
  };

  const beforeAttributeChange = (column: Column, attrName: string, attrValue: any) => {
    const sortAttrs = [COLUMN_ATTRIBUTE.COL_SORT_FN, COLUMN_ATTRIBUTE.COL_SORT_SCOPE, COLUMN_ATTRIBUTE.COL_SORT_TYPE];
    if (sortAttrs.includes(attrName)) {
      setSortColumns(column, { [attrName]: attrValue });
    }

    const filterAttrs = [COLUMN_ATTRIBUTE.COL_FILTER_FN, COLUMN_ATTRIBUTE.COL_FILTER_VALUES];
    if (filterAttrs.includes(attrName)) {
      setFilterColumns(column, { [attrName]: attrValue });
    }
  };

  /**
   * 设置表格列属性
   * @param col 当前列
   * @param attrName 设置属性
   * @param attrValue 属性值
   */
  const setColumnAttribute = (
    col: Column,
    attrName: string,
    attrValue:
      | ((...args) => boolean | number | void | string)
      | string
      | boolean
      | number
      | any[]
      | Record<string, any>,
  ) => {
    beforeAttributeChange(col, attrName, attrValue);
    const target = tableColumnSchema.get(col);
    if (target && Object.prototype.hasOwnProperty.call(target, attrName)) {
      if (isRef(target[attrName])) {
        target[attrName].value = attrValue;
        return;
      }

      target[attrName] = attrValue;
    }
  };

  const setColumnAttributeBySettings = (settings: any, checkedVal?: string[]) => {
    const checked = checkedVal || settings.checked || [];
    const settingFields = settings.fields || [];

    tableColumnList.forEach(col => {
      setColumnAttribute(col, COLUMN_ATTRIBUTE.IS_HIDDEN, isColumnHidden(settingFields, col, checked));
    });
  };

  /**
   * 获取列配置属性值
   * @param col
   * @param attributeName
   */
  const getColumnAttribute = (col: Column | IEmptyObject, attributeName: string) => {
    const target = tableColumnSchema.get(col)?.[attributeName];
    if (isRef(target)) {
      return target.value;
    }

    return target;
  };

  const getColumnRefAttribute = (col: Column | IEmptyObject, attributeName: string) => {
    return tableColumnSchema.get(col)?.[attributeName];
  };

  const getColumnClass = (column: Column, colIndex: number) => ({
    [`${uuid}-column-${colIndex}`]: false,
    column_fixed: !!column.fixed,
    column_fixed_left: !!column.fixed,
    column_fixed_right: column.fixed === 'right',
  });

  const getHeadColumnClass = (column: Column, colIndex: number) => ({
    ...getColumnClass(column, colIndex),
  });

  /**
   * 获取用户自定义class
   * @param column
   * @param row
   * @private
   */
  const getColumnCustomClass = (column, row?: any) => {
    const rowClass = column.className;
    if (rowClass) {
      if (typeof rowClass === 'function') {
        return rowClass(row);
      }
      if (typeof rowClass === 'string') {
        return rowClass;
      }
    }
    return '';
  };

  /**
   * 设置指定列是否激活排序
   * @param column
   * @param active
   */
  const setColumnSortActive = (column: Column, active: boolean) => {
    if (props.colSortBehavior === IColSortBehavior.independent) {
      tableColumnList.forEach(col => {
        setColumnAttribute(col, COLUMN_ATTRIBUTE.COL_SORT_ACTIVE, false);
      });
    }
    setColumnAttribute(column, COLUMN_ATTRIBUTE.COL_SORT_ACTIVE, active);
  };

  watch(
    () => [props.columns],
    () => {
      debounceUpdateColumns(props.columns);
    },
    { immediate: true },
  );

  /**
   * 清理列排序
   * @param reset 是否重置表格数据
   */
  const clearColumnSort = () => {
    tableColumnList.forEach(col => {
      setColumnAttribute(col, COLUMN_ATTRIBUTE.COL_SORT_ACTIVE, false);
      setColumnAttribute(col, COLUMN_ATTRIBUTE.COL_FILTER_FN, undefined);
    });
  };

  return {
    needColSpan,
    needRowSpan,
    headHeight,
    tableColumnSchema,
    tableColumnList,
    visibleColumns,
    debounceUpdateColumns,
    sortColumns,
    filterColumns,
    clearColumnSort,
    formatColumns,
    isHiddenColumn,
    getColumnId,
    getColumnOrderWidth,
    getColumnAttribute,
    getHeadColumnClass,
    getColumnClass,
    getFixedStlye,
    getColumnRect,
    getColumnCustomClass,
    getColumnRefAttribute,
    resolveEventListener,
    setColumnIsHidden,
    setColumnResizeWidth,
    setColumnSortOption,
    setColumnFilterOption,
    setColumnAttributeBySettings,
    setColumnAttribute,
    setColumnSortActive,
    setFixedStyle,
    setColumnRect,
    setVisibleColumns,
  };
};

export type UseColumns = ReturnType<typeof useColumns>;
export default useColumns;
