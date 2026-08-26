// Tests for Upcoming Calendar Indicator.js
'use strict'

// ─── Logic extracted from the script ─────────────────────────────────────────

function saturdayIndex(monWeekStart) {
  return monWeekStart ? 5 : 6
}

function sundayIndex(monWeekStart) {
  return monWeekStart ? 6 : 0
}

// Safe color assignment — only assigns if the flag is enabled (fixed version)
function resolveWeekendTextColor(colIndex, sat, sun, useSaturdayColor, saturdayColor, useSundayColor, sundayColor) {
  let textColor = undefined
  if (colIndex === sat && useSaturdayColor) textColor = saturdayColor
  if (colIndex === sun && useSundayColor) textColor = sundayColor
  return textColor
}

// HeatMap guard — only runs when heatMapEnabled is true (fixed version)
function shouldRunHeatMap(heatMapEnabled, remList, prevMonth, nextMonth) {
  return heatMapEnabled && !!remList && !prevMonth && !nextMonth
}

// Progress bar ratio (same logic as heatmap ratio)
function heatRatio(completedCount, heatMapMax) {
  if (!heatMapMax) return 0
  const ratio = completedCount / heatMapMax
  return ratio > 1 ? 1 : ratio
}

// Date-to-calshow epoch conversion used for tappable dates
function calshowEpoch(targetDate, originDate) {
  return (targetDate - originDate) / 1000
}

// hideCompletedReminders filtering — extracted from subdirectory version filter predicate
function shouldIncludeItem(isCalEvent, isCompleted, hideCompletedReminders) {
  return hideCompletedReminders ? (!isCalEvent ? (isCompleted ? false : true) : true) : true
}

// persistIncompleteReminders — extracted from subdirectory version filter predicate
function shouldPersistIncomplete(isCalEvent, isCompleted, persistIncompleteReminders) {
  return persistIncompleteReminders ? (!isCalEvent ? (!isCompleted) : false) : false
}

