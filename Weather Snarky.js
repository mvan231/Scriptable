// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: yellow; icon-glyph: bolt;
/*><><><><><><><><><><><><><><><><

weather smarky widget by mvan231

><><><><><><><><><><><><><><><><*/

/*><><><><><><><><><><><
---
version info
---
v1.0

><><><><><><><><><><><*/

/*><><><><><><><><><><><

Start of Setup

><><><><><><><><><><><*/

const hotTempThresh = 85

const coldTempThresh = 32

let coldSnark=["It's a bit nipply!","Better grab a jacket!","Oh F, it's cold AF!","Don't expect to be comfortable outisde today!"]

let hotSnark = ["Get ready to boil!","Get your ice pack ready!","Don't expect to be comfortable outisde today!"]

let normalSnark = ["Don't let the temperature fool you, today could still suck!","It should be comfortable outside!", "Looks nice out, enjoy the day!", "If today has one thing going for it, it's comfortable outside."]

let fm = FileManager.iCloud()
let settingsPath = fm.documentsDirectory()+'/weatherSnarkySettings.JSON'

let localFm = FileManager.local()
let cachePath = localFm.cacheDirectory()

let a, settings ={}

if(!config.runsInWidget && fm.fileExists(settingsPath)){
    let resetQ = new Alert()
    resetQ.title='Want to reset?'
    resetQ.message='If you tap "Yes" below, the settings for this widget will be reset and setup will run again'  
    resetQ.addAction('Yes')
    resetQ.addAction('No')
    a = await resetQ.presentSheet()
    if(a=='0'){
      await fm.remove(settingsPath)
    }
}
if(fm.fileExists(settingsPath))settings = JSON.parse(fm.readString(settingsPath))
let set = await setup()


//settings variables initialization

//API key initialize
const API_KEY = settings.apiKey

//units can be set to imperial or metric for your preference
const units = settings.units//"imperial"//"metric"

/*
><><><><><><><><><><><

End of Setup

><><><><><><><><><><><
*/

let windDirs = {"9":"ESE","25":"WNW","18":"SSW","10":"ESE","26":"WNW","19":"SW","11":"SE","27":"NW","0":"N","12":"SE","1":"NNE","28":"NW","20":"SW","2":"NNE","13":"SSE","3":"NE","21":"WSW","14":"SSE","4":"NE","29":"NNW","5":"ENE","15":"S","22":"WSW","6":"ENE","30":"NNW","23":"W","7":"E","16":"S","31":"N","8":"E","17":"SSW","24":"W","32":"N"}

let windArrows = {"ESE":"arrow.up.left","SSE":"arrow.up","S":"arrow.up","WSW":"arrow.up.right","W":"arrow.right","WNW":"arrow.down.right","SSW":"arrow.up","SW":"arrow.up.right","SE":"arrow.up.left","NW":"arrow.down.right","N":"arrow.down","NNE":"arrow.down","NNW":"arrow.down","NE":"arrow.down.left","ENE":"arrow.down.left","E":"arrow.left"}

var latLong = {},locFound = false
try {
  log('getting location...')
  Location.setAccuracyToKilometer()
  latLong = await Location.current()  
  localFm.writeString(cachePath+'/locCache.json', JSON.stringify(latLong))   
  log('new location cached...')
  locFound=true  
} catch(e) {
    log("couldn't get live location, trying to read from file")
}
if(!locFound){
  try{
      latLong = JSON.parse(await localFm.readString(cachePath+'/locCache.json'))
      log('using cached location')
  }catch(e2){    
      log(e2+" could not get location")
      throw new Error("Could not get location live or from file")
  }
}
log(latLong)

const LAT = latLong.latitude, LON = latLong.longitude
var LOCATION_NAME

try{  
  var response = await Location.reverseGeocode(LAT, LON)
  LOCATION_NAME = response[0].postalAddress.city
  localFm.writeString(localFm.joinPath(cachePath, "weatherCity.txt"),LOCATION_NAME)
}catch(e6){
  LOCATION_NAME = localFm.readString(cachePath+"/weatherCity.txt")
}

const locale = "en"
let weatherData, usingCachedData = false

