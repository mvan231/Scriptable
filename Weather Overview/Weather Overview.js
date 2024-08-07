// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: yellow; icon-glyph: bolt;
/*><><><><><><><><><><><><><><><><
Source of this script was originally from:
https://www.notion.so/Weather-Script-a5b503ffcd684b719e16f47cd82f7622 note:the linked script has been removed from Notion (not sure why or when)

modifications and new features added by mvan231
><><><><><><><><><><><><><><><><*/

/*><><><><><><><><><><><
---
version info
---
v1.8
- fixed issue with alert for settings
- settings file removal
v1.7
- updated to openweather 3.0 API
v1.6
- added code to handle iOS 16 offloading files (the JSON settings file to be exact)
- made adjustments to wind arrow placement
- remove ° from temperature display to allow more hours / days to be displayed
- (need to start) Add option for charting low and high temps as a line (for daily view)
- (need to start) add widget parameter option for hours of forecast to display
- added wind gust under the wind direction
- trying better city ID method for tap on widget url
- added new method to color wind arrows
><><><><><><><><><><><*/
//check for an update quick before building the widget
let needUpdated = await updateCheck(1.8)

/*><><><><><><><><><><><

Start of Setup

><><><><><><><><><><><*/
//let fm = FileManager.iCloud()
//let settingsPath = fm.documentsDirectory()+'/weatherOverviewSettings.JSON'
let a, settings ={}

settings = {"apiKey":"3b70d09bec54f8b555452513fd4be001","units":"imperial","showWindspeed":true,"showWindArrow":true,"showPrecipitation":true,"showCloudCover":true,"showHumidity":true,"showLegend":true,"showAlerts":true}

/*if(!config.runsInWidget && fm.fileExists(settingsPath)){
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
*/
/* REMOVED SETTINGS FILE DUE TO ICLOUD OFFLOADING ISSUES
// log(`stored in iCloud? ${fm.isFileStoredIniCloud(settingsPath)}\n\nfile exists ${fm.fileExists(settingsPath)}`)
if(fm.fileExists(settingsPath)){
  //if file exists check if it is downloaded. if not downloaded, then download the file// 
// log(`file is downloaded? ${fm.isFileDownloaded(settingsPath)}`)
  //file always showning as downloded even if it isnt.
  if(!fm.isFileDownloaded(settingsPath))fm.downloadFileFromiCloud(settingsPath)
  
  //log(fm.readString(settingsPath))
  settings = JSON.parse(fm.readString(settingsPath))
    
}
*/

//let set = await setup()

//settings variables initialization

//API key initialize
const API_KEY = settings.apiKey

//showWindspeed will enable/disable the windspeed display on the widget
const showWindspeed = settings.showWindspeed

//showWindArrow set to true will show a wind direction arrow. Set to false, and the cardinal direction will be displayed instead
const showWindArrow = settings.showWindArrow

//showPrecipitation will enable / disable the ability to display the precipitation information
const showPrecipitation = settings.showPrecipitation

//showCloudCover will enable / disable the line display of the cloud cover forecast
const showCloudCover = settings.showCloudCover

//showHumidity will enable/disable the line display of the humidity level
const showHumidity = settings.showHumidity

//showLegend will enable/disable the legend display at the top of the widget
let showLegend = settings.showLegend

//showAlerts will enable / disable the display of alerts in your area. A yellow warning triangle for each weather alert in your area will be displayed. Tapping the widget will take you to the OpenWeather page in Safari. 
const showAlerts = settings.showAlerts

//units can be set to imperial or metric for your preference
const units = settings.units//"imperial"//"metric"

//locationNameFontSize determines the size of the location name at the top of the widget
const locationNameFontSize = 18

/*
><><><><><><><><><><><

End of Setup

><><><><><><><><><><><
*/


//param must be == 'daily' for the daily forecast to be shown. Below, thr variable 'param' is set to the widgetParameter, which can be modified when choosing the script from thr widget configurator screen. 
let param = args.widgetParameter

