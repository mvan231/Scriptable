// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: yellow; icon-glyph: bolt;
// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: light-brown; icon-glyph: magic;
/*
><><><><><><><><><><><><><><><><

Source of this script was originally from:

https://www.notion.so/Weather-Script-a5b503ffcd684b719e16f47cd82f7622
note:link above has been removed

modifications and new festures added by mvan231

><><><><><><><><><><><><><><><><
*/

const showWindspeed = true
const showWindArrow = true
const showPrecipitation = true
const showAlerts = true

const API_KEY = "23a34c5bc88f572c71be71122e96c725"

let param = args.widgetParameter
//param='daily'
//param must be 'daily' for the daily forecast to be shown

let windDirs = {"9":"ESE","25":"WNW","18":"SSW","10":"ESE","26":"WNW","19":"SW","11":"SE","27":"NW","0":"N","12":"SE","1":"NNE","28":"NW","20":"SW","2":"NNE","13":"SSE","3":"NE","21":"WSW","14":"SSE","4":"NE","29":"NNW","5":"ENE","15":"S","22":"WSW","6":"ENE","30":"NNW","23":"W","7":"E","16":"S","31":"N","8":"E","17":"SSW","24":"W"}

let windArrows = {"ESE":"arrow.up.left","SSE":"arrow.up","S":"arrow.up","WSW":"arrow.up.right","W":"arrow.right","WNW":"arrow.down.right","SSW":"arrow.up","SW":"arrow.up.right","SE":"arrow.up.left","NW":"arrow.down.right","N":"arrow.down","NNE":"arrow.down","NNW":"arrow.down","NE":"arrow.down.left","ENE":"arrow.down.left","E":"arrow.left"}

let fm = FileManager.local()
let cachePath = fm.documentsDirectory()

var latLong = {},locFound = false
try {
  log('getting location...')
  //throw new Error('hi')
  latLong = await Location.current()  
  fm.writeString(cachePath+'/locCache.json', JSON.stringify(latLong))   
  log('location cached...')
  locFound=true  
} catch(e) {
    log("couldn't get live location, trying to read from file")
}
if(!locFound){
  try{
      latLong = JSON.parse(await fm.readString(cachePath+'/locCache.json'))
      log('using cached location')
  }catch(e2){    
      log(e2+" could not get location")
      throw new Error("Could not get location live or from file")
  }
}
log(latLong)
const LAT = latLong.latitude
const LON = latLong.longitude

var response = await Location.reverseGeocode(LAT, LON)
var LOCATION_NAME = response[0].postalAddress.city

const locale = "en"
const nowstring = (param=='daily')?"Today " : "Now"
const feelsstring = ""
const relHumidity = ""
const pressure = ""

const units = "imperial"//"metric"
const twelveHours = false
const roundedGraph = false
const roundedTemp = true
const hoursToShow = (config.widgetFamily == "small") ? 3 : (param == 'daily') ? 6 : 11;
const spaceBetweenDays = (config.widgetFamily == "small") ? 60 : (param == 'daily') ? 76 : 44;

const show24Hours = true
if (!show24Hours) {
  hour = (hour > 12 ? hour - 12 : (hour == 0 ? "12a" : ((hour == 12) ? "12p" : hour)))
}

const contextSize = 282
const mediumWidgetWidth = 584

const accentColor = new Color(Color.green().hex/*"#ffa300""#B8B8B8"*/, 1)
const backgroundColor = new Color("#000000", 1)

const locationNameCoords = new Point(30, 25)
const locationNameFontSize = 24
//const weatherDescriptionCoords = new Point(30, 52)
//const weatherDescriptionFontSize = 18
//const footerFontSize = 18
//const feelsLikeCoords = new Point(28, 230)
//const lastUpdateTimePosAndSize = new Rect((config.widgetFamily == "small") ? 150 : 450, 230, 100, footerFontSize + 1)

const xStart = 30
const barWidth = spaceBetweenDays-4




let weatherData;
let usingCachedData = false;
let drawContext = new DrawContext();

drawContext.size = new Size((config.widgetFamily == "small") ? contextSize : mediumWidgetWidth, contextSize)
drawContext.opaque = false
drawContext.setTextAlignedCenter()

