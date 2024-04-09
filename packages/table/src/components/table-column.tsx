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
import { defineComponent, ExtractPropTypes, inject, isVNode, reactive, ref, ssrUtils, unref } from 'vue';

import { PropTypes } from '@bkui-vue/shared';

import { BK_COLUMN_UPDATE_DEFINE, COL_MIN_WIDTH, PROVIDE_KEY_INIT_COL, PROVIDE_KEY_TB_CACHE } from '../const';
import {
  Column,
  columnType,
  fixedType,
  IFilterType,
  IOverflowTooltipPropType,
  ISortType,
  LabelFunctionStringType,
  RenderFunctionStringType,
  RowClassFunctionStringType,
  SpanFunctionStringType,
  StringNumberType,
  TableAlign,
} from '../props';

const TableColumnProp = {
  label: LabelFunctionStringType,
  field: LabelFunctionStringType,
  render: RenderFunctionStringType,
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  minWidth: StringNumberType(COL_MIN_WIDTH),
  columnKey: PropTypes.string.def(''),
  showOverflowTooltip: IOverflowTooltipPropType,
  type: columnType,
  resizable: PropTypes.bool.def(true),
  fixed: PropTypes.oneOfType([PropTypes.bool, fixedType]).def(false),
  sort: ISortType,
  filter: IFilterType,
  colspan: SpanFunctionStringType.def(1),
  rowspan: SpanFunctionStringType.def(1),
  align: TableAlign,
  className: RowClassFunctionStringType,
  prop: LabelFunctionStringType,
  index: PropTypes.number.def(undefined),
};

export type ITableColumn = Partial<ExtractPropTypes<typeof TableColumnProp>>;

export default defineComponent({
  name: 'TableColumn',
  props: TableColumnProp,
  setup(props: ITableColumn) {
    const initColumns = inject(PROVIDE_KEY_INIT_COL, (_col: Column | Column[], _rm = false) => {}, false);
    const bkTableCache = inject(PROVIDE_KEY_TB_CACHE, { queueStack: (_, fn) => fn?.() });
    const column = reactive(Object.assign({}, props, { field: props.prop || props.field }));
    const isIndexPropChanged = ref(false);
    const setIsIndexChanged = (val: boolean) => {
      isIndexPropChanged.value = val;
    };

    return {
      isIndexPropChanged,
      setIsIndexChanged,
      initColumns,
      bkTableCache,
      column,
    };
  },
  watch: {
    index: {
      handler() {
        this.setIsIndexChanged(!this.isIndexPropChanged);
      },
      deep: true,
    },
  },
  unmounted() {
    this.updateColumnDefine(true);
  },
  mounted() {
    this.updateColumnDefine();
  },
  updated() {
    if (this.isIndexPropChanged) {
      this.updateColumnDefineByParent();
      this.setIsIndexChanged(!this.isIndexPropChanged);
    }
  },
  methods: {
    updateColumnDefine(unmounted = false) {
      if (unmounted) {
        this.unmountColumn();
        return;
      }

      this.updateColumnDefineByParent();
    },
    copyProps(props: ITableColumn) {
      return Object.keys(props ?? {}).reduce((result, key) => {
        const target = key.replace(/-(\w)/g, (_, letter) => letter.toUpperCase());
        return Object.assign(result, { [target]: props[key] });
      }, {});
    },
    rsolveIndexedColumn() {
      // 如果是设置了Index，则先添加Index列，不做自动递归读取Column
      if (/\d+\.?\d*/.test(`${this.$props.index}`)) {
        const resolveProp: any = Object.assign({}, this.copyProps(this.$props), {
          field: this.$props.prop || this.$props.field,
          render: this.$slots.default,
        });
        this.initColumns(resolveProp);
        return false;
      }

      return true;
    },
    updateColumnDefineByParent() {
      if (!this.rsolveIndexedColumn()) {
        return;
      }
      const fn = () => {
        // @ts-ignore
        const selfVnode = (this as any)._;
        const getTableNode = root => {
          if (root === document.body || !root) {
            return null;
          }

          const parentVnode = root.parent;
          if (parentVnode.type?.name === 'Table') {
            return parentVnode.vnode;
          }
          return getTableNode(parentVnode);
        };

        const tableNode = getTableNode(selfVnode);
        if (!tableNode) {
          return;
        }

        const sortColumns = [];
        let index = 0;

        const resolveChildNode = node => {
          if (!node) {
            return null;
          }

          if (node.type?.name === 'TableColumn') {
            const resolveProp = Object.assign({ index }, this.copyProps(node.props), {
              field: node.props.prop || node.props.field,
              render: node.children?.default,
            });
            sortColumns.push(unref(resolveProp));
            index = index + 1;
            return null;
          }

          if (Array.isArray(node?.children)) {
            return node.children;
          }

          if (isVNode(node)) {
            if (!node?.children) {
              const instance = ssrUtils.renderComponentRoot(node);
              return instance?.children;
            }
            if (typeof node?.children === 'object') {
              return Object.keys(node.children).map(key => node.children[key]);
            }
          }

          if (typeof node === 'function') {
            return node();
          }

          return null;
        };

        const reduceColumns = nodes => {
          if (!Array.isArray(nodes)) {
            const children = resolveChildNode(nodes);
            if (children) {
              reduceColumns(children);
            }
            return;
          }

          nodes?.forEach((node: any) => reduceColumns(node));
        };
        reduceColumns(tableNode);

        this.initColumns(sortColumns);
      };

      if (typeof this.bkTableCache.queueStack === 'function') {
        this.bkTableCache.queueStack(BK_COLUMN_UPDATE_DEFINE, fn);
      }
    },
    unmountColumn() {
      const resolveProp = Object.assign({}, this.copyProps(this.$props), {
        field: this.$props.prop || this.$props.field,
        render: this.$slots.default,
      });
      this.initColumns(resolveProp as any, true);
    },
  },
  render() {
    return <>{this.$slots.default?.({ row: {} })}</>;
  },
});
