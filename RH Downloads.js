// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: green; icon-glyph: grin-tongue-squint;
/*

RH-Downloads by mvan231

v1.0

*/

/*
#####
   Initialization and HTML Grab - End
#####
*/
let wv=new WebView()
const url = 'https://routinehub.co/user/mvan231'
await wv.loadURL(url)

let html = await wv.getHTML()

var reg = /\<p\>Downloads\: (\d+)\<\/p>/
var str
var lastUpd

if (reg.exec(html))
  {
  str = html.match(reg)[1]
  console.log(str)
  }
/*
#####
   Initialization and HTML Grab - End
#####
*/

/*
#####
   Start iCloud Storage File Information
#####
*/
const now = new Date()
let ff = new DateFormatter()
ff.dateFormat = 'd-MMM H:mm'
let frmt = ff.string(now)
console.log(frmt)
// log(now.getDate())

ab = FileManager.iCloud()
dir=ab.documentsDirectory()
let path = dir+"/RhLastUpd.json"
log(path)
let file

if (!ab.fileExists(path))
{
  //if file does not exist
  file={}
  file.downloads = str
  file.date = now.getDate()
  ab.write(path, Data.fromString(JSON.stringify(file)))
  ab.writeString(path, JSON.stringify(file))
}
  //parse the existing file or the newly created file
  file = JSON.parse(ab.readString(path))
  log(file.downloads)
  log(file.date)

// if file doesnt contain dayDelta key:value
if (!file.dayDelta)
{
  file.dayDelta = 0
}
/*
#####
   End iCloud Storage File Information
#####
*/

/*
#####
   start download diff calculation
#####
*/
var diff

if (file.date == now.getDate())
  {
   //   if the current date is the same as the date last saved in file 
  }else if (file.date == (now.getDate() - 1))
    {
      // if the date saved in file is yesterday (only should happen on first run in a new day to reset the delta download count)
      file.dayDelta = 0
    }
    
  // calculate difference between new RH count, file download count and the previous delta value. this shows the change in downloads throughout the current day
  diff = (str - file.downloads) + file.dayDelta

  //   assign dictionary items new Values
  file.dayDelta = diff
  file.downloads = str
  file.date = now.getDate()

// save new Values to file
  //   ab.write(path, Data.fromString(JSON.stringify(file)))
  ab.writeString(path, JSON.stringify(file))


/*
#####
   start widget
#####
*/
  const w = new ListWidget()
  w.setPadding(14, 5, 14, 5)
  
  const main = w.addText("RH Downloads")
  main.textColor = Color.gray()
  main.centerAlignText()

  // add current Date to widget
  const sub = w.addText(frmt)
  sub.textColor = Color.red()
  sub.font = Font.boldSystemFont(9)
  sub.centerAlignText()
  
  // add downloads to widget
  const titlew = w.addText(await str)
  titlew.textColor = Color.blue()
  titlew.font = Font.boldSystemFont(13)
  titlew.centerAlignText()
  
  // if delta greater than 0 then add day delta to Widget
    if (diff >0)
    {
      const subsub = w.addText("+"+diff + " since yesterday")
      subsub.textColor = Color.blue()
      subsub.font = Font.regularMonospacedSystemFont(11)
      subsub.centerAlignText()
    }
  
  w.addSpacer(6)
  

  
  //set the widget
  Script.setWidget(w)
  //complete the script
  Script.complete()
  w.presentSmall()
/*
#####
   end widget
#####
*/

/*
#####
  start functions
#####
*/

function log(inp){
 console.log(inp) 
}
