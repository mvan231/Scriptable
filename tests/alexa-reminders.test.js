// Tests for Alexa To Reminders Access.js
'use strict'

const {
  makeRequest, makeWebView, makeAlert, makeReminder, makeCalendar, makeFileManager,
} = require('./scriptable-mocks')

// ─── Pure logic extracted from the script ────────────────────────────────────

function formatTitle(value, withVar, withoutVar) {
  return value.split(' ').map(word => {
    if (word.toLowerCase() === withVar || word.toLowerCase() === withoutVar) {
      return word.toLowerCase()
    }
    return word.charAt(0).toUpperCase() + word.slice(1)
  }).join(' ')
}

// ─── Testable versions of script functions (using injected deps) ──────────────

function makeCheckIfUserIsAuthenticated(baseURL, requestFactory) {
  return async function checkIfUserIsAuthenticated() {
    try {
      const url = `${baseURL}/alexashoppinglists/api/getlistitems`
      const request = requestFactory(url)
      await request.load()
      const status = request.response.statusCode
      if (status >= 200 && status < 300) return true
      return false
    } catch (error) {
      return false
    }
  }
}

function makeMakeLogin(baseURL, signInKey, checkIfUserIsAuthenticated, webViewFactory) {
  return async function makeLogin() {
    const url = `${baseURL}`
    const webView = webViewFactory()
    try {
      await webView.loadURL(url)
      const html = await webView.getHTML()
      if (html.includes(signInKey)) {
        await webView.present(false)
        return await checkIfUserIsAuthenticated()
      }
      const apiAuthenticated = await checkIfUserIsAuthenticated()
      if (!apiAuthenticated) {
        await webView.present(false)
        return await checkIfUserIsAuthenticated()
      }
      return true
    } catch (error) {
      return false
    }
  }
}

function makeSynchronizeReminders(baseURL, reminderListName, withVar, withoutVar, calendarAPI, reminderAPI, requestFactory) {
  return async function synchronizeReminders() {
    const reminderCalendar = await calendarAPI.forRemindersByTitle(reminderListName)
    const url = `${baseURL}/alexashoppinglists/api/getlistitems`
    const deleteUrl = `${baseURL}/alexashoppinglists/api/deletelistitem`
    const json = await requestFactory(url).loadJSON()

    let listItems = []
    let shoppingListId = null

    for (const listId in json) {
      const list = json[listId]
      if (list.listInfo && list.listInfo.listType === 'SHOPPING_LIST') {
        listItems = list.listItems || []
        shoppingListId = listId
        break
      }
    }

    if (!shoppingListId) return { status: 'no_shopping_list' }
    if (listItems.length === 0) return { status: 'empty' }

    const processed = []
    const allReminders = await reminderAPI.all([reminderCalendar])
    for (const item of listItems) {
      if (!item.value) continue
      const reminderTitle = formatTitle(item.value, withVar, withoutVar)
      const incompleteReminders = allReminders.filter(r => !r.isCompleted)
      const reminderExists = incompleteReminders.some(r => r.title === reminderTitle)

      if (!reminderExists) {
        const reminder = new makeReminder.cls()
        reminder.title = reminderTitle
        reminder.calendar = reminderCalendar
        await reminder.save()
        processed.push({ title: reminderTitle, created: true })
      } else {
        processed.push({ title: reminderTitle, created: false })
      }

      const deleteReq = requestFactory(deleteUrl)
      deleteReq.method = 'DELETE'
      deleteReq.headers = { 'Content-Type': 'application/json' }
      deleteReq.body = JSON.stringify(item)
      try {
        await deleteReq.loadString()
      } catch (_) {}
    }
    return { status: 'ok', processed }
  }
}

