// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-green; icon-glyph: magic;
//set the filename of the image. Example: image in iCloud Drive/Scriptable which has the name "WBack.jpeg"
let filename = "WBack.jpeg"

//setup the fiie manager
let fm = FileManager.iCloud()

//build the full path of the image
let path = fm.joinPath(fm.documentsDirectory(),filename)

log(`path is ${path}`)

//retrieve the image
let image = fm.readImage(path)

//start to build the widget
let w = new ListWidget()
//set background image as the image variable
w.backgroundImage = image
//set the widget
Script.setWidget(w)
//complete the script
Script.complete()
//display a preview when running in app
w.presentLarge()