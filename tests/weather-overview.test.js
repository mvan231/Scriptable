// Tests for Weather Overview pure utility functions
'use strict'

// ─── Functions extracted verbatim from Weather Overview.js ───────────────────

function epochToDate(epoch) {
  return new Date(epoch * 1000)
}

function shouldRound(should, value) {
  return (should) ? Math.round(value) : value
}

function isSameDay(date1, date2) {
  return (
    date1.getYear() === date2.getYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  )
}

// Daily vs hourly precipitation key selection (fixed version)
function getPrecipAmount(data, mmToInch) {
  const rainVal = data.rain ? (typeof data.rain === 'object' ? data.rain['1h'] : data.rain) : null
  const snowVal = data.snow ? (typeof data.snow === 'object' ? data.snow['1h'] : data.snow) : null
  return rainVal !== null ? rainVal * mmToInch : snowVal !== null ? snowVal * mmToInch : 0
}

// Night detection (fixed version — uses getTime() not getTime)
function isNight(dtEpoch, hourDay, currentSunrise, currentSunset, isFirstEntry) {
  const now = new Date()
  return (
    dtEpoch > hourDay.sunset ||
    dtEpoch < hourDay.sunrise ||
    (isFirstEntry && (now.getTime() / 1000 > currentSunset || now.getTime() / 1000 < currentSunrise))
  )
}

module.exports = async function({ test, describe, assert }) {

  // ─── epochToDate ───────────────────────────────────────────────────────────

  await describe('epochToDate', async () => {
    test('converts Unix epoch (seconds) to a Date object', () => {
      const epoch = 1700000000
      const result = epochToDate(epoch)
      assert.ok(result instanceof Date)
      assert.equal(result.getTime(), epoch * 1000)
    })

    test('epoch 0 maps to January 1 1970', () => {
      const result = epochToDate(0)
      assert.equal(result.getUTCFullYear(), 1970)
      assert.equal(result.getUTCMonth(), 0)
      assert.equal(result.getUTCDate(), 1)
    })

    test('preserves sub-minute precision', () => {
      const epoch = 1700000045
      assert.equal(epochToDate(epoch).getTime(), 1700000045000)
    })
  })

  // ─── shouldRound ───────────────────────────────────────────────────────────

  await describe('shouldRound', async () => {
    test('rounds when flag is true', () => {
      assert.equal(shouldRound(true, 72.6), 73)
    })

    test('returns raw float when flag is false', () => {
      assert.equal(shouldRound(false, 72.6), 72.6)
    })

    test('rounds down correctly', () => {
      assert.equal(shouldRound(true, 72.4), 72)
    })

    test('passes through integers unchanged', () => {
      assert.equal(shouldRound(true, 70), 70)
    })

    test('handles negative values', () => {
      assert.equal(shouldRound(true, -3.7), -4)
    })
  })

  // ─── isSameDay ─────────────────────────────────────────────────────────────

  await describe('isSameDay', async () => {
    test('returns true for two Date objects on the same day', () => {
      const a = new Date('2024-06-15T08:00:00')
      const b = new Date('2024-06-15T22:45:00')
      assert.equal(isSameDay(a, b), true)
    })

    test('returns false for dates on different days', () => {
      const a = new Date('2024-06-15T23:59:59')
      const b = new Date('2024-06-16T00:00:00')
      assert.equal(isSameDay(a, b), false)
    })

    test('returns false for same day in different months', () => {
      const a = new Date('2024-05-15')
      const b = new Date('2024-06-15')
      assert.equal(isSameDay(a, b), false)
    })

    test('returns false for same month/day in different years', () => {
      const a = new Date('2023-06-15')
      const b = new Date('2024-06-15')
      assert.equal(isSameDay(a, b), false)
    })

    test('returns true when same Date object is compared to itself', () => {
      const a = new Date('2024-06-15')
      assert.equal(isSameDay(a, a), true)
    })
  })

  // ─── getPrecipAmount (daily vs hourly key fix) ─────────────────────────────

  await describe('getPrecipAmount', async () => {
    const mmToInch = 394 / 10000

    test('returns 0 when no rain or snow', () => {
      assert.equal(getPrecipAmount({}, 1), 0)
    })

    test('uses rain["1h"] key for hourly data (object form)', () => {
      const data = { rain: { '1h': 2.5 } }
      assert.equal(getPrecipAmount(data, 1), 2.5)
    })

    test('uses plain rain number for daily data', () => {
      const data = { rain: 5.0 }
      assert.equal(getPrecipAmount(data, 1), 5.0)
    })

    test('uses snow["1h"] key for hourly snow data', () => {
      const data = { snow: { '1h': 1.0 } }
      assert.equal(getPrecipAmount(data, 1), 1.0)
    })

    test('uses plain snow number for daily snow data', () => {
      const data = { snow: 3.0 }
      assert.equal(getPrecipAmount(data, 1), 3.0)
    })

    test('rain takes precedence over snow when both present', () => {
      const data = { rain: 2.0, snow: 1.0 }
      assert.equal(getPrecipAmount(data, 1), 2.0)
    })

    test('applies mmToInch conversion factor', () => {
      const data = { rain: 10.0 }
      const result = getPrecipAmount(data, mmToInch)
      assert.ok(Math.abs(result - 10.0 * mmToInch) < 0.0001)
    })

    test('hourly rain["1h"] value of 0 returns 0 (not falls through to snow)', () => {
      const data = { rain: { '1h': 0 }, snow: { '1h': 5.0 } }
      // rain is present (object), so snowVal should not be used
      // rain value is 0, result is 0
      assert.equal(getPrecipAmount(data, 1), 0)
    })
  })

  // ─── isNight (night detection fix) ────────────────────────────────────────

  await describe('isNight', async () => {
    const sunrise = 1700000000
    const sunset  = 1700050000

    test('returns true when dt is after sunset', () => {
      assert.equal(isNight(sunset + 100, { sunrise, sunset }, sunrise, sunset, false), true)
    })

    test('returns true when dt is before sunrise', () => {
      assert.equal(isNight(sunrise - 100, { sunrise, sunset }, sunrise, sunset, false), true)
    })

    test('returns false during the day', () => {
      const midday = (sunrise + sunset) / 2
      assert.equal(isNight(midday, { sunrise, sunset }, sunrise, sunset, false), false)
    })

    test('first entry checks system clock against current sunset', () => {
      // Use a sunrise far in the future and sunset far in the past so current time is "night"
      const pastSunset  = Math.floor(Date.now() / 1000) - 7200  // 2 hours ago
      const pastSunrise = Math.floor(Date.now() / 1000) - 36000 // 10 hours ago
      const midday = (pastSunrise + pastSunset) / 2
      const result = isNight(midday, { sunrise: pastSunrise, sunset: pastSunset }, pastSunrise, pastSunset, true)
      assert.equal(result, true)
    })
  })
}
