// Simple sequential test runner — no external dependencies required.
// Run with: node tests/runner.js
'use strict'
const { strict: assert } = require('assert')

let passed = 0, failed = 0
const failures = []
let _queue = null  // set by describe to collect tests sequentially

async function runTest(name, fn) {
  try {
    const result = fn()
    if (result && typeof result.then === 'function') await result
    console.log(`  ✓ ${name}`)
    passed++
  } catch (e) {
    console.log(`  ✗ ${name}`)
    console.log(`    ${e.message}`)
    failed++
    failures.push({ name, error: e })
  }
}

// test() either queues (inside describe) or runs immediately
function test(name, fn) {
  if (_queue) { _queue.push({ name, fn }); return }
  return runTest(name, fn)
}

// describe() collects all test() calls synchronously, then drains them sequentially
async function describe(suiteName, fn) {
  console.log(`\n${suiteName}`)
  const queue = []
  const prev = _queue
  _queue = queue
  const result = fn()
  if (result && typeof result.then === 'function') await result
  _queue = prev
  for (const item of queue) await runTest(item.name, item.fn)
}

async function runFile(path) {
  const mod = require(path)
  if (typeof mod === 'function') await mod({ test, describe, assert })
}

async function main() {
  const files = [
    './alexa-reminders.test.js',
    './weather-overview.test.js',
    './mee6.test.js',
    './rh-downloads.test.js',
    './twitter-widget.test.js',
    './upcoming-calendar.test.js',
  ]
  for (const f of files) await runFile(f)

  console.log(`\n${'─'.repeat(50)}`)
  console.log(`  ${passed} passed, ${failed} failed`)
  if (failures.length) {
    console.log('\nFailed tests:')
    failures.forEach(({ name, error }) => {
      console.log(`  ✗ ${name}: ${error.message}`)
    })
    process.exit(1)
  }
}

main().catch(e => { console.error(e); process.exit(1) })
