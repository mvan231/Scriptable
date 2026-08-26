// Mocks for all Scriptable iOS APIs used across the widget scripts.
'use strict'

function makeRequest(overrides = {}) {
  return {
    _url: '',
    method: 'GET',
    headers: {},
    body: null,
    response: { statusCode: 200 },
    load: async function() { return Buffer.from('') },
    loadJSON: async function() { return {} },
    loadString: async function() { return '' },
    loadImage: async function() { return makeImage() },
    ...overrides,
  }
}

function makeImage() {
  return { _isMockImage: true }
}

function makeWebView(overrides = {}) {
  return {
    _loadedURL: null,
    _html: '',
    loadURL: async function(url) { this._loadedURL = url },
    loadHTML: async function(html) { this._html = html },
    getHTML: async function() { return this._html },
    waitForLoad: async function() {},
    present: async function() {},
    evaluateJavaScript: async function(js) { return '' },
    ...overrides,
  }
}

function makeAlert(overrides = {}) {
  return {
    title: '',
    message: '',
    _actions: [],
    _textFields: [],
    addAction: function(title) { this._actions.push({ title, destructive: false }) },
    addDestructiveAction: function(title) { this._actions.push({ title, destructive: true }) },
    addTextField: function(placeholder, value = '') { this._textFields.push({ placeholder, value }) },
    textFieldValue: function(i) { return this._textFields[i]?.value ?? '' },
    present: async function() { return 0 },
    presentSheet: async function() { return 0 },
    presentAlert: async function() { return 0 },
    ...overrides,
  }
}

function makeReminder(overrides = {}) {
  return {
    title: '',
    calendar: null,
    isCompleted: false,
    save: async function() {},
    ...overrides,
  }
}

function makeCalendar(title = 'Test List') {
  return { title, _isCalendar: true }
}

function makeFileManager(files = {}) {
  const store = { ...files }
  return {
    documentsDirectory: () => '/mock/documents',
    joinPath: (a, b) => `${a}/${b}`,
    fileExists: (path) => path in store,
    readString: (path) => store[path] ?? null,
    writeString: (path, content) => { store[path] = content },
    read: (path) => store[path] ? Buffer.from(store[path]) : null,
    write: (path, data) => { store[path] = data?.toString() ?? '' },
    readImage: (path) => store[path] ? makeImage() : null,
    writeImage: (path, img) => { store[path] = img },
    listContents: (path) => Object.keys(store)
      .filter(k => k.startsWith(path))
      .map(k => k.replace(path + '/', '').split('/')[0])
      .filter((v, i, a) => a.indexOf(v) === i),
    createDirectory: (path, intermediate) => {},
    fileExtension: (path) => path.includes('.') ? path.split('.').pop() : '',
    _store: store,
  }
}

function makeColor(hex, alpha = 1) {
  return { hex, alpha, _isMockColor: true }
}

function makeDrawContext() {
  return {
    size: null,
    opaque: false,
    respectScreenScale: false,
    setFont: () => {},
    setTextColor: () => {},
    setFillColor: () => {},
    setStrokeColor: () => {},
    setLineWidth: () => {},
    setTextAlignedCenter: () => {},
    setTextAlignedLeft: () => {},
    setTextAlignedRight: () => {},
    drawText: () => {},
    drawTextInRect: () => {},
    drawImageAtPoint: () => {},
    drawImageInRect: () => {},
    fillRect: () => {},
    fillEllipse: () => {},
    addPath: () => {},
    strokePath: () => {},
    fillPath: () => {},
    getImage: () => makeImage(),
  }
}

function makeListWidget() {
  const items = []
  return {
    _items: items,
    _padding: null,
    backgroundColor: null,
    backgroundImage: null,
    refreshAfterDate: null,
    url: null,
    addText: (text) => ({ text, font: null, textColor: null, textOpacity: 1, centerAlignText: () => {}, rightAlignText: () => {} }),
    addImage: (img) => ({ image: img, resizable: false, imageSize: null, tintColor: null, cornerRadius: 0, centerAlignImage: () => {}, imageOpacity: 1 }),
    addStack: () => makeStack(),
    addSpacer: (size) => {},
    addDate: (date) => ({ date, font: null, textColor: null, applyRelativeStyle: () => {} }),
    setPadding: (...args) => {},
    presentSmall: async () => {},
    presentMedium: async () => {},
    presentLarge: async () => {},
  }
}

function makeStack() {
  return {
    addText: (text) => ({ text, font: null, textColor: null, centerAlignText: () => {}, rightAlignText: () => {} }),
    addImage: (img) => ({ image: img, resizable: false, imageSize: null, tintColor: null, cornerRadius: 0, centerAlignImage: () => {}, imageOpacity: 1 }),
    addStack: () => makeStack(),
    addSpacer: () => {},
    addDate: (date) => ({ date, applyRelativeStyle: () => {} }),
    layoutHorizontally: () => {},
    layoutVertically: () => {},
    setPadding: () => {},
    size: null,
    url: null,
    backgroundColor: null,
  }
}

function makeScriptable() {
  return {
    setWidget: () => {},
    complete: () => {},
    name: () => 'MockScript',
  }
}

function makeConfig(overrides = {}) {
  return {
    runsInWidget: false,
    runsInApp: true,
    widgetFamily: 'medium',
    ...overrides,
  }
}

module.exports = {
  makeRequest,
  makeWebView,
  makeAlert,
  makeReminder,
  makeCalendar,
  makeFileManager,
  makeColor,
  makeDrawContext,
  makeListWidget,
  makeStack,
  makeScriptable,
  makeConfig,
  makeImage,
}
