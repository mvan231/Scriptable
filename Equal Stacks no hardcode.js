// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: gray; icon-glyph: magic;
//script by supermamon
//presents two equally sized / spaced stacks

const w = new ListWidget()

// create horizontal main stack
const mainStack = w.addStack()
mainStack.layoutHorizontally()
mainStack.backgroundColor = Color.green()

// left stack
const left = mainStack.addStack()
left.layoutVertically()
left.backgroundColor = Color.red()

// left sizer inside left stack
const lsizer = left.addStack()
lsizer.backgroundColor = Color.cyan()
lsizer.layoutHorizontally()
lsizer.addSpacer()
// padding to make it visible visible. remove otherwise
// lsizer.setPadding(2, 0, 0, 0) 

// left content just below sizer
left.addSpacer()
left.addText('left')
left.addSpacer()

// right stack
const right = mainStack.addStack()
right.layoutVertically()
right.backgroundColor = Color.blue()

// right sizer inside right stack
const rsizer = right.addStack()
rsizer.backgroundColor = Color.magenta()
rsizer.layoutHorizontally()
rsizer.addSpacer()
// padding to make it visible visible. remove otherwise
// rsizer.setPadding(2, 0, 0, 0)

// right content just below sizer
right.addSpacer()
right.addText('right')
right.addSpacer()

await w.presentMedium()