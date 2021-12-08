// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-gray; icon-glyph: magic;
let w = new ListWidget()

let r = new Request('https://highwaysengland.co.uk/travel-updates/the-severn-bridges/')
let res = await r.loadString()

//log(res)
// Pasteboard.copy(res)

let reg1 = /div class\=\"severn-crossing-status__heading\"\>(.*?)\</g
let reg2 = /div class\=\"severn-crossing-status__heading\"\>(.*?)\</
res = res.match(reg1)
log(res)

res.forEach(f)

Script.setWidget(w)
Script.complete()
w.presentSmall()

function f(input,index){
  log
  let itemText = input.match(reg2)[1]
  log(itemText)
  //let itemIcon = itemText.includes('Open')?'🟢':'🔴'
  let openStatus = itemText.includes('Open')
  log(`open status is ${openStatus}`)

  let directionReg = /(eastbound|westbound)/g
  let nameReg = /\- (.*?)\s(.*)/
  let name = itemText.match(nameReg)[1]
  let detail = itemText.match(nameReg)[2]
  log(name)
  let colorInd,dirMatch = itemText.match(directionReg)
  if(!openStatus && itemText.includes('both')){
    colorInd = [Color.red(),Color.red()]
  }else if(!openStatus && dirMatch){
    log(`${itemText} partially closed`)

    log(`dirMatch is ${dirMatch}`)
    
    if(itemText.includes('west')){  
      colorInd = [Color.red(),Color.green()]
    }else{
      colorInd = [Color.green(),Color.red()]
    }
    
  }else{
    colorInd = [Color.green(),Color.green()]
  }
  //log(colorInd)
  //itemText = itemIcon+itemText
  //w.addText(itemText)
  let stack = w.addStack()
  let left = stack.addStack()
  left.size = new Size(110, 60)
  let right = stack.addStack()
  stack.layoutHorizontally()
  
  right.size= new Size(20, 60)
  let nameStack = left.addStack()
  let nameDisplay = nameStack.addText(name)
  nameDisplay.font = Font.boldSystemFont(35)
  
  
  let detailStack = left.addStack()
  let detailDisplay = detailStack.addText(detail)
  detailDisplay.font=Font.systemFont(7)
  detailDisplay.minimumScaleFactor=0.5
  left.layoutVertically()
  //left.addText(itemText)
  
  let grad = new LinearGradient()
  grad.colors = colorInd
  grad.locations = [0.25,0.75]
  grad.startPoint = new Point(0, 0.5)
  grad.endPoint = new Point(1, 0.5)
  
  let draw = new DrawContext()
  //draw.setFillColor(grad)
  draw.fill(new Rect(0,0,5,10))
  right.cornerRadius = 15
  right.backgroundGradient = grad
  
//   left.borderColor=Color.green()
//   left.borderWidth=1
//   stack.borderColor=Color.red()
//   stack.borderWidth=1
  if(index ==0)w.addSpacer()

}