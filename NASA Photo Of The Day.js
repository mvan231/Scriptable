// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-gray; icon-glyph: star-and-crescent;
let key = 'your_key_here'
let r = new Request(`https://api.nasa.gov/planetary/apod?api_key=${key}`)

let res = await r.loadJSON()
log(res)

let imgUrl = res.url
let hdImgUrl = res.hdurl
let title = res.title

log(imgUrl)
log(hdImgUrl)
log(title)

let w = new ListWidget()

r.url = hdImgUrl
let img = await r.loadImage()

w.addSpacer()

let tStack = w.addStack()
let textStack = tStack.addStack()

let tText = textStack.addText(`NASA Photo of the Day:\n${title}`)
tText.textColor = Color.gray()
tText.font = Font.mediumRoundedSystemFont(10)


textStack.backgroundColor = Color.black()
textStack.cornerRadius = 5
tStack.addSpacer()

w.backgroundImage = img

let d = new Date()
w.refreshAfterDate = new Date(d.getFullYear(),d.getMonth(),d.getDate()+1,08,00)
log(w.refreshAfterDate)

Script.setWidget(w)
Script.complete()
w.presentSmall()