try {
  weatherData = await new Request("https://api.openweathermap.org/data/2.5/onecall?lat=" + LAT + "&lon=" + LON + "&exclude=minutely&units=" + units + "&lang=" + locale + "&appid=" + API_KEY).loadJSON();
  localFm.writeString(localFm.joinPath(cachePath, "lastread" + "_" + LAT + "_" + LON +".JSON"), JSON.stringify(weatherData))
} catch(e) {
  console.log("Offline mode")
  try {
    await localFm.downloadFileFromiCloud(fm.joinPath(cachePath, "lastread" + "_" + LAT + "_" + LON+".JSON"));
    let raw = localFm.readString(fm.joinPath(cachePath, "lastread"+"_"+LAT+"_"+LON+".JSON"));
    weatherData = JSON.parse(raw);
    usingCachedData = true;
  } catch(e2) {
    console.log("Error: No offline data cached")
  }
}
let widget = new ListWidget();

let mvDate = new Date()
let mvDf = new DateFormatter
mvDf.dateFormat = 'MMM d'

let curTemp = weatherData.current.temp.toFixed(1)

let topStack = widget.addStack()
let left = topStack.addStack()
let right = topStack.addStack()

let cityText = left.addText(LOCATION_NAME + String(" "+curTemp)+'°')

let img = right.addImage(symbolForCondition(weatherData.current.weather[0].id))
img.tintColor = Color.green()
right.size = new Size(20,0)

// log(weatherData.current)
let messageText = normalSnark[Math.floor(Math.random() * normalSnark.length)]

if (curTemp >= hotTempThresh) messageText = hotSnark[Math.floor(Math.random() * hotSnark.length)]

if (curTemp <= coldTempThresh) messageText = hotSnark[Math.floor(Math.random() * coldSnark.length)]

let message = widget.addText(messageText)

widget.url = 'https://openweathermap.org'
Script.complete()
Script.setWidget(widget)
widget.presentSmall()
// widget.presentMedium()

/*
<><><><><><><><><>

start functions

<><><><><><><><><>
*/

function epochToDate(epoch) {
  return new Date(epoch * 1000)
}

function symbolForCondition(cond) {
  let symbols = {
    "2": function() {
      return "cloud.bolt.rain.fill"
    },
    "3": function() {
      return "cloud.drizzle.fill"
    },
    "5": function() {
      return (cond == 511) ? "cloud.sleet.fill" : "cloud.rain.fill"
    },
    "6": function() {
      return (cond >= 611 && cond <= 613) ? "cloud.snow.fill" : "snow"
    },
    "7": function() {
      if (cond == 781) { return "tornado" }
      if (cond == 701 || cond == 741) { return "cloud.fog.fill" }
      return night ? "cloud.fog.fill" : "sun.haze.fill"
    },
    "8": function() {
      if (cond == 800) { return night ? "moon.stars.fill" : "sun.max.fill" }
      if (cond == 802 || cond == 803) { return night ? "cloud.moon.fill" : "cloud.sun.fill" }
      return "cloud.fill"
    }
  }
  let conditionDigit = Math.floor(cond / 100)
  let sfs = SFSymbol.named(symbols[conditionDigit]())
  sfs.applyFont(Font.systemFont(70))
  return sfs.image
}

async function setup(full){
  if (!('apiKey' in settings) || settings.apiKey == ""){
    let q = new Alert()
    q.title='API Key'
    q.message='Please paste in your OpenWeatherMap API Key'   
    q.addTextField('API Key',Pasteboard.paste())
    q.addAction("Done")
    await q.present()
    if(q.textFieldValue(0).length < 1)throw new Error("You must enter an API Key, please copy to clipboard and try again")
    settings.apiKey = q.textFieldValue(0)
    //write the settings to iCloud Drive  
    fm.writeString(settingsPath, JSON.stringify(settings))    
  }

  if (!('units' in settings)){
    let q = new Alert()
    q.title="Units"
    q.addAction("Imperial")
    q.addAction("Metric")
    a=await q.presentSheet()
    settings['units'] = (a==0)?'imperial':'metric'
  }

  fm.writeString(settingsPath, JSON.stringify(settings))
  return true
}