---
name: gen-test
description: Generate a Node.js test file for a Scriptable widget script, following the project's existing test conventions in tests/
disable-model-invocation: true
---

Generate a test file for the Scriptable script named by the user (e.g. `/gen-test Twitter Widget.js`).

## Steps

1. Read the target `.js` script from the project root
2. Read `tests/scriptable-mocks.js` to understand available mock factories
3. Identify pure/testable functions in the script (logic that doesn't require a live Scriptable runtime)
4. Create `tests/<kebab-name>.test.js` following the exact pattern used in existing test files:

```javascript
// Tests for <ScriptName>.js
'use strict'

const {
  makeRequest, makeWebView, makeAlert, /* etc. — import only what's needed */
} = require('./scriptable-mocks')

// ─── Pure logic extracted from the script ────────────────────────────────────

// Copy or re-express pure functions from the script here so they can be tested
// without requiring the Scriptable runtime.

// ─── Tests ───────────────────────────────────────────────────────────────────

module.exports = async ({ test, describe, assert }) => {
  describe('<ScriptName>', () => {
    test('example: <function> returns expected value', () => {
      // arrange
      // act
      // assert
    })
  })
}
```

5. Add the new test file to the `files` array in `tests/runner.js` so it runs automatically.

## Rules
- Only test logic that can run in plain Node.js — no Scriptable runtime APIs in test bodies
- Use injected `assert` from Node's built-in `assert` module (strict mode)
- Follow the existing naming: `<kebab-case-script-name>.test.js`
- Aim for at least 3 meaningful tests covering happy path, edge case, and error case