//the commented code on the line below will force the daily display to be shown
//param='daily'

if(config.widgetFamily=='small')showLegend=false

let windDirs = {"9":"ESE","25":"WNW","18":"SSW","10":"ESE","26":"WNW","19":"SW","11":"SE","27":"NW","0":"N","12":"SE","1":"NNE","28":"NW","20":"SW","2":"NNE","13":"SSE","3":"NE","21":"WSW","14":"SSE","4":"NE","29":"NNW","5":"ENE","15":"S","22":"WSW","6":"ENE","30":"NNW","23":"W","7":"E","16":"S","31":"N","8":"E","17":"SSW","24":"W","32":"N"}

let windArrows = {"ESE":"arrow.up.left","SSE":"arrow.up","S":"arrow.up","WSW":"arrow.up.right","W":"arrow.right","WNW":"arrow.down.right","SSW":"arrow.up","SW":"arrow.up.right","SE":"arrow.up.left","NW":"arrow.down.right","N":"arrow.down","NNE":"arrow.down","NNW":"arrow.down","NE":"arrow.down.left","ENE":"arrow.down.left","E":"arrow.left"}

let localFm = FileManager.local()
let cachePath = localFm.documentsDirectory()

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
const LAT = latLong.latitude
const LON = latLong.longitude

//now using try catch for reverseGeocoding in case of no response
try{
  var response = await Location.reverseGeocode(LAT, LON)
  var LOCATION_NAME = response[0].postalAddress.city
}catch(e){
  //need to add info here to grabbed cached location name
  var LOCATION_NAME = 'Cached Data'

}

const locale = "en"
const nowstring = (param=='daily')?"Today" : "Now"
const feelsstring = ""
const relHumidity = ""
const pressure = ""

const twelveHours = false
const roundedGraph = false
const roundedTemp = true
const hoursToShow = (config.widgetFamily == "small") ? 3 : (param == 'daily') ? 6 : 14//11;
const spaceBetweenDays = (config.widgetFamily == "small") ? 60 : (param == 'daily') ? 76 : 35//44;

const show24Hours = true
if (!show24Hours) {
  hour = (hour > 12 ? hour - 12 : (hour == 0 ? "12a" : ((hour == 12) ? "12p" : hour)))
}

const contextSize = 282
const mediumWidgetWidth = 584

const accentColor = new Color(Color.green().hex/*"#ffa300""#B8B8B8"*/, 1)
const backgroundColor = new Color("#000000", 1)

const locationNameCoords = new Point(30, showWindspeed?5:25)//25)

const xStart = /*(config.widgetFamily=='small')? 35 :*/ 30
const barWidth = spaceBetweenDays - (config.widgetFamily == 'small'?8:4)

let cityId,weatherData,percentageLinesDrawn;
let usingCachedData = false;
let drawContext = new DrawContext();

drawContext.size = new Size((config.widgetFamily == "small") ? contextSize : mediumWidgetWidth, contextSize)
drawContext.opaque = false
drawContext.setTextAlignedCenter()

if(config.widgetFamily == 'large')throw new Error('This widget is not designed for the large size widget, try medium or small instead')

let cache = localFm.joinPath(cachePath, "lastread")

//new cityId method
try{
  log("start cityId method")
  currentData = await new Request(`https://api.openweathermap.org/data/2.5/weather?lat=${LAT}&lon=${LON}&appid=${API_KEY}`).loadJSON()
  log(currentData)
  cityId = currentData.id
  log(`cityId is ${cityId}`)
}catch(e){
  log("couldnt get current data")
}

try {
  log('trying to get data from API')
  weatherData = await new Request("https://api.openweathermap.org/data/3.0/onecall?lat=" + LAT + "&lon=" + LON + "&exclude=minutely&units=" + units + "&lang=" + locale + "&appid=" + API_KEY).loadJSON()
  localFm.writeString(cache, JSON.stringify(weatherData))
} catch(e) {
  console.log("Offline mode")
  let raw = localFm.readString(cache);
  weatherData = JSON.parse(raw);
  usingCachedData = true
}

