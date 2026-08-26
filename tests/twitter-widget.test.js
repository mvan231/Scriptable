// Tests for Twitter Widget.js
'use strict'

// ─── dateDelt output logic (parsing-independent) ──────────────────────────────
// The original parses via Scriptable's DateFormatter (iOS-only). We test the
// time-delta arithmetic and output-format selection by injecting a pre-parsed
// Date object, bypassing the platform-specific parsing step.

function formatTimeDelta(outDate) {
  const now = new Date()
  const delta = Math.round((now.getTime() - outDate.getTime()) / 1000)
  const deltaH = Math.floor(delta / 3600)
  const deltaM = Math.floor((delta % 3600) / 60)
  const deltaS = delta % 60

  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  let tOut = months[outDate.getMonth()] + outDate.getDate()

  if (now.getDate() === outDate.getDate() || deltaH < 24) {
    let val = deltaH, unit = 'h'
    if (val < 1) { val = deltaM; unit = 'm' }
    if (val < 1) { val = deltaS; unit = 's' }
    tOut = val + unit
  }
  return tOut
}

// ─── Twitter date string transform (testable without DateFormatter) ────────────

function transformTwitterDateString(dateString) {
  let dt = dateString
  dt = dt.replace(/^.{3}/, dt.match(/.{4}$/))
  dt = dt.replace(/.{4}$/, '')
  return dt
}

// ─── updateCheck comparison logic ─────────────────────────────────────────────

function shouldCheckForUpdates(checkUpdates) {
  return checkUpdates === true
}

module.exports = async function({ test, describe, assert }) {

  // ─── formatTimeDelta ──────────────────────────────────────────────────────

  await describe('formatTimeDelta (dateDelt arithmetic)', async () => {
    test('returns seconds suffix for a date 30 seconds ago', () => {
      const d = new Date(Date.now() - 30 * 1000)
      const result = formatTimeDelta(d)
      assert.ok(result.endsWith('s'), `expected "s" suffix, got "${result}"`)
    })

    test('returns minutes suffix for a date 5 minutes ago', () => {
      const d = new Date(Date.now() - 5 * 60 * 1000)
      const result = formatTimeDelta(d)
      assert.ok(result.endsWith('m'), `expected "m" suffix, got "${result}"`)
    })

    test('returns hours suffix for a date 3 hours ago', () => {
      const d = new Date(Date.now() - 3 * 3600 * 1000)
      const result = formatTimeDelta(d)
      assert.ok(result.endsWith('h'), `expected "h" suffix, got "${result}"`)
      assert.ok(result.startsWith('3'), `expected "3h", got "${result}"`)
    })

    test('returns a MonthDay string for a date clearly in a different month', () => {
      // 47 days ensures deltaH ≈ 1128 (well > 24) and getDate() can never repeat monthly
      const d = new Date(Date.now() - 47 * 24 * 3600 * 1000)
      const result = formatTimeDelta(d)
      assert.ok(!result.match(/^\d+[hms]$/), `expected date string but got "${result}"`)
    })

    test('returns "0s" for a date right now', () => {
      const d = new Date()
      const result = formatTimeDelta(d)
      assert.ok(result.endsWith('s'), `expected "s" suffix, got "${result}"`)
    })
  })

  // ─── transformTwitterDateString ───────────────────────────────────────────

  await describe('transformTwitterDateString', async () => {
    test('moves year from end to front', () => {
      const result = transformTwitterDateString('Mon Nov 13 10:45:30 +0000 2023')
      assert.ok(result.startsWith('2023'), `expected to start with "2023", got "${result}"`)
    })

    test('removes the trailing year after transformation', () => {
      const result = transformTwitterDateString('Mon Nov 13 10:45:30 +0000 2023')
      // The trailing "2023" should be gone (only one year at front)
      assert.equal(result.indexOf('2023'), 0)
      assert.equal(result.lastIndexOf('2023'), 0)
    })

    test('produces correct format for DateFormatter parsing', () => {
      const result = transformTwitterDateString('Mon Nov 13 10:45:30 +0000 2023')
      assert.equal(result.trim(), '2023 Nov 13 10:45:30 +0000')
    })
  })

  // ─── shouldCheckForUpdates ────────────────────────────────────────────────

  await describe('shouldCheckForUpdates (checkUpdates===true fix)', async () => {
    test('returns true when checkUpdates is boolean true', () => {
      assert.equal(shouldCheckForUpdates(true), true)
    })

    test('returns false when checkUpdates is boolean false', () => {
      assert.equal(shouldCheckForUpdates(false), false)
    })

    test('returns false when checkUpdates is the string "true" (old bug)', () => {
      // Before the fix, checkUpdates="true" (assignment) made this always truthy.
      // Now we use ===true so the string "true" must not trigger updates.
      assert.equal(shouldCheckForUpdates('true'), false)
    })

    test('returns false when checkUpdates is undefined', () => {
      assert.equal(shouldCheckForUpdates(undefined), false)
    })

    test('returns false when checkUpdates is 1 (truthy but not strictly true)', () => {
      assert.equal(shouldCheckForUpdates(1), false)
    })
  })
}