module.exports = async function({ test, describe, assert }) {

  // ─── Weekend column indices ────────────────────────────────────────────────

  await describe('saturdayIndex', async () => {
    test('returns 5 when week starts on Monday', () => {
      assert.equal(saturdayIndex(true), 5)
    })

    test('returns 6 when week starts on Sunday', () => {
      assert.equal(saturdayIndex(false), 6)
    })
  })

  await describe('sundayIndex', async () => {
    test('returns 6 when week starts on Monday', () => {
      assert.equal(sundayIndex(true), 6)
    })

    test('returns 0 when week starts on Sunday', () => {
      assert.equal(sundayIndex(false), 0)
    })
  })

  // ─── resolveWeekendTextColor ──────────────────────────────────────────────

  await describe('resolveWeekendTextColor', async () => {
    const sat = 6, sun = 0

    test('returns saturdayColor when column is Saturday and useSaturdayColor is true', () => {
      const result = resolveWeekendTextColor(sat, sat, sun, true, '#FF0000', false, undefined)
      assert.equal(result, '#FF0000')
    })

    test('returns undefined when column is Saturday but useSaturdayColor is false', () => {
      const result = resolveWeekendTextColor(sat, sat, sun, false, '#FF0000', false, undefined)
      assert.equal(result, undefined)
    })

    test('returns sundayColor when column is Sunday and useSundayColor is true', () => {
      const result = resolveWeekendTextColor(sun, sat, sun, false, undefined, true, '#0000FF')
      assert.equal(result, '#0000FF')
    })

    test('returns undefined when column is Sunday but useSundayColor is false', () => {
      const result = resolveWeekendTextColor(sun, sat, sun, false, undefined, false, '#0000FF')
      assert.equal(result, undefined)
    })

    test('returns undefined for a weekday column', () => {
      const result = resolveWeekendTextColor(3, sat, sun, true, '#FF0000', true, '#0000FF')
      assert.equal(result, undefined)
    })

    test('does not propagate undefined saturdayColor when flag is false', () => {
      // This was the original bug — when useSaturdayColor=false, saturdayColor is undefined,
      // and the old code would assign textColor=undefined
      const result = resolveWeekendTextColor(sat, sat, sun, false, undefined, false, undefined)
      assert.equal(result, undefined)
    })
  })

  // ─── shouldRunHeatMap ─────────────────────────────────────────────────────

  await describe('shouldRunHeatMap', async () => {
    test('returns true when all conditions are met', () => {
      assert.equal(shouldRunHeatMap(true, 'MyList', false, false), true)
    })

    test('returns false when heatMapEnabled is false', () => {
      assert.equal(shouldRunHeatMap(false, 'MyList', false, false), false)
    })

    test('returns false when remList is empty/null', () => {
      assert.equal(shouldRunHeatMap(true, '', false, false), false)
      assert.equal(shouldRunHeatMap(true, null, false, false), false)
    })

    test('returns false when showing previous month days', () => {
      assert.equal(shouldRunHeatMap(true, 'MyList', true, false), false)
    })

    test('returns false when showing next month days', () => {
      assert.equal(shouldRunHeatMap(true, 'MyList', false, true), false)
    })

    test('returns false when both prev and next month flags are set', () => {
      assert.equal(shouldRunHeatMap(true, 'MyList', true, true), false)
    })

    test('returns false when heatMapEnabled is false even with a valid remList', () => {
      // This was the original bug — heatMapMax/heatMapColor were undefined when
      // heatMapEnabled=false, crashing new Color(undefined)
      assert.equal(shouldRunHeatMap(false, 'ShoppingList', false, false), false)
    })
  })

  // ─── heatRatio ────────────────────────────────────────────────────────────

  await describe('heatRatio', async () => {
    test('returns correct ratio for partial completion', () => {
      assert.ok(Math.abs(heatRatio(3, 10) - 0.3) < 0.0001)
    })

    test('returns 1 when completedCount equals heatMapMax', () => {
      assert.equal(heatRatio(10, 10), 1)
    })

    test('caps at 1 when completedCount exceeds heatMapMax', () => {
      assert.equal(heatRatio(15, 10), 1)
    })

    test('returns 0 when no completions', () => {
      assert.equal(heatRatio(0, 10), 0)
    })

    test('returns 0 when heatMapMax is 0 (prevents division by zero)', () => {
      assert.equal(heatRatio(5, 0), 0)
    })

    test('returns 0 when heatMapMax is undefined (prevents crash)', () => {
      assert.equal(heatRatio(5, undefined), 0)
    })
  })

  // ─── shouldIncludeItem (hideCompletedReminders) ───────────────────────────

  await describe('shouldIncludeItem (hideCompletedReminders)', async () => {
    test('includes calendar events regardless of completion', () => {
      assert.equal(shouldIncludeItem(true, true, true), true)
      assert.equal(shouldIncludeItem(true, false, true), true)
    })

    test('excludes completed reminders when hideCompletedReminders is true', () => {
      assert.equal(shouldIncludeItem(false, true, true), false)
    })

    test('includes incomplete reminders when hideCompletedReminders is true', () => {
      assert.equal(shouldIncludeItem(false, false, true), true)
    })

    test('includes completed reminders when hideCompletedReminders is false', () => {
      assert.equal(shouldIncludeItem(false, true, false), true)
    })
  })

  // ─── shouldPersistIncomplete (persistIncompleteReminders) ─────────────────

  await describe('shouldPersistIncomplete (persistIncompleteReminders)', async () => {
    test('returns true for past-due incomplete reminder when persist is enabled', () => {
      assert.equal(shouldPersistIncomplete(false, false, true), true)
    })

    test('returns false for completed reminder even when persist is enabled', () => {
      assert.equal(shouldPersistIncomplete(false, true, true), false)
    })

    test('returns false for calendar events regardless of persist flag', () => {
      assert.equal(shouldPersistIncomplete(true, false, true), false)
      assert.equal(shouldPersistIncomplete(true, true, true), false)
    })

    test('returns false when persistIncompleteReminders is false', () => {
      assert.equal(shouldPersistIncomplete(false, false, false), false)
    })
  })

  // ─── calshowEpoch ─────────────────────────────────────────────────────────

  await describe('calshowEpoch', async () => {
    test('returns 0 when target equals origin', () => {
      const d = new Date('2024-06-15T12:00:00')
      assert.equal(calshowEpoch(d, d), 0)
    })

    test('returns positive value when target is after origin', () => {
      const origin = new Date('2024-01-01')
      const target = new Date('2024-01-02')
      assert.equal(calshowEpoch(target, origin), 86400) // 1 day in seconds
    })

    test('returns negative value when target is before origin', () => {
      const origin = new Date('2024-01-02')
      const target = new Date('2024-01-01')
      assert.equal(calshowEpoch(target, origin), -86400)
    })

    test('returns a float for sub-second differences', () => {
      const origin = new Date('2024-06-15T00:00:00.000')
      const target = new Date('2024-06-15T00:00:00.500')
      // 500ms / 1000 = 0.5 — the script passes this directly to calshow: URL
      assert.equal(calshowEpoch(target, origin), 0.5)
    })
  })
}