log(JSON.stringify(weatherData, null, 2))
let widget = new ListWidget();
widget.setPadding(0, 0, 0, 0);
widget.backgroundColor = backgroundColor;


let mvDate = new Date()
let mvDf = new DateFormatter
mvDf.dateFormat = 'MMM d'

//check for alerts, if present and if enabled, show them
let wAlerts=''
if ('alerts' in weatherData && showAlerts){
  weatherData.alerts.forEach((f)=>{
    wAlerts += '⚠️'
  })
}

drawText(LOCATION_NAME+', '+mvDf.string(mvDate)+wAlerts+(needUpdated?' Update!':''), locationNameFontSize, locationNameCoords.x, locationNameCoords.y, (needUpdated?Color.cyan() : Color.white()))//accentColor);

let min, max, diff;
for (let i = 0; i <= hoursToShow; i++) {
  let temp = shouldRound(roundedGraph, (param=='daily'?weatherData.daily[i].temp.max : weatherData.hourly[i].temp));
  min = (temp < min || min == undefined ? temp : min)
  max = (temp > max || max == undefined ? temp : max)
}
diff = max -min;


let mmToInch = units=='imperial'? 394/10000:1

//start cloud cover line
if(showCloudCover){
  if(!percentageLinesDrawn){
    drawPercentageLines()
    percentageLinesDrawn = true
  }
  hourData = (param=='daily')?weatherData.daily:weatherData.hourly;
  for (let i = 0; i < hoursToShow; i++) {

    let cloudCover = (param!='daily' && i==0)?weatherData.current.clouds : hourData[i].clouds
    let cloudCoverNext = hourData[i+1].clouds
    let yPos = 220-(((220-60)/100) * cloudCover)
    let yPosNext = 220-(((220-60)/100) * cloudCoverNext)
    drawLine(spaceBetweenDays * (i) + xStart + (barWidth/2), yPos/*175 - (50 * delta)*/,(spaceBetweenDays * (i + 1)) + xStart + (barWidth/2), yPosNext/*175 - (50 * nextDelta)*/, 1,new Color(Color.white().hex,0.9))
  }
  if(showLegend)drawTextC("cld", 16, ((config.widgetFamily == "small") ? contextSize : mediumWidgetWidth) - 310,showWindspeed?5:25,180,20,new Color(Color.white().hex,0.9))
}
//end cloud cover line

//start humidity line
if(showHumidity){
  if(!percentageLinesDrawn){
    drawPercentageLines()
    percentageLinesDrawn = true
  }
  hourData = (param=='daily')?weatherData.daily:weatherData.hourly;
  for (let i = 0; i < hoursToShow; i++) {

    let humidity = (param!='daily' && i==0)?weatherData.current.humidity : hourData[i].humidity
    let humidityNext = hourData[i+1].humidity
    let yPos = 220-(((220-60)/100) * humidity)
    let yPosNext = 220-(((220-60)/100) * humidityNext)
    drawLine(spaceBetweenDays * (i) + xStart + (barWidth/2), yPos/*175 - (50 * delta)*/,spaceBetweenDays * (i + 1) + xStart + (barWidth/2), yPosNext/*175 - (50 * nextDelta)*/, 1,new Color(Color.magenta().hex,0.9))

  }
  if(showLegend)drawTextC("hum", 16, mediumWidgetWidth - 275,showWindspeed?5:25,180,20,new Color(Color.magenta().hex,0.9))
}
//end humidity line


