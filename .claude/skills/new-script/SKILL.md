---
name: new-script
description: Scaffold a new Scriptable widget script with required headers, FileManager setup, settings JSON pattern, and updateCheck boilerplate
disable-model-invocation: true
---

Create a new Scriptable widget script based on the name and description provided by the user.

The script MUST start with exactly these 3 lines (no blank line before them):
```
// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: <color>; icon-glyph: <glyph>;
```

Choose an appropriate `icon-color` from: red, deep-red, orange, yellow, green, teal, blue, deep-blue, indigo, purple, pink, white, gray, light-gray, dark-gray, black.
Choose an appropriate `icon-glyph` from Font Awesome glyph names (e.g. calendar-alt, cloud-sun, dove, chart-bar, bell, star).

After the header, scaffold the following structure:

```javascript
// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: blue; icon-glyph: star;

'use strict'

const SCRIPT_VERSION = 1.0

let fm = FileManager.iCloud()
let scriptDir = fm.documentsDirectory() + '/<ScriptName>/'
let settingsPath = scriptDir + 'settings.json'

if (!fm.fileExists(scriptDir)) fm.createDirectory(scriptDir, false)

let needUpdated = await updateCheck(SCRIPT_VERSION)

let settings = {}
if (fm.fileExists(settingsPath)) {
  settings = JSON.parse(fm.readString(settingsPath))
}

// ─── Main widget ────────────────────────────────────────────────────────────

let widget = new ListWidget()
widget.backgroundColor = Color.dynamic(Color.white(), Color.black())

// TODO: build widget UI here

if (config.runsInWidget) {
  Script.setWidget(widget)
} else {
  await widget.presentMedium()
}
Script.complete()

// ─── Helpers ────────────────────────────────────────────────────────────────

async function updateCheck(currentVersion) {
  // Placeholder — replace with actual update URL for published scripts
  return false
}
```

Save the file as `<ScriptName>.js` in the project root. Ask the user for the script name, purpose, icon color, and icon glyph if not provided.
