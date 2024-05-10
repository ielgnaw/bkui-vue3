Based on the open source project on GitHub [simplebar](https://github.com/Grsmto/simplebar), it has been modified.
```
  let instance: BkScrollbar = null;
  const { resolveClassName } = usePrefix();
  const classNames = {
    contentEl: resolveClassName('scrollbar-content-el'),
    wrapper: resolveClassName('scrollbar-wrapper'),
    scrollbar: resolveClassName('scrollbar'),
    track: resolveClassName('scrollbar-track'),
    visible: resolveClassName('scrollbar-visible'),
    horizontal: resolveClassName('scrollbar-horizontal'),
    vertical: resolveClassName('scrollbar-vertical'),
    hover: resolveClassName('scrollbar-hover'),
    dragging: resolveClassName('scrollbar-dragging'),
    scrolling: resolveClassName('scrollbar-scrolling'),
    scrollable: resolveClassName('scrollbar-scrollable'),
    mouseEntered: resolveClassName('scrollbar-mouse-entered'),
  };

instance = new BkScrollbar(target.value, {
    classNames,
    wrapperNode: target.value,
    useSystemScrollYBehavior: !props.enabled,
    useSystemScrollXBehavior: true,
    delegateXContent,
    delegateYContent,
    onScrollCallback: scrollFn,
  });
```

```
  static defaultOptions: Options = {
    forceVisible: false,
    clickOnTrack: true,
    scrollbarMinSize: 25,
    scrollbarMaxSize: 0,
    ariaLabel: 'scrollable content',
    classNames: {
      contentEl: 'bk-content',
      wrapper: 'bk-wrapper',
      scrollbar: 'bk-scrollbar',
      track: 'bk-track',
      visible: 'bk-visible',
      horizontal: 'bk-horizontal',
      vertical: 'bk-vertical',
      hover: 'bk-hover',
      dragging: 'bk-dragging',
      scrolling: 'bk-scrolling',
      scrollable: 'bk-scrollable',
      mouseEntered: 'bk-mouse-entered',
    },
    contentNode: null,
    wrapperNode: null,
    /**
     * 如果是自定义虚拟滚动，content可能是position absolute，此时需要一个实际支撑的元素
     */
    delegateXContent: null,
    delegateYContent: null,
    autoHide: true,
    /**
     * X轴或者Y轴是否启用默认的滚动条功能
     */
    useSystemScrollXBehavior: true,
    useSystemScrollYBehavior: true,
    onScrollCallback: null,
  };
```
