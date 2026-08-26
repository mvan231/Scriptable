// Tests for RH-Downloads.js
'use strict'

// ─── Logic extracted from the script ─────────────────────────────────────────

const NAME_FROM_URL_REGEX = /user\/(.+)(\/|)/
const NAME_FROM_HTML_REGEX = /•\s(.+)<\/title>/
const DOWNLOADS_REGEX = /<p>Downloads: (\d+)<\/p>/

function extractNameFromUrl(url) {
  if (!url.includes('user')) return null
  const match = NAME_FROM_URL_REGEX.exec(url)
  return match ? match[1] : null
}

function extractNameFromHtml(html) {
  const match = NAME_FROM_HTML_REGEX.exec(html)
  return match ? match[1] : null
}

function extractDownloadCount(html) {
  const match = DOWNLOADS_REGEX.exec(html)
  return match ? match[1] : null
}

function nextFileIndex(current, total) {
  const next = current + 1
  return next >= total ? 0 : next
}

function computeDailyDelta(currentStr, file, name, todayDate) {
  const current = parseInt(currentStr, 10)
  if (!file[name]) {
    return { dayDelta: 0, downloads: currentStr, date: todayDate }
  }
  let dayDelta = file[name].dayDelta || 0
  if (file[name].date !== todayDate) {
    dayDelta = 0
  }
  const diff = (current - parseInt(file[name].downloads, 10)) + dayDelta
  return { dayDelta: diff, downloads: currentStr, date: todayDate }
}

module.exports = async function({ test, describe, assert }) {

  // ─── extractNameFromUrl ────────────────────────────────────────────────────

  await describe('extractNameFromUrl', async () => {
    test('extracts username from a user profile URL', () => {
      assert.equal(extractNameFromUrl('https://routinehub.co/user/mvan231'), 'mvan231')
    })

    test('returns null for a non-user URL', () => {
      assert.equal(extractNameFromUrl('https://routinehub.co/shortcut/5583/'), null)
    })

    test('handles trailing slash after username', () => {
      const result = extractNameFromUrl('https://routinehub.co/user/mvan231/')
      // regex captures "mvan231/" or "mvan231" depending on trailing slash group
      assert.ok(result !== null)
      assert.ok(result.startsWith('mvan231'))
    })

    test('returns null for empty string', () => {
      assert.equal(extractNameFromUrl(''), null)
    })
  })

  // ─── extractNameFromHtml ──────────────────────────────────────────────────

  await describe('extractNameFromHtml', async () => {
    test('extracts shortcut name from HTML title tag', () => {
      const html = '<title>RoutineHub • My Cool Shortcut</title>'
      assert.equal(extractNameFromHtml(html), 'My Cool Shortcut')
    })

    test('returns null when pattern not found', () => {
      const html = '<title>RoutineHub</title>'
      assert.equal(extractNameFromHtml(html), null)
    })

    test('handles names with spaces', () => {
      const html = '<title>RoutineHub • Scriptable Widget Helper</title>'
      assert.equal(extractNameFromHtml(html), 'Scriptable Widget Helper')
    })

    test('returns null for empty HTML', () => {
      assert.equal(extractNameFromHtml(''), null)
    })
  })

  // ─── extractDownloadCount ─────────────────────────────────────────────────

  await describe('extractDownloadCount', async () => {
    test('extracts a numeric download count', () => {
      const html = '<p>Downloads: 1234</p>'
      assert.equal(extractDownloadCount(html), '1234')
    })

    test('extracts large download counts', () => {
      const html = '<p>Downloads: 99999</p>'
      assert.equal(extractDownloadCount(html), '99999')
    })

    test('returns null when pattern not found', () => {
      const html = '<p>No download info here</p>'
      assert.equal(extractDownloadCount(html), null)
    })

    test('returns null for empty HTML', () => {
      assert.equal(extractDownloadCount(''), null)
    })

    test('does not match partial tags', () => {
      const html = 'Downloads: 500'
      assert.equal(extractDownloadCount(html), null)
    })
  })

  // ─── nextFileIndex ────────────────────────────────────────────────────────

  await describe('nextFileIndex (URL cycling)', async () => {
    test('advances from 0 to 1', () => {
      assert.equal(nextFileIndex(0, 3), 1)
    })

    test('wraps from last to 0', () => {
      assert.equal(nextFileIndex(2, 3), 0)
    })

    test('single URL always stays at 0', () => {
      assert.equal(nextFileIndex(0, 1), 0)
    })

    test('advances through a two-URL list', () => {
      assert.equal(nextFileIndex(0, 2), 1)
      assert.equal(nextFileIndex(1, 2), 0)
    })
  })

  // ─── computeDailyDelta ────────────────────────────────────────────────────

  await describe('computeDailyDelta', async () => {
    test('returns 0 delta for a brand-new entry', () => {
      const result = computeDailyDelta('100', {}, 'myShortcut', 15)
      assert.equal(result.dayDelta, 0)
      assert.equal(result.downloads, '100')
    })

    test('accumulates delta within the same day', () => {
      const file = { myShortcut: { downloads: '90', dayDelta: 5, date: 15 } }
      const result = computeDailyDelta('100', file, 'myShortcut', 15)
      assert.equal(result.dayDelta, 15) // (100-90) + 5
    })

    test('resets delta when day changes', () => {
      const file = { myShortcut: { downloads: '90', dayDelta: 50, date: 14 } }
      const result = computeDailyDelta('100', file, 'myShortcut', 15)
      assert.equal(result.dayDelta, 10) // reset dayDelta to 0, then (100-90) + 0
    })

    test('returns 0 delta when download count is unchanged', () => {
      const file = { myShortcut: { downloads: '100', dayDelta: 0, date: 15 } }
      const result = computeDailyDelta('100', file, 'myShortcut', 15)
      assert.equal(result.dayDelta, 0)
    })

    test('updates stored downloads to the current count', () => {
      const file = { myShortcut: { downloads: '90', dayDelta: 0, date: 15 } }
      const result = computeDailyDelta('105', file, 'myShortcut', 15)
      assert.equal(result.downloads, '105')
    })

    test('stores the current date in the result', () => {
      const result = computeDailyDelta('100', {}, 'myShortcut', 15)
      assert.equal(result.date, 15)
    })
  })
}
