// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: cyan; icon-glyph: syringe;
let widget = new ListWidget()

const country = args.widgetParameter?args.widgetParameter:'Guatemala'

const API_URL = "https://coronavirus-19-api.herokuapp.com/countries/"+country;

const fileManager = FileManager.iCloud()
const cacheDirectory = fileManager.joinPath(fileManager.documentsDirectory(), "CovidWidget");
const cacheFile = fileManager.joinPath(cacheDirectory, country+'_data.json');

let req = new Request(API_URL) 
let json = await req.loadJSON()


//get the data from the JSON
let todayCases = json['todayCases'].toString() 
let todayDeaths = json['todayDeaths'].toString()
let recovered = json['recovered'].toString()
let active = json['active'].toString()
let deaths = json['deaths'].toString()
let cases = json['cases'].toString()
const date = new Date()
let dF = new DateFormatter()
dF.dateFormat='dd MMM yyyy'
const countryTx = widget.addText(country)
countryTx.font = Font.systemFont(15) 
countryTx.textColor=Color.white()
const widgetTitle = widget.addText(date.toLocaleDateString()) 
widgetTitle.font = Font.systemFont(13) 
widgetTitle.textColor=Color.white()

//add items to the widget
addItem('total cases', cases)
addItem('total deaths', deaths)
addItem('active', active)
addItem('recovered', recovered)
// addItem('cases today', todayCases)
// addItem('deaths today', todayDeaths)

// Finalize widget settings 
// widget.setPadding(16,16,16,16) 
widget.spacing = -2
//widget.backgroundImage=img
widget.backgroundColor=Color.black()
Script.setWidget(widget) 
Script.complete()
widget.presentSmall()
// widget.presentLarge()

/*
@@@@@@@@@@@@@

Start functions

@@@@@@@@@@@@@
*/
function addItem(item,itemValue){
  let itemStack = widget.addStack()
  let textStack = itemStack.addStack()
  itemStack.addSpacer()
  let symbolStack = itemStack.addStack()
  itemStack.layoutHorizontally()
  textStack.layoutVertically()
  symbolStack.layoutVertically()
  
  let val = textStack.addText(itemValue) 
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

  log(`delta 36 time is ${delta36Time}`)
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
  
  const trendSymbol = createSymbol(getTrend(itemValue, oldVal));
  const trendImg = symbolStack.addImage(trendSymbol);
  trendImg.resizable = false;
  trendImg.tintColor = Color.white();
  trendImg.imageSize = new Size(30, 20);
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