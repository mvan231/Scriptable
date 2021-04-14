// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: light-brown; icon-glyph: list-ul;
let useTransparency = false
let showSymbol = true
let symColor = Color.white()
let sym = "list.bullet"

let baseColor
if (useTransparency)baseColor=Color.dynamic(/*lightColor*/Color.white(), /*darkColor*/Color.white())


/*

BEGIN

*/
let w = new ListWidget()
w.setPadding(15,15,15,15)// 
// w.setPadding(top, leading, bottom, trailing)

let list = args.widgetParameter
let cal = list?await Calendar.findOrCreateForReminders(list):await Calendar.defaultForReminders()

log(cal)

let topStack = w.addStack()
let topLeft = topStack.addStack()
topStack.addSpacer()
let topRight = topStack.addStack()
// topStack.layoutHorizontally()

let reminders = await Reminder.allIncomplete([cal])

let remindersCount = reminders.length

await createWidget()

let bottomStack = w.addStack()
bottomStack.layoutVertically()

let remToShow = {"small":3,"medium":4,"large":8}
let size = config.widgetFamily?config.widgetFamily:"small"
let n = remToShow[size]
log(n+" remToShow")
let newReminders = reminders.slice(0, n) //get first x items
// 
// log(newReminders)

newReminders.forEach((rem,index) => {  
  let newStack = bottomStack.addStack()  
  let newText = newStack.addText(rem.title)
//   log(rem.title)
  newText.font = Font.systemFont(13)
  baseColor?newText.textColor = baseColor:
  bottomStack.addSpacer(5)

  if (index < n-1){
    bottomStack.addImage(lineSep(60))
    bottomStack.addSpacer(5)
  }
})


if(useTransparency){
const RESET_BACKGROUND = !config.runsInWidget
const { transparent } = importModule('no-background')
w.backgroundImage = await transparent(Script.name(), RESET_BACKGROUND)
}

w.url = 'x-apple-reminderkit://'
Script.setWidget(w)
Script.complete()
w.presentSmall()


/*
$$$$$$$$$$$$$$$

begin functions

$$$$$$$$$$$$$$$
*/

function createWidget(){
  let dot = topLeft.addImage(colorDot())
  dot.resizable = true
  dot.imageSize = new Size(35,35)
  
  let symbol = SFSymbol.named(sym)
  symbol.applyMediumWeight()
  let font = Font.systemFont(50)
  symbol.applyFont(font)
  
  let symStack = topLeft.addStack()
  symStack.setPadding(7,7,10,10)
  let symIm = symStack.addImage(symbol.image)
  symIm.imageSize = new Size(20,20)
  topLeft.spacing =-35
  symIm.tintColor = symColor
  
  let countText = topRight.addText(String(remindersCount))
  countText.font = Font.boldRoundedSystemFont(28) 
  baseColor?countText.textColor = baseColor:
  w.addSpacer(6)
  
  let title = w.addText(cal.title)
  title.textColor = cal.color
  title.font = Font.boldSystemFont(14)
  w.addSpacer(4)
}

function colorDot(){
  
  let symbol = SFSymbol.named("list.bullet")
  symbol.applyMediumWeight()
  let font = Font.systemFont(20)
  symbol.applyFont(font)
  

    const context =new DrawContext()
    let s = 50
    context.size=new Size(s,s)
    context.opaque=false
    context.respectScreenScale=true
    context.setFillColor(cal.color)
    context.fillEllipse(new Rect(0, 0,s,s))

    /*
    if (showSymbol) context.drawImageInRect(symbol.image, new Rect(12.5,12.5,25,25))
*/
    return context.getImage()  
}

function lineSep(numDashes){
  const context =new DrawContext()
  var width,h,dashLength
  width = 200
  h=1
  dashLength = width/numDashes
  context.size=new Size(width, h)
  context.opaque=false
  context.respectScreenScale=true
  //log(dashLength)
  for (let i = 0; i<numDashes;i++){  
    path = new Path()
    pos = (dashLength*i)
    path.move(new Point(pos,h))
    path.addLine(new Point(pos+dashLength-5,h))  
    context.addPath(path)
    baseColor?context.setStrokeColor(baseColor):
    context.strokePath()  
  }
  return context.getImage()
}