//start adding precipitation POP and amount
if(showPrecipitation){
  if(!percentageLinesDrawn){
    drawPercentageLines()
    percentageLinesDrawn = true
  }



  //gather precipitation data
  var maxPrecip,precips = []

  maxPrecip = units=='imperial'? param=='daily'?0.8:0.2:param=='daily'?20:5

  drawAmountLabels()

  hourData = (param=='daily')?weatherData.daily:weatherData.hourly;
  hourData.map(function(item,index){
    if(index <= hoursToShow){
      let itemT = ('rain' in item)?'rain':('snow' in item)?'snow':false
      if(itemT){
        if (typeof item[itemT] === 'object' && '1h' in item[itemT])
        {
          let amount = item[itemT]
          item[itemT]=amount['1h']
    
          weatherData.hourly[index]=item
        }
        if(itemT) precips.push((item[itemT]*mmToInch).toFixed(2))
      }
    }
  })

  for (let i = 0; i <= hoursToShow; i++) {
    //mm to inch factor = 394/10000 //factor is 0.0394 mm to 1 inch
    let rain = 'rain' in hourData[i]
    if(rain)rain = Number(hourData[i].rain * mmToInch).toFixed(2)
    let snow = ('snow' in hourData[i])
    if(snow)snow = Number(hourData[i].snow * mmToInch).toFixed(2)
    let pop = hourData[i].pop * 100
    let barH = ((220-60)/100) * pop
    let precipAmount,precipType
    var precipAmountColor
	
    //if there is amount of snow or rain, plot them with bars. 
    //if(snow>0|rain>0){//always drawing amount column
       precipAmount = snow?snow:rain
       if(precipAmount>maxPrecip)precipAmount=maxPrecip
       precipType = snow?'snow':'rain'
	  precipAmountColor = (precipType == 'snow')?'FFFFFF':'6495ED'
      let precipBarH = ((220-60)/100)*(100*(precipAmount/maxPrecip))
      //draw the amount of precipitation with the bar info calculated above 
	 drawPOP((spaceBetweenDays * i)+(barWidth*0.5),precipBarH, barWidth*0.5, precipAmountColor,0.8)
     
      //add label for amount
      if(showLegend)drawTextC("precAmt", 16, ((config.widgetFamily == "small") ? contextSize : mediumWidgetWidth) - 150,showWindspeed?5:25,180,20,new Color(precipAmountColor,0.8))

    //}
    //draw the percentage of precipitation bar with the cyan blue color. If there is precipitation amount for the current timeframe, then use halfwidth, if not, use fullwidth
    drawPOP(spaceBetweenDays * i,barH, barWidth*0.5/**(precipAmount?0.5:1)*/, '1fb2b7',0.6)//0.8)//value reduced
  }

  //add label for percentage
  if(showLegend)drawTextC("precPrb", 16, ((config.widgetFamily == "small") ? contextSize : mediumWidgetWidth) - 220,showWindspeed?5:25,180,20,new Color('1fb2b7',0.9))

}
//end adding precipitation POP and amount
  
  
//start adding dates/times and temperatures (and wind if enabled)
drawContext.setTextAlignedCenter()

  
for (let i = 0; i <= hoursToShow; i++) {
  let hourData = (param=='daily')?weatherData.daily[i]:weatherData.hourly[i];
  let nextHourTemp = shouldRound(roundedGraph, (param=='daily')?weatherData.daily[i+1]['temp']['max']:  weatherData.hourly[i + 1].temp);
  let dF = new DateFormatter()
  dF.dateFormat = 'eee'
  let hour = (param=='daily')?dF.string(epochToDate(hourData.dt))+' '+epochToDate(hourData.dt).getDate():epochToDate(hourData.dt).getHours();
  if (twelveHours && (param!='daily'))
    hour = (hour > 12 ? hour - 12 : (hour == 0 ? "12a" : ((hour == 12) ? "12p" : hour)))
  let temp = (param=='daily')?hourData.temp.max : (i == 0) ? weatherData.current.temp : hourData.temp
  if(param=='daily'){
    var lowTemp = shouldRound(roundedTemp,hourData.temp.min)
  }
  
  let delta = (diff > 0) ? (shouldRound(roundedGraph, temp) - min) / diff : 0;
  let nextDelta = (diff>0) ? (nextHourTemp - min) / diff : 0
  temp = shouldRound(roundedTemp, temp)
  if (i < hoursToShow) {
    let hourDay = epochToDate(hourData.dt);
    for (let i2 = 0 ; i2 < weatherData.daily.length; i2++)  {
      let day = weatherData.daily[i2];
      if (isSameDay(epochToDate(day.dt), epochToDate(hourData.dt))) {
        hourDay = day;
        break;
      }
    }
  
    //check if it is day / night
    now = new Date()
    var night = (hourData.dt > hourDay.sunset || hourData.dt < hourDay.sunrise || (i == 0 && (now.getTime > weatherData.current.sunset || now.getTime < weatherData.current.sunrise)))

    var freezing = (units=='imperial'?32:0)
    var tempColor = (temp>freezing)?Color.orange():Color.blue()
    
    if(param == "daily" && lowTemp){
      var lowTempColor = (lowTemp>freezing)?Color.orange():Color.blue()
    }

    drawLine(spaceBetweenDays * (i) + xStart + (barWidth/2)/*spaceBetweenDays * (i) + barWidth*/, 175 - (50 * delta),spaceBetweenDays * (i + 1) + xStart + (barWidth/2), 175 - (50 * nextDelta), 2,tempColor) //Color.gray())// (night ? Color.gray() : accentColor))
  }

  drawTextC(temp + "", 18, spaceBetweenDays * i + xStart, 130 - (50 * delta), barWidth /*50*/, 18, tempColor)
  
  if(param == "daily" && lowTemp){
    var lowTempColor = (lowTemp>freezing)?Color.orange():Color.blue()
    drawTextC(lowTemp + "", 18, spaceBetweenDays * i + xStart, (130 - (50 * delta))+ 65, barWidth /*50*/, 18, lowTempColor)
  }
  
  let imageSpace = config.widgetFamily == 'small'? 42 : (param =='daily')?48:34
  //if showWindSpeed is enabled, get the wind data and display it
  if(showWindspeed){
    let hourWindDir = hourData.wind_deg
    let dir = (hourWindDir-(hourWindDir%11.25))/11.25
    dir = windDirs[dir]
    //dir is now the cardinal direction of the wind source
    let windSpeed = Math.round(hourData.wind_speed)
    let windGust = Math.round(hourData.wind_gust)
    
    //add wind direction arrow
    if(showWindArrow){
      //add wind directional arrow
      drawContext.setFillColor(accentColor)
      drawContext.fillEllipse(new Rect(spaceBetweenDays * i + (xStart + (barWidth/2))/*imageSpace*/- (16/2)/*((config.widgetFamily=='small')? 48 : (param=='daily'?58:42))*/, 44/*220 - 16*/,16,16))

      let symb = SFSymbol.named(windArrows[dir])
      symb.applyFont(Font.systemFont(14))
      
      symb=await tintSFSymbol(symb.image, Color.black())

      
      //drawImage(symb, spaceBetweenDays * i + (xStart + (barWidth/2)) - (16/2),45)
      drawContext.drawImageInRect(symb, new Rect(spaceBetweenDays * i + (xStart + (barWidth/2)) - (16/2) +1, 44+1, 16-2, 16-2))
      //drawImage(symb, spaceBetweenDays * i + (config.widgetFamily=='small'? 49 : param=='daily'?59:43), 45/*220 - 15*/)
    }else{
      //place wind cardinal direction
      drawTextC(dir, 14, spaceBetweenDays * i + 30, 44/*220 - 18*/, barWidth /*50*/, 20)//, Color.white())  
    }
    //place wind speed
    drawTextC(windSpeed, 14, spaceBetweenDays * i + 30, 29/*220 - 32*/, barWidth /*50*/, 20,Color.white())
    
    drawTextC(windGust, 14, spaceBetweenDays * i + 30, 59/*220 - 32*/, barWidth /*50*/, 20,Color.white())
  }

  const condition = i == 0 ? weatherData.current.weather[0].id : hourData.weather[0].id
 /* if(Device.systemVersion().match(/^../)==15){
    drawContext.setFillColor(new Color(Color.white().hex,0.9))
    drawContext.fillEllipse(new Rect(spaceBetweenDays * i + (xStart + (barWidth/2)) - (36 / 2), 158 - (50 * delta),36,36))  
  }*/
  
  //addSymbol
  drawImage(symbolForCondition(condition), (spaceBetweenDays * i) + xStart + (barWidth/2) - (32/2)/*spaceBetweenDays * i + imageSpace*/, 160 - (50 * delta));
  
  let dayHourColor = (param=='daily')?Color.white():night?Color.gray():Color.white()
  
  let hourText = (hour >= 0 && hour <= 9)?`0${hour}`:hour

  drawTextC((i == 0 ? nowstring : hourText), 18, spaceBetweenDays * i + xStart, 234, barWidth, 20,dayHourColor)
  previousDelta = delta;
}

