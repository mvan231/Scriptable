// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-purple; icon-glyph: syringe;
/*
Welcome to COVID Trend Widget

This widget will display country level stats for COVID-19 and also display a trending indicator whether the given item is trending up, down, or steady. 

The default setting has colored arrows enabled (green for good and red for bad). You can disable this by setting the colorArrows variabke, to false.
*/
const colorArrows = true


//useTransparency is to indicate whether or not to use the no-background module
const useTransparency = false

//numColor is the color of the numbers in the widget
let numColor = new Color(Color.black().hex)
/*--------------------------

Version History:
v1.0 initial release
v1.1 - added a fix for items returned from API with 'null' value
v1.2 - add new Intl.NumberFormat().format(itemValue) so the item values are formatted for better readability
v1.3 - add in transparency module code and text color changes to accomodate
v1.4 - Added a fix for country names with a space included

--------------------------*/

/*@@@@@@@@@@@@@@@@@@@@@@@@@@

End Setup
Begin Script

@@@@@@@@@@@@@@@@@@@@@@@@@@*/

let widget = new ListWidget()

const country = args.widgetParameter?args.widgetParameter:'Guatemala'

const API_URL = "https://coronavirus-19-api.herokuapp.com/countries/"+country.replace(" ", "%20");

const fileManager = FileManager.iCloud()
const cacheDirectory = fileManager.joinPath(fileManager.documentsDirectory(), "CovidWidget");
const cacheFile = fileManager.joinPath(cacheDirectory, country+'_data.json');

let req = new Request(API_URL) 
let json = await req.loadJSON()
log(json)
//check if update is available
let needUpdate = await updateCheck(1.4)

//get the data from the JSON
let todayCases = checkForValueInJSON('todayCases')
let todayDeaths = checkForValueInJSON('todayDeaths')
let recovered = checkForValueInJSON('recovered')
let active = checkForValueInJSON('active')
let deaths = checkForValueInJSON('deaths')
let cases = checkForValueInJSON('cases')



const date = new Date()
let dF = new DateFormatter()
dF.dateFormat='dd MMM yyyy'
const countryTx = widget.addText(country)
countryTx.font = Font.systemFont(15) 
countryTx.textColor=Color.white()
countryTx.centerAlignText()
//if update is available, disolay it in the widget
if(needUpdate)
{  
  const upDText = widget.addText('Update Available')
  upDText.font = Font.systemFont(12)
  upDText.textColor=Color.white()
  upDText.centerAlignText()
}
const widgetDate = widget.addText(date.toLocaleDateString()) 
widgetDate.font = Font.systemFont(13) 
widgetDate.textColor=Color.white()
widgetDate.centerAlignText()

//add items to the widget
addItem('total cases', cases)
addItem('total deaths', deaths)
addItem('active', active)
addItem('recovered', recovered)

// Finalize widget settings 
widget.setPadding(16,16,16,16)

if(useTransparency){
  const RESET_BACKGROUND = !config.runsInWidget
  const { transparent } = importModule('no-background')
  widget.backgroundImage = await transparent(Script.name(), RESET_BACKGROUND)
}else{  
  widget.backgroundColor=Color.black()
}
Script.setWidget(widget) 
Script.complete()
widget.presentSmall()

