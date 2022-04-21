import { icon } from 'assets/icon'

export default {
  name: 'mdi-js',
  type: {
    positive: icon.mdiCheckCircle,
    negative: icon.mdiAlert,
    info: icon.mdiInformation,
    warning: icon.mdiExclamation
  },
  arrow: {
    up: icon.mdiArrowUp,
    right: icon.mdiArrowRight,
    down: icon.mdiArrowDown,
    left: icon.mdiArrowLeft,
    dropdown: icon.mdiMenuDown
  },
  chevron: {
    left: icon.mdiArrowLeft,
    right: icon.mdiArrowRight
  },
  colorPicker: {
    spectrum: icon.mdiGradientVertical,
    tune: icon.mdiTune,
    palette: icon.mdiPalette
  },
  pullToRefresh: {
    icon: icon.mdiRefresh
  },
  carousel: {
    left: icon.mdiArrowLeft,
    right: icon.mdiArrowRight,
    up: icon.mdiChevronUp,
    down: icon.mdiChevronDown,
    navigationIcon: 'mdi-circle'
  },
  chip: {
    remove: 'mdi-close-circle',
    selected: 'mdi-check'
  },
  datetime: {
    arrowLeft: icon.mdiArrowLeft,
    arrowRight: icon.mdiArrowRight,
    now: 'mdi-clock-outline',
    today: 'mdi-calendar-today'
  },
  editor: {
    bold: icon.mdiFormatBold,
    italic: icon.mdiFormatItalic,
    strikethrough: icon.mdiFormatStrikethrough,
    underline: icon.mdiFormatUnderline,
    unorderedList: icon.mdiFormatListBulleted,
    orderedList: icon.mdiFormatListNumbered,
    subscript: icon.mdiFormatSubscript,
    superscript: icon.mdiFormatSuperscript,
    hyperlink: icon.mdiLink,
    toggleFullscreen: icon.mdiFullscreen,
    quote: icon.mdiFormatQuoteClose,
    left: icon.mdiFormatAlignLeft,
    center: icon.mdiFormatAlignCenter,
    right: icon.mdiFormatAlignRight,
    justify: icon.mdiFormatAlignJustify,
    print: icon.mdiPrinter,
    outdent: icon.mdiFormatIndentDecrease,
    indent: icon.mdiFormatIndentIncrease,
    removeFormat: icon.mdiFormatClear,
    formatting: icon.mdiFormatColorText,
    fontSize: icon.mdiFormatSize,
    align: icon.mdiFormatAlignLeft,
    hr: icon.mdiMinus,
    undo: icon.mdiUndo,
    redo: icon.mdiRedo,
    heading: icon.mdiFormatSize,
    heading1: icon.mdiFormatHeader1,
    heading2: icon.mdiFormatHeader2,
    heading3: icon.mdiFormatHeader3,
    heading4: icon.mdiFormatHeader4,
    heading5: icon.mdiFormatHeader5,
    heading6: icon.mdiFormatHeader6,
    code: icon.mdiCodeTags,
    size: icon.mdiFormatSize,
    size1: icon.mdiNumeric1Box,
    size2: icon.mdiNumeric2Box,
    size3: icon.mdiNumeric3Box,
    size4: icon.mdiNumeric4Box,
    size5: icon.mdiNumeric5Box,
    size6: icon.mdiNumeric6Box,
    size7: icon.mdiNumeric7Box,
    font: icon.mdiFormatFont,
    viewSource: icon.mdiCodeTags
  },
  expansionItem: {
    icon: icon.mdiChevronDown,
    denseIcon: icon.mdiMenuDown
  },
  fab: {
    icon: icon.mdiPlus,
    activeIcon: icon.mdiClose
  },
  field: {
    clear: icon.mdiCloseCircle,
    error: 'mdi-alert-circle'
  },
  pagination: {
    first: 'mdi-chevron-double-left',
    prev: icon.mdiArrowLeft,
    next: icon.mdiArrowRight,
    last: 'mdi-chevron-double-right'
  },
  rating: {
    icon: 'mdi-star'
  },
  stepper: {
    done: 'mdi-check',
    active: 'mdi-pencil',
    error: 'mdi-alert'
  },
  tabs: {
    left: icon.mdiArrowLeft,
    right: icon.mdiArrowRight,
    up: 'mdi-chevron-up',
    down: 'mdi-chevron-down'
  },
  table: {
    arrowUp: 'mdi-arrow-up',
    warning: 'mdi-alert',
    firstPage: 'mdi-chevron-double-left',
    prevPage: icon.mdiArrowLeft,
    nextPage: icon.mdiArrowRight,
    lastPage: 'mdi-chevron-double-right'
  },
  tree: {
    icon: 'mdi-play'
  },
  uploader: {
    done: icon.mdiCheck,
    clear: icon.mdiClose,
    add: icon.mdiPlusBox,
    upload: icon.mdiCloudUpload,
    removeQueue: icon.mdiNotificationClearAll,
    removeUploaded: icon.mdiCheckAll
  }
}