widget.backgroundImage = (drawContext.getImage())
widget.url = cityId?`https://openweathermap.org/city/${cityId}`
:'https://openweathermap.org'
Script.complete()
widget.presentMedium()


/*
<><><><><><><><><>

start functions

<><><><><><><><><>
*/

function epochToDate(epoch) {
  return new Date(epoch * 1000)
}

function drawPercentageLines() {
  //draw lines and labels at 100% (xStart, 60) and 0% (xStart, 220). additional 25, 50, and 75 also added.
  let pa = new Path()
  for (let i = 0; i<=4; i++){
    yPt = (((220-60)/4)*i)+60
    pa.move(new Point(xStart, yPt))
    pa.addLine(new Point((spaceBetweenDays*hoursToShow)+xStart+barWidth, yPt))
    drawContext.setTextAlignedRight()
    drawContext.setTextColor(Color.lightGray())
    tex = String(100-(i*25))+'%'
    drawContext.setFont(Font.boldSystemFont(10))
    drawContext.drawTextInRect(String(tex), new Rect(0, yPt-6, 30, 10))

  }  
  drawContext.addPath(pa)
  drawContext.setStrokeColor(Color.lightGray())
  drawContext.strokePath()
}

function drawAmountLabels() {
  //draw lines and labels at precipitation amount positions.
  let pa = new Path()
  for (let i = 0; i<=4; i++){
    yPt = (((220-60)/4)*i)+60
    drawContext.setTextAlignedLeft()
    drawContext.setTextColor(Color.lightGray())
    tex = String((maxPrecip-(i*(maxPrecip/4))).toFixed(2))
    drawContext.setFont(Font.boldSystemFont(10))
    drawContext.drawTextInRect(String(tex), new Rect((spaceBetweenDays*hoursToShow)+xStart+barWidth, yPt-6, 30, 10))
  }  
  drawContext.addPath(pa)
  drawContext.setStrokeColor(Color.lightGray())
  drawContext.strokePath()
}