/*
@@@@@@@@@@@@@@@@@@@@@@@@@@

Start functions

@@@@@@@@@@@@@@@@@@@@@@@@@@
*/
function addItem(item,itemValue){
  let itemStack = widget.addStack()
  let textStack = itemStack.addStack()
  itemStack.addSpacer()
  let symbolStack = itemStack.addStack()
  itemStack.layoutHorizontally()
  textStack.layoutVertically()
  symbolStack.layoutVertically()
  
  let val = textStack.addText(new Intl.NumberFormat().format(itemValue))
  val.font=Font.mediumRoundedSystemFont(12)
  val.textColor=Color.lightGray()
  const subt1 = textStack.addText(item) 
  subt1.font = Font.systemFont(9) 
  subt1.textColor = Color.white()
  
  //try to see if existing data exists for the item
  let oldValDict = getCachedData(item+'36')
  if (oldValDict==undefined){
    log(oldValDict)
    log(`line 67, trying to cache ${item} for the first time`)  
    //cache the data since it does not yet exist
    cacheData('36', item, itemValue)
    //get the data again since we know it now exists
    oldValDict = getCachedData(item+'36')
  }

  //log(oldValDict)
  let oldVal = oldValDict.value
  let oldDate = new Date(oldValDict.date)
  log(`line 74, oldVal is ${oldVal} and oldDate is ${dF.string(oldDate)}`)
  let delta36Time = (date.getTime() - oldDate.getTime())/1000/60/60 //Currently using difference in hours

  log(`delta36 time is ${delta36Time}`)
  if (delta36Time < 12)cacheData (12, item, itemValue)
  if (delta36Time > 36)
  {
    log(`delta36 time is greater than 36, moving cache from data 12 to data 36`)
    cacheData (36, item, getCachedData(item+'12').value,getCachedData(item+'12').date)
    cacheData (12, item, itemValue)
    
    oldValDict = getCachedData(item+'36')
    log(oldValDict)
    oldVal = oldValDict.value
    oldDate = new Date(oldValDict.date)
  }
  
  let trendColors = {'recovered':{up:Color.green().hex,down:Color.red().hex},'total cases':{up:Color.red().hex,down:Color.green().hex},'total deaths':{up:Color.red().hex,down:Color.green().hex},'active':{up:Color.red().hex,down:Color.green().hex}}

  const trend = getTrend(itemValue, oldVal)
  const trendSymbol = createSymbol(trend);
  const trendImg = symbolStack.addImage(trendSymbol);
  trendImg.resizable = false;
  trendImg.tintColor = (trend.includes('left') || !colorArrows)?Color.white():new Color(trendColors[item][trend.match(/[^\.]+$/)])
  if (useTransparency)val.textColor = trendImg.tintColor
  trendImg.imageSize = new Size(30, 20);
  widget.addSpacer(2)
}
    
function getCachedData(itemName) {
  if (!fileManager.fileExists(cacheFile)) {
    return undefined;
  }
  
  let contents = fileManager.readString(cacheFile);
  //log(`line 92, getting ${itemName}`)
  //log(`line 93, contents is ${contents}`)
  contents=JSON.parse(contents)
  if((itemName in contents)){
    //log(`line 96, ${itemName} exists, returning ${JSON.stringify(contents[itemName])}`)
    return contents[itemName]
  }else{  
    return undefined  
  }
  //return JSON.parse(contents);
}

function cacheData(hour,itemName,itemValue,dateToCache) {

  if (!fileManager.fileExists(cacheDirectory)) {
    fileManager.createDirectory(cacheDirectory);
  }
  let data
  if (fileManager.fileExists(cacheFile)){
    data=fileManager.readString(cacheFile)
    data=JSON.parse(data)
  }else{
    data={}
  }
  data[itemName+hour]={value:itemValue,date:(dateToCache!=undefined)?dateToCache:date.getTime()}
  //log(`line 120, ${data}`)
  data=JSON.stringify(data, null, ' ')
  //log(`line 122, ${data}`)
  fileManager.writeString(cacheFile, data);
}

function getTrend(newVal,storedVal) {
  const delta = storedVal - newVal;
  if (delta > 5) return "arrow.down";
  if (delta < -5) return "arrow.up";
  return "arrow.left.and.right";
}

function createSymbol(symbolName) {
  const symbol = SFSymbol.named(symbolName);
  symbol.applyFont(Font.systemFont(15));
  return symbol.image;
}

function checkForValueInJSON(item){
  //log(json[item])
  let out = (json[item]==null)?'0':json[item].toString()
  //log(out)
  return out
}
/*@@@@@@@@@@@@@@@@@@@@@@@@@@

End Functions
Begin Updater Function

@@@@@@@@@@@@@@@@@@@@@@@@@@*/
async function updateCheck(version){
  /*
  #####
  Update Check
  #####
  */   
  let uC   
  try{let updateCheck = new Request('https://raw.githubusercontent.com/mvan231/Scriptable/main/COVID%20Trend%20Widget/VersionInfo.json')
  uC = await updateCheck.loadJSON()
  }catch(e){return log(e)}
  log(uC)
  log(uC.version)
  let needUpdate = false
  if (uC.version != version){
    needUpdate = true
    log("Server version available")
    if (!config.runsInWidget)
    {
    log("running standalone")
    let upd = new Alert()
    upd.title="Server Version Available"
    upd.addAction("OK")
    upd.addDestructiveAction("Later")
    upd.add
    upd.message="Changes:\n"+uC.notes+"\n\nPress OK to get the update from GitHub"
      if (await upd.present()==0){
      Safari.open("https://raw.githubusercontent.com/mvan231/Scriptable/main/COVID%20Trend%20Widget/COVID%20Trend%20Widget.js")
      throw new Error("Update Time!")
      }
    } 
  }else{
    log("up to date")
  }
  
  return needUpdate
  /*
  #####
  End Update Check
  #####g
  */
}