module.exports = async function({ test, describe, assert }) {

  // ─── Title Formatting ──────────────────────────────────────────────────────

  await describe('formatTitle', async () => {
    test('capitalizes the first letter of each word', () => {
      assert.equal(formatTitle('milk eggs bread', 'with', 'without'), 'Milk Eggs Bread')
    })

    test('handles single word', () => {
      assert.equal(formatTitle('apples', 'with', 'without'), 'Apples')
    })

    test('lowercases "with" regardless of casing', () => {
      assert.equal(formatTitle('pasta WITH sauce', 'with', 'without'), 'Pasta with Sauce')
    })

    test('lowercases "without" regardless of casing', () => {
      assert.equal(formatTitle('coffee WITHOUT sugar', 'with', 'without'), 'Coffee without Sugar')
    })

    test('handles already-capitalized words', () => {
      assert.equal(formatTitle('ORANGE JUICE', 'with', 'without'), 'ORANGE JUICE')
    })

    test('preserves remaining characters after first letter', () => {
      assert.equal(formatTitle('organic milk', 'with', 'without'), 'Organic Milk')
    })

    test('handles empty string gracefully', () => {
      assert.equal(formatTitle('', 'with', 'without'), '')
    })
  })

  // ─── checkIfUserIsAuthenticated ────────────────────────────────────────────

  await describe('checkIfUserIsAuthenticated', async () => {
    test('returns true when server responds with 200', async () => {
      const req = makeRequest({ response: { statusCode: 200 } })
      const check = makeCheckIfUserIsAuthenticated('https://amazon.com', () => req)
      assert.equal(await check(), true)
    })

    test('returns false when server responds with 401', async () => {
      const req = makeRequest({ response: { statusCode: 401 } })
      const check = makeCheckIfUserIsAuthenticated('https://amazon.com', () => req)
      assert.equal(await check(), false)
    })

    test('returns false when server responds with 403', async () => {
      const req = makeRequest({ response: { statusCode: 403 } })
      const check = makeCheckIfUserIsAuthenticated('https://amazon.com', () => req)
      assert.equal(await check(), false)
    })

    test('returns false on network error', async () => {
      const req = makeRequest({
        load: async () => { throw new Error('Network failure') },
        response: { statusCode: 0 },
      })
      const check = makeCheckIfUserIsAuthenticated('https://amazon.com', () => req)
      assert.equal(await check(), false)
    })

    test('builds the correct API URL', async () => {
      let capturedUrl = null
      const check = makeCheckIfUserIsAuthenticated('https://www.amazon.co.uk', (url) => {
        capturedUrl = url
        return makeRequest({ response: { statusCode: 200 } })
      })
      await check()
      assert.equal(capturedUrl, 'https://www.amazon.co.uk/alexashoppinglists/api/getlistitems')
    })

    test('returns false when server responds with 500', async () => {
      const req = makeRequest({ response: { statusCode: 500 } })
      const check = makeCheckIfUserIsAuthenticated('https://amazon.com', () => req)
      assert.equal(await check(), false)
    })

    test('returns false when server responds with 302 redirect', async () => {
      const req = makeRequest({ response: { statusCode: 302 } })
      const check = makeCheckIfUserIsAuthenticated('https://amazon.com', () => req)
      assert.equal(await check(), false)
    })
  })

  // ─── makeLogin ─────────────────────────────────────────────────────────────

  await describe('makeLogin', async () => {
    test('returns true when sign-in indicator absent and API confirms authenticated', async () => {
      const wv = makeWebView({ getHTML: async () => 'Welcome back, User!' })
      const check = async () => true
      const login = makeMakeLogin('https://amazon.com', 'Sign in', check, () => wv)
      assert.equal(await login(), true)
    })

    test('presents fallback WebView when sign-in indicator absent but API returns 401', async () => {
      let presented = false
      const wv = makeWebView({
        getHTML: async () => 'Welcome back, User!',
        present: async () => { presented = true },
      })
      let callCount = 0
      const check = async () => { callCount++; return false }
      const login = makeMakeLogin('https://amazon.com', 'Sign in', check, () => wv)
      const result = await login()
      assert.equal(presented, true)
      assert.equal(result, false)
      assert.equal(callCount, 2) // checked before and after fallback WebView
    })

    test('presents WebView when sign-in key is detected', async () => {
      let presented = false
      const wv = makeWebView({
        getHTML: async () => 'Please Sign in to continue',
        present: async () => { presented = true },
      })
      const check = async () => true
      const login = makeMakeLogin('https://amazon.com', 'Sign in', check, () => wv)
      await login()
      assert.equal(presented, true)
    })

    test('returns result of checkIfUserIsAuthenticated after WebView login succeeds', async () => {
      const wv = makeWebView({ getHTML: async () => 'Sign in here' })
      const check = async () => true
      const login = makeMakeLogin('https://amazon.com', 'Sign in', check, () => wv)
      assert.equal(await login(), true)
    })

    test('returns false when checkIfUserIsAuthenticated fails after login attempt', async () => {
      const wv = makeWebView({ getHTML: async () => 'Sign in here' })
      const check = async () => false
      const login = makeMakeLogin('https://amazon.com', 'Sign in', check, () => wv)
      assert.equal(await login(), false)
    })

    test('returns false on WebView load error', async () => {
      const wv = makeWebView({ loadURL: async () => { throw new Error('Cannot load') } })
      const check = async () => true
      const login = makeMakeLogin('https://amazon.com', 'Sign in', check, () => wv)
      assert.equal(await login(), false)
    })
  })

  // ─── synchronizeReminders ──────────────────────────────────────────────────

  // Stub Reminder class for injection
  makeReminder.cls = class {
    constructor() { this.title = ''; this.calendar = null; this.isCompleted = false }
    async save() { makeReminder.cls._saved.push(this) }
    static _saved = []
    static reset() { makeReminder.cls._saved = [] }
  }

  const baseConfig = {
    baseURL: 'https://amazon.com',
    reminderListName: 'Grocery and Shopping',
    withVar: 'with',
    withoutVar: 'without',
    calendarAPI: { forRemindersByTitle: async () => makeCalendar() },
    reminderAPI: { all: async () => [] },
  }

  function buildSync(overrides = {}) {
    const cfg = { ...baseConfig, ...overrides }
    return makeSynchronizeReminders(
      cfg.baseURL, cfg.reminderListName, cfg.withVar, cfg.withoutVar,
      cfg.calendarAPI, cfg.reminderAPI, cfg.requestFactory || (() => makeRequest())
    )
  }

  await describe('synchronizeReminders', async () => {
    test('returns "no_shopping_list" when no SHOPPING_LIST exists in response', async () => {
      makeReminder.cls.reset()
      const sync = buildSync({
        requestFactory: () => makeRequest({ loadJSON: async () => ({
          list1: { listInfo: { listType: 'TODO' }, listItems: [] },
        }) }),
      })
      const result = await sync()
      assert.equal(result.status, 'no_shopping_list')
    })

    test('returns "empty" when SHOPPING_LIST has no items', async () => {
      makeReminder.cls.reset()
      const sync = buildSync({
        requestFactory: () => makeRequest({ loadJSON: async () => ({
          list1: { listInfo: { listType: 'SHOPPING_LIST' }, listItems: [] },
        }) }),
      })
      const result = await sync()
      assert.equal(result.status, 'empty')
    })

    test('creates reminders for new items', async () => {
      makeReminder.cls.reset()
      const sync = buildSync({
        reminderAPI: { all: async () => [] },
        requestFactory: () => makeRequest({
          loadJSON: async () => ({
            list1: {
              listInfo: { listType: 'SHOPPING_LIST' },
              listItems: [
                { value: 'milk' },
                { value: 'eggs' },
              ],
            },
          }),
          loadString: async () => 'ok',
        }),
      })
      const result = await sync()
      assert.equal(result.status, 'ok')
      assert.equal(result.processed.filter(p => p.created).length, 2)
      assert.equal(makeReminder.cls._saved.length, 2)
    })

    test('skips creating reminder when one already exists with same title', async () => {
      makeReminder.cls.reset()
      const existingReminder = { title: 'Milk', isCompleted: false }
      const sync = buildSync({
        reminderAPI: { all: async () => [existingReminder] },
        requestFactory: () => makeRequest({
          loadJSON: async () => ({
            list1: {
              listInfo: { listType: 'SHOPPING_LIST' },
              listItems: [{ value: 'milk' }],
            },
          }),
          loadString: async () => 'ok',
        }),
      })
      const result = await sync()
      assert.equal(result.processed[0].created, false)
      assert.equal(makeReminder.cls._saved.length, 0)
    })

    test('completed reminders do not count as existing', async () => {
      makeReminder.cls.reset()
      const completedReminder = { title: 'Milk', isCompleted: true }
      const sync = buildSync({
        reminderAPI: { all: async () => [completedReminder] },
        requestFactory: () => makeRequest({
          loadJSON: async () => ({
            list1: {
              listInfo: { listType: 'SHOPPING_LIST' },
              listItems: [{ value: 'milk' }],
            },
          }),
          loadString: async () => 'ok',
        }),
      })
      const result = await sync()
      assert.equal(result.processed[0].created, true)
    })

    test('capitalizes reminder title correctly', async () => {
      makeReminder.cls.reset()
      const sync = buildSync({
        reminderAPI: { all: async () => [] },
        requestFactory: () => makeRequest({
          loadJSON: async () => ({
            list1: {
              listInfo: { listType: 'SHOPPING_LIST' },
              listItems: [{ value: 'orange juice with pulp' }],
            },
          }),
          loadString: async () => 'ok',
        }),
      })
      await sync()
      assert.equal(makeReminder.cls._saved[0].title, 'Orange Juice with Pulp')
    })

    test('continues processing remaining items when delete fails for one', async () => {
      makeReminder.cls.reset()
      let deleteCallCount = 0
      const sync = buildSync({
        reminderAPI: { all: async () => [] },
        requestFactory: (url) => {
          if (url.includes('getlistitems')) {
            return makeRequest({ loadJSON: async () => ({
              list1: {
                listInfo: { listType: 'SHOPPING_LIST' },
                listItems: [{ value: 'milk' }, { value: 'eggs' }],
              },
            }) })
          }
          return makeRequest({ loadString: async () => {
            deleteCallCount++
            if (deleteCallCount === 1) throw new Error('Delete failed')
            return 'ok'
          } })
        },
      })
      const result = await sync()
      assert.equal(result.status, 'ok')
      assert.equal(result.processed.length, 2)
      assert.equal(deleteCallCount, 2) // both deletes were attempted
    })

    test('skips items with null or missing value without crashing', async () => {
      makeReminder.cls.reset()
      const sync = buildSync({
        reminderAPI: { all: async () => [] },
        requestFactory: () => makeRequest({
          loadJSON: async () => ({
            list1: {
              listInfo: { listType: 'SHOPPING_LIST' },
              listItems: [{ value: null }, { value: 'milk' }],
            },
          }),
          loadString: async () => 'ok',
        }),
      })
      const result = await sync()
      assert.equal(result.status, 'ok')
      assert.equal(result.processed.length, 1)
      assert.equal(result.processed[0].title, 'Milk')
    })

    test('finds SHOPPING_LIST correctly when multiple list types present', async () => {
      makeReminder.cls.reset()
      const sync = buildSync({
        reminderAPI: { all: async () => [] },
        requestFactory: () => makeRequest({
          loadJSON: async () => ({
            todoList: { listInfo: { listType: 'TODO' }, listItems: [{ value: 'call dentist' }] },
            shopList: { listInfo: { listType: 'SHOPPING_LIST' }, listItems: [{ value: 'butter' }] },
          }),
          loadString: async () => 'ok',
        }),
      })
      const result = await sync()
      assert.equal(result.processed.length, 1)
      assert.equal(makeReminder.cls._saved[0].title, 'Butter')
    })
  })

  // ─── JSON response type validation ────────────────────────────────────────

  await describe('JSON response type validation', async () => {
    function isValidListResponse(json) {
      return typeof json === 'object' && json !== null && !Array.isArray(json)
    }

    test('accepts a plain object', () => {
      assert.equal(isValidListResponse({ list1: {} }), true)
    })

    test('rejects a JSON string (Amazon session error message)', () => {
      assert.equal(isValidListResponse("Not authenticated"), false)
    })

    test('rejects null', () => {
      assert.equal(isValidListResponse(null), false)
    })

    test('rejects an array', () => {
      assert.equal(isValidListResponse([1, 2, 3]), false)
    })

    test('rejects a number', () => {
      assert.equal(isValidListResponse(42), false)
    })
  })

  // ─── settings persistence ─────────────────────────────────────────────────

  await describe('settings persistence', async () => {
    test('saves selected reminderListName to settings file', () => {
      const fm = makeFileManager()
      const settingsPath = '/mock/documents/AlexaToReminders/settings.json'
      const settings = {}
      settings.reminderListName = 'Grocery'
      fm.writeString(settingsPath, JSON.stringify(settings))
      const loaded = JSON.parse(fm.readString(settingsPath))
      assert.equal(loaded.reminderListName, 'Grocery')
    })

    test('loads reminderListName from settings when present', () => {
      const fm = makeFileManager({
        '/mock/documents/AlexaToReminders/settings.json': JSON.stringify({ reminderListName: 'My List' })
      })
      const settingsPath = '/mock/documents/AlexaToReminders/settings.json'
      let reminderListName = 'Shopping'
      if (fm.fileExists(settingsPath)) {
        const s = JSON.parse(fm.readString(settingsPath))
        if (s.reminderListName) reminderListName = s.reminderListName
      }
      assert.equal(reminderListName, 'My List')
    })

    test('falls back to default reminderListName when settings file absent', () => {
      const fm = makeFileManager()
      const settingsPath = '/mock/documents/AlexaToReminders/settings.json'
      let reminderListName = 'Shopping'
      if (fm.fileExists(settingsPath)) {
        const s = JSON.parse(fm.readString(settingsPath))
        if (s.reminderListName) reminderListName = s.reminderListName
      }
      assert.equal(reminderListName, 'Shopping')
    })

    test('preserves existing settings keys when saving reminderListName', () => {
      const fm = makeFileManager({
        '/mock/documents/AlexaToReminders/settings.json': JSON.stringify({ someOtherKey: true })
      })
      const settingsPath = '/mock/documents/AlexaToReminders/settings.json'
      const settings = JSON.parse(fm.readString(settingsPath))
      settings.reminderListName = 'Groceries'
      fm.writeString(settingsPath, JSON.stringify(settings))
      const loaded = JSON.parse(fm.readString(settingsPath))
      assert.equal(loaded.reminderListName, 'Groceries')
      assert.equal(loaded.someOtherKey, true)
    })
  })

  // ─── main orchestration ────────────────────────────────────────────────────

  await describe('main flow', async () => {
    test('calls synchronize directly when already authenticated', async () => {
      let syncCalled = false
      const check = async () => true
      const login = async () => true
      const sync = async () => { syncCalled = true }

      async function main() {
        const isAuthenticated = await check()
        if (!isAuthenticated) {
          const loggedIn = await login()
          if (!loggedIn) return
        }
        await sync()
      }

      await main()
      assert.equal(syncCalled, true)
    })

    test('calls login then sync when not authenticated but login succeeds', async () => {
      let loginCalled = false, syncCalled = false
      const check = async () => false
      const login = async () => { loginCalled = true; return true }
      const sync = async () => { syncCalled = true }

      async function main() {
        const isAuthenticated = await check()
        if (!isAuthenticated) {
          const loggedIn = await login()
          if (!loggedIn) return
        }
        await sync()
      }

      await main()
      assert.equal(loginCalled, true)
      assert.equal(syncCalled, true)
    })

    test('exits without syncing when not authenticated and login fails', async () => {
      let syncCalled = false
      const check = async () => false
      const login = async () => false
      const sync = async () => { syncCalled = true }

      async function main() {
        const isAuthenticated = await check()
        if (!isAuthenticated) {
          const loggedIn = await login()
          if (!loggedIn) return
        }
        await sync()
      }

      await main()
      assert.equal(syncCalled, false)
    })
  })
}