function drawText(text, fontSize, x, y, color = Color.black()) {
  drawContext.setFont(Font.boldSystemFont(fontSize))
  drawContext.setTextColor(color)
  drawContext.drawText(new String(text).toString(), new Point(x, y))
}

function drawImage(image, x, y) {
  drawContext.drawImageAtPoint(image, new Point(x, y))
}

function drawPOP(/*POP,*/ x, barH, barW,color,alpha=1){
  drawContext.setFillColor(new Color(color,alpha))//'1fb2b7''0A84FF',0.85 0.45))
  let y = 220 - barH
  if(barH > 0)drawContext.fillRect(new Rect(x+xStart,y,barW, barH))
}

function drawTextC(text, fontSize, x, y, w, h, color = Color.black()) {
  drawContext.setTextAlignedCenter()
  drawContext.setFont(Font.boldSystemFont(fontSize))
  if (text == "Now") {
     drawContext.setTextColor(color)
  } else {
     drawContext.setTextColor(color/*new Color("#B8B8B8", 1)*/)
  }
  drawContext.drawTextInRect(new String(text).toString(), new Rect(x, y, w, h))
}

function drawLine(x1, y1, x2, y2, width, color) {
  const path = new Path()
  path.move(new Point(x1, y1))
  path.addLine(new Point(x2, y2))
  drawContext.addPath(path)
  drawContext.setStrokeColor(color)
  drawContext.setLineWidth(width)
  drawContext.strokePath()
}

