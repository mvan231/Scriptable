// Tests for MEE6 LeaderBoard Info.js
'use strict'

// ─── Player lookup logic extracted from the script ────────────────────────────

async function findPlayer(players, username) {
  const regex = new RegExp('.*' + username + '.*')
  let rank, xp, level, count, avatar, progress, nextLevel, userId

  for (const [index, inp] of players.entries()) {
    const h = JSON.stringify(inp)
    const match = regex.exec(h)
    if (match) {
      const cc = JSON.parse(match[0])
      rank = index + 1
      xp = cc.xp
      level = cc.level
      count = cc.message_count
      avatar = cc.avatar
      userId = cc.id
      progress = cc.detailed_xp[0]
      nextLevel = cc.detailed_xp[1]
      break
    }
  }

  return { rank, xp, level, count, avatar, userId, progress, nextLevel }
}

// ─── Guild index cycling logic ────────────────────────────────────────────────

function nextIndex(current, total) {
  const next = current + 1
  return next >= total ? 0 : next
}

// ─── Progress bar calculation ─────────────────────────────────────────────────

function progressRatio(progress, nextLevel) {
  if (!nextLevel || nextLevel === 0) return 0
  return Math.min(1, progress / nextLevel)
}

module.exports = async function({ test, describe, assert }) {

  // ─── findPlayer ─────────────────────────────────────────────────────────────

  await describe('findPlayer', async () => {
    const players = [
      { username: 'alice', id: '111', xp: 500, level: 3, message_count: 50, avatar: 'abc123', detailed_xp: [200, 400] },
      { username: 'bob',   id: '222', xp: 300, level: 2, message_count: 30, avatar: 'def456', detailed_xp: [100, 300] },
      { username: 'carol', id: '333', xp: 100, level: 1, message_count: 10, avatar: 'ghi789', detailed_xp: [50,  200] },
    ]

    test('finds a player by username and returns correct rank', async () => {
      const result = await findPlayer(players, 'bob')
      assert.equal(result.rank, 2)
    })

    test('finds the first-place player', async () => {
      const result = await findPlayer(players, 'alice')
      assert.equal(result.rank, 1)
    })

    test('finds the last-place player', async () => {
      const result = await findPlayer(players, 'carol')
      assert.equal(result.rank, 3)
    })

    test('returns correct xp for found player', async () => {
      const result = await findPlayer(players, 'bob')
      assert.equal(result.xp, 300)
    })

    test('returns correct level for found player', async () => {
      const result = await findPlayer(players, 'alice')
      assert.equal(result.level, 3)
    })

    test('returns correct avatar hash for found player', async () => {
      const result = await findPlayer(players, 'alice')
      assert.equal(result.avatar, 'abc123')
    })

    test('returns correct userId for found player', async () => {
      const result = await findPlayer(players, 'bob')
      assert.equal(result.userId, '222')
    })

    test('returns correct progress (detailed_xp[0]) for found player', async () => {
      const result = await findPlayer(players, 'carol')
      assert.equal(result.progress, 50)
    })

    test('returns correct nextLevel (detailed_xp[1]) for found player', async () => {
      const result = await findPlayer(players, 'carol')
      assert.equal(result.nextLevel, 200)
    })

    test('returns undefined rank when player is not found', async () => {
      const result = await findPlayer(players, 'nobody')
      assert.equal(result.rank, undefined)
    })

    test('returns undefined userId when player is not found', async () => {
      const result = await findPlayer(players, 'nobody')
      assert.equal(result.userId, undefined)
    })

    test('handles an empty player list', async () => {
      const result = await findPlayer([], 'alice')
      assert.equal(result.rank, undefined)
    })

    test('matches partial username (regex is .*username.*)', async () => {
      // "alic" should match player whose username contains "alic"
      const result = await findPlayer(players, 'alic')
      assert.equal(result.rank, 1)
    })
  })

  // ─── Guild index cycling ───────────────────────────────────────────────────

  await describe('nextIndex (guild cycling)', async () => {
    test('advances index by 1', () => {
      assert.equal(nextIndex(0, 3), 1)
      assert.equal(nextIndex(1, 3), 2)
    })

    test('wraps back to 0 when reaching the end', () => {
      assert.equal(nextIndex(2, 3), 0)
    })

    test('single-item list always stays at 0', () => {
      assert.equal(nextIndex(0, 1), 0)
    })

    test('wraps correctly for two-item list', () => {
      assert.equal(nextIndex(0, 2), 1)
      assert.equal(nextIndex(1, 2), 0)
    })
  })

  // ─── progressRatio ─────────────────────────────────────────────────────────

  await describe('progressRatio', async () => {
    test('returns correct ratio for partial progress', () => {
      assert.ok(Math.abs(progressRatio(200, 400) - 0.5) < 0.0001)
    })

    test('returns 1 when progress equals nextLevel', () => {
      assert.equal(progressRatio(400, 400), 1)
    })

    test('caps at 1 when progress exceeds nextLevel', () => {
      assert.equal(progressRatio(500, 400), 1)
    })

    test('returns 0 when progress is 0', () => {
      assert.equal(progressRatio(0, 400), 0)
    })

    test('returns 0 when nextLevel is 0 (prevents division by zero)', () => {
      assert.equal(progressRatio(100, 0), 0)
    })

    test('returns 0 when nextLevel is undefined', () => {
      assert.equal(progressRatio(100, undefined), 0)
    })
  })
}
