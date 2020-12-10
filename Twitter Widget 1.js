// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: blue; icon-glyph: dove;
// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-gray; icon-glyph: magic;
// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: blue; icon-glyph: dove;

/*
<><><><><><><><><><><>
rtsOn set to true will display retweets along with normal tweets. set to false, it will not display retweets￼
<><><><><><><><><><><>
*/
const rtsOn = true
/*
<><><><><><><><><><><>
<><><><><><><><><><><>
*/

const twColor = new Color('#02ABED')
const twImgB64 = twit()

let w = new ListWidget()

let url,numT,wSize = config.widgetFamily
// log(wSize)
switch(wSize){
  case 'medium':
  case 'small':
    numT = 2;
    break;
  case 'large':
    numT = 5;
    break
  case undefined:
    numT = 5;
    break
}
// log(numT)
if (args.widgetParameter){
  url = args.widgetParameter
}else{
  url = 'scriptableapp'//'ps5uknews'
}

let json = await apiCall(url)
log(json)
const titleTxt = json[0].user.name
let tMain = w.addStack()
let tStack = tMain.addStack()
tMain.addSpacer(1)
let timeStack = tMain.addStack()
tMain.layoutVertically()

tStack.addSpacer()
let title = tStack.addText(titleTxt+' Tweets')
tStack.addSpacer()
let timeSpacer
  if (wSize=='small'){
  timeSpacer = 75
  }else{
  timeSpacer=150
  }
timeStack.addSpacer(timeSpacer)
let dt = timeStack.addDate(new Date())
timeStack.addSpacer()
dt.applyRelativeStyle()
dt.font=Font.boldMonospacedSystemFont(8)
dt.textColor=Color.blue()
title.centerAlignText()
title.font=Font.boldMonospacedSystemFont(15)
title.textColor=Color.blue()

let lineImg = lineSep()

json.forEach(f)

w.setPadding(10,10,10,10)
Script.setWidget(w)
Script.complete()
w.presentLarge()


/*
$$$$$$$$$$$$$$$
Begin Functions
$$$$$$$$$$$$$$$
*/
async function apiCall(handle){
  
  //twitter api using fifi's method
  const firstUrl='https://twitter.com/'
  let r = new Request(firstUrl)
  let b = await r.loadString()
  let matched = b.match(/https:\/\/abs\.twimg\.com\/responsive-web\/client-web-legacy\/main\.[^\"]+\.js/)
//   log(matched)
  r.url=matched[0]
  b=await r.loadString()
  matched = b.match(/\"(AAAAAAAA[^\"]+)\"/)
//   log(matched[1])
  let secondUrl = 'https://api.twitter.com/1.1/statuses/user_timeline.json?screen_name='+handle+'&count='+50+'&exclude_replies=true&include_rts='+rtsOn
  let bearer = matched[1]
  log(bearer)
  r.url=secondUrl
  r.method='GET'
  r.headers={'Authorization': 'Bearer '+bearer}
  let res = await r.loadJSON()
//   log(res)
  return res
  
}

function dateDelt(dateString){
  let dt=dateString
  //the two lines below replace the EEE (day name) with the YYYY (full year). then strips the YYYY (full year) from the end of the string
  dt=dt.replace(/^.{3}/, dt.match(/.{4}$/))
  dt=dt.replace(/.{4}$/,'')
  let df = new DateFormatter()
  df.dateFormat = 'YYYY MMM dd HH:mm:ss Z'
  let outDate = df.date(dt)
  log(outDate)
  
  let now = new Date()
  let delta =Math.round((now.getTime()-outDate.getTime())/1000)
  log('deltaTotalSeconds:'+delta)
  let deltaH=Math.floor(delta/3600)
  log('deltaH:'+deltaH)
  let deltaM=Math.floor(delta%3600/60)
  // log('deltaM:'+deltaM)
  let deltaS=delta%60
  // log('deltaS:'+deltaS)
  df.dateFormat='MMMd'
  let tOut = df.string(outDate)
  if (now.getDate()==outDate.getDate()||deltaH<24){
    tOut = deltaH
    let tUnit='h'
    if (tOut<1){
      tOut=deltaM
      tUnit='m'
    }
    if (tOut<1){
      tOut=deltaS
      tUnit='s'
    }
    tOut+=tUnit
  }
  log(tOut)
  return tOut
}
    
function lineSep(){
//generate line separator
const context =new DrawContext()
let width = 340,h=1
context.size=new Size(width, h)
context.opaque=false
context.respectScreenScale=true
const path = new Path()
path.move(new Point(1,h))
path.addLine(new Point(width,h))
context.addPath(path)
context.setStrokeColor(Color.blue())
context.strokePath()
return context.getImage()
}

function f(item,index){

  let out = item
  log('index:'+index+' contains:\n'+ out.text)
  
  if (index <= (numT-1)) {

    let tx = w.addStack()
    lineS = tx.addStack()
    let line = lineS.addImage(lineImg)
    line.centerAlignImage()
    line.resizable=false
    line.imageOpacity=.4
    let tx2 = tx.addStack()
    let tx1 = tx.addStack()
    let twImg = tx1.addImage(Image.fromData(Data.fromBase64String(twImgB64)))
    twImg.tintColor=Color.blue()
    let symbol = SFSymbol.named("clock.fill")
    symbol.applyMediumWeight()
    let font = Font.systemFont(10)
    symbol.applyFont(font)
    let image = tx1.addImage(symbol.image)
    image.resizable=false
    image.tintColor = Color.blue()
    w.addSpacer(1)
    log(out.created_at)
    let dt = tx1.addText(dateDelt(out.created_at))
    dt.font=Font.systemFont(9)
    log(out.text)
    let txt = tx2.addText(out.text)
    txt.font=Font.systemFont(9)
    tx1.setPadding(2,5,2,5)
    tx2.setPadding(2,5,2,5)
    tx.setPadding(10,2,10,2)
    tx.size=new Size(350,60)
    tx2.size=new Size(350,40)
    tx2.addSpacer()
    tx.url = 'https://mobile.twitter.com/'+url+'/status/'+out.id_str
    tx.layoutVertically()
    log(tx.url)
  }
}


function twit(){
  //twitter image base64
  return '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'
  
}