function shouldRound(should, value) {
  return ((should) ? Math.round(value) : value)
}

function isSameDay(date1, date2) {
  return (date1.getYear() == date2.getYear() && date1.getMonth() == date2.getMonth() &&  date1.getDate() == date2.getDate())
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
  sfs.applyFont(Font.systemFont(25))
  return sfs.image
}

async function updateCheck(version){
  /*
  #####
  Update Check
  #####
  */   
  let uC   
  try{let updateCheck = new Request('https://raw.githubusercontent.com/mvan231/Scriptable/main/Weather%20Overview/WeatherOverview.json')
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
    upd.message="Changes:\n"+uC.notes+"\n\nPress OK to get the update from GitHub"
      if (await upd.present()==0){
        let r = new Request('https://raw.githubusercontent.com/mvan231/Scriptable/main/Weather%20Overview/Weather%20Overview.js')
        let updatedCode = await r.loadString()
        let fm = FileManager.iCloud()
        let path = fm.joinPath(fm.documentsDirectory(), `${Script.name()}.js`)
        log(path)
        fm.writeString(path, updatedCode)
        throw new Error("Update Complete!")
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

async function setup(full){

//log(settings)
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

  let quests = [{'key':'showWindspeed',
  'q':'Do you want display the windspeed on the widget?'},
  {'key':'showWindArrow','q':'If using windspeed, do you want to display the wind direction as an arrow?'},
  {'key':'showPrecipitation','q':'Do you want to display precipitation information?'},
  {'key':'showCloudCover','q':'Do you want to show the line display of the cloud cover?'},
  {'key':'showHumidity','q':'Do you want to show the line display of the humidity level?'},
  {'key':'showLegend','q':'Do you want to display the legend at the top of the widget?'},
  {'key':'showAlerts','q':'Do you want to show alerts in your area? A yellow warning triangle for each weather alert in your area will be displayed. Tapping the widget will take you to the OpenWeather page in Safari.'}]

  await quests.reduce(async (memo,i)=>{
    await memo

    if(!(i.key in settings)){
      let q = new Alert()
      q.message=String(i.q)
      q.title='Setup'
      q.addAction('Yes')
      q.addAction('No')
      a=await q.presentSheet()
      settings[i.key]=(a==0)?true:false
    }
  },undefined)  
  log(JSON.stringify(settings))
  fm.writeString(settingsPath, JSON.stringify(settings))
  return true
}

async function tintSFSymbol(image, color) {
  let html = `
  <img id="image" src="data:image/png;base64,${Data.fromPNG(image).toBase64String()}" />
  <canvas id="canvas"></canvas>
  `;
  
  let js = `
    let img = document.getElementById("image");
    let canvas = document.getElementById("canvas");
    let color = 0x${color.hex};

    canvas.width = img.width;
    canvas.height = img.height;
    let ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    let imgData = ctx.getImageData(0, 0, img.width, img.height);
    // ordered in RGBA format
    let data = imgData.data;
    for (let i = 0; i < data.length; i++) {
      // skip alpha channel
      if (i % 4 === 3) continue;
      // bit shift the color value to get the correct channel
      data[i] = (color >> (2 - i % 4) * 8) & 0xFF
    }
    ctx.putImageData(imgData, 0, 0);
    canvas.toDataURL("image/png").replace(/^data:image\\/png;base64,/, "");
  `;
  
  let wv = new WebView();
  await wv.loadHTML(html);
  let base64 = await wv.evaluateJavaScript(js);
  return Image.fromData(Data.fromBase64String(base64));
}