try {
  weatherData = await new Request("https://api.openweathermap.org/data/2.5/onecall?lat=" + LAT + "&lon=" + LON + "&exclude=minutely&units=" + units + "&lang=" + locale + "&appid=" + API_KEY).loadJSON();
} catch(e) {
  console.log("Offline mode")
  try {
    await fm.downloadFileFromiCloud(fm.joinPath(cachePath, "lastread" + "_" + LAT + "_" + LON));
    let raw = fm.readString(fm.joinPath(cachePath, "lastread"+"_"+LAT+"_"+LON));
    weatherData = JSON.parse(raw);
    usingCachedData = true;
  } catch(e2) {
    console.log("Error: No offline data cached")
  }
}

//log(JSON.stringify(weatherData, null, 2))
let widget = new ListWidget();
widget.setPadding(0, 0, 0, 0);
widget.backgroundColor = backgroundColor;

/*
><><><><><><><><><><><

Begin of date Modification by mvan231

><><><><><><><><><><><
*/
let mvDate = new Date()
let mvDf = new DateFormatter
mvDf.dateFormat = 'MMM d'


/*
><><><><><><><><><><><

End of date Modification by mvan231

><><><><><><><><><><><
*/

//check for alerts, if present and if enabled, show them
let wAlerts=''
if ('alerts' in weatherData && showAlerts){
  weatherData.alerts.forEach((f,index)=>{
    wAlerts += '⚠️'
  })
}

drawText(LOCATION_NAME+' '+mvDf.string(mvDate)+wAlerts, locationNameFontSize, locationNameCoords.x, locationNameCoords.y, Color.white())//accentColor);

let min, max, diff;
for (let i = 0; i <= hoursToShow; i++) {
  let temp = shouldRound(roundedGraph, (param=='daily'?weatherData.daily[i].temp.max : weatherData.hourly[i].temp));
  //log(temp)
  min = (temp < min || min == undefined ? temp : min)
  max = (temp > max || max == undefined ? temp : max)
}
diff = max -min;

//draw lines and labels at 100% (xStart, 60) and 0% (xStart, 220). additional 25, 50, and 75 also added.

let pa = new Path()
if(showPrecipitation){
  for (let i = 0; i<=4; i++){
    yPt = (((220-60)/4)*i)+60
    pa.move(new Point(xStart, yPt))
    pa.addLine(new Point((spaceBetweenDays*hoursToShow)+xStart+barWidth, yPt))
    drawContext.setTextAlignedRight()
    drawContext.setTextColor(Color.lightGray())
    tex = String(100-(i*25))+'%'
    //log(tex)
    drawContext.setFont(Font.boldSystemFont(10))
    drawContext.drawTextInRect(String(tex), new Rect(0, yPt-6, 30, 10))

  }  
  //pa.addLine(new Point((spaceBetweenDays*hoursToShow)+xStart+barWidth, 220))  
  drawContext.addPath(pa)
  drawContext.setStrokeColor(Color.lightGray())
  drawContext.strokePath()

}

drawContext.setTextAlignedCenter()



  //start adding pop by mvan231
  //log(hourData.dt)
  if(showPrecipitation) {
    for (let i = 0; i <= hoursToShow; i++) {
      hourData = (param=='daily')?weatherData.daily[i]:weatherData.hourly[i];
      let pop = hourData.pop * 100
      drawPOP(pop, spaceBetweenDays * i)//, 190 - (50 * delta))
    }
  }
      
  
  //end adding pop by mvan231
  
for (let i = 0; i <= hoursToShow; i++) {
  let hourData = (param=='daily')?weatherData.daily[i]:weatherData.hourly[i];
  //log(hourData)
  let nextHourTemp = shouldRound(roundedGraph, (param=='daily')?weatherData.daily[i+1]['temp']['max']:  weatherData.hourly[i + 1].temp);
//log(nextHourTemp)
  let dF = new DateFormatter()
  dF.dateFormat = 'eee'
  let hour = (param=='daily')?dF.string(epochToDate(hourData.dt))+epochToDate(hourData.dt).getDate():epochToDate(hourData.dt).getHours();
  if (twelveHours && (param!='daily'))
    hour = (hour > 12 ? hour - 12 : (hour == 0 ? "12a" : ((hour == 12) ? "12p" : hour)))
  let temp = (param=='daily')?hourData.temp.max : (i == 0) ? weatherData.current.temp : hourData.temp

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
    //log(`hour day is ${JSON.stringify(hourDay)}`)
    var night = (hourData.dt > hourDay.sunset || hourData.dt < hourDay.sunrise || (i == 0 && (now.getTime > weatherData.current.sunset || now.getTime < weatherData.current.sunrise)))
    //log(`night is ${night}. now is ${now}. sunrise is ${weatherData.current.sunrise}. sunset is ${weatherData.current.sunset}`)

    
    let freezing = (units=='imperial'?32:0)
    var tempColor = (temp>freezing)?Color.red():Color.blue()

    drawLine(spaceBetweenDays * (i) + barWidth, 175 - (50 * delta),spaceBetweenDays * (i + 1) + barWidth, 175 - (50 * nextDelta), 2,tempColor) //Color.gray())// (night ? Color.gray() : accentColor))
  }

  drawTextC(temp + "°", 20, spaceBetweenDays * i + 30, 130 - (50 * delta), barWidth /*50*/, 21, tempColor)
  
  //if showWindSpeed is enabled, get the wind data and display it
  if(showWindspeed){
    let hourWindDir = hourData.wind_deg
    let dir = (hourWindDir-(hourWindDir%11.25))/11.25
    dir = windDirs[dir]
    //dir is now the cardinal direction of the wind source
    let windSpeed = Math.round(hourData.wind_speed)
    
    //add wind direction arrow
    if(showWindArrow){
      //add wind directional arrow
      drawContext.setFillColor(accentColor)
      drawContext.fillEllipse(new Rect(spaceBetweenDays * i + (param=='daily'?58:42), 220 - 16,16,16))
      let symb = SFSymbol.named(windArrows[dir])
      symb.applyFont(Font.systemFont(14))
      symb=symb.image
      drawImage(symb, spaceBetweenDays * i + (param=='daily'?59:43), 220 - 15)
    }else{
      //place wind cardinal direction
      drawTextC(dir, 14, spaceBetweenDays * i + 30, 220 - 18, barWidth /*50*/, 20)//, Color.white())  
    }
    //place wind unit
    //let windUnit = (units=='imperial')?'mph':'kph'
    drawTextC(windSpeed, 14, spaceBetweenDays * i + 30, 220 - 32, barWidth /*50*/, 20,Color.white())
  }
  let imageSpace = (param =='daily')?48:32
  const condition = i == 0 ? weatherData.current.weather[0].id : hourData.weather[0].id
  drawImage(symbolForCondition(condition), spaceBetweenDays * i + imageSpace, 160 - (50 * delta));
  
  let dayHourColor = (param=='daily')?Color.white():night?Color.white():Color.orange()
  if (hour >= 0 && hour <= 9) {
		drawTextC((i == 0 ? nowstring : "0" + hour), 18, spaceBetweenDays * i + 32, 234, barWidth, 21, dayHourColor)
	} else {
		drawTextC((i == 0 ? nowstring : hour), 18, spaceBetweenDays * i + 32, 234, barWidth, 21,dayHourColor)
	}
  previousDelta = delta;
}

//drawContext.setTextAlignedRight();

/*
if (usingCachedData)
  drawText("⚠️", 32, ((config.widgetFamily == "small") ? contextSize : mediumWidgetWidth) - 72,30)
*/

widget.backgroundImage = (drawContext.getImage())
widget.url = 'https://openweathermap.org'
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

function calculateWindCardinal(windBearing){
  
}

function drawText(text, fontSize, x, y, color = Color.black()) {
  drawContext.setFont(Font.boldSystemFont(fontSize))
  drawContext.setTextColor(color)
  drawContext.drawText(new String(text).toString(), new Point(x, y))
}

function drawImage(image, x, y) {
  drawContext.drawImageAtPoint(image, new Point(x, y))
}

function drawPOP(POP, x){
  //log(`pop is ${POP}`)
  //log(`x is ${x}`)
  //throw new Error(JSON.stringify(Color.blue()))
  drawContext.setFillColor(new Color('0A84FF',0.45))

  let barH =  ((220-60)/100) * POP
  let y = 220 - barH
  //log(`bar height is ${barH}`)
  //log(`y start point is ${y}`)
  if(barH > 0)drawContext.fillRect(new Rect(x+xStart,y,barWidth, barH))
}

function drawTextC(text, fontSize, x, y, w, h, color = Color.black()) {
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
  
  //log(`x1 is ${x1}, x2 is ${x2}, y1 is ${y1}, y2 is ${y2}. color is ${color.hex }`)
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

