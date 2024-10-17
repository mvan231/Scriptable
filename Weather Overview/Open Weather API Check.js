// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: yellow; icon-glyph: bolt;
let settings = {
  apiKey: "",//api key
  units: "",//imperial or metric
};
//settings variables initialization

//API key initialize
const API_KEY = settings.apiKey

//units can be set to imperial or metric for your preference
const units = settings.units//"imperial"//"metric"

var latLong = {}

var startTime = Date.now();
try {
  log('getting location...')
  Location.setAccuracyToKilometer()
  latLong = await Location.current()  
} catch(e) {
  log("couldn't get live location")
}
//log(latLong)
const LAT = latLong.latitude
const LON = latLong.longitude
const locale = "en"

log('trying to get data from API')
weatherData = await new Request(`https://api.openweathermap.org/data/3.0/onecall?lat=${LAT}&lon=${LON}&exclude=minutely&units=${units}&lang=${locale}&appid=${API_KEY}`).loadJSON()

log(JSON.stringify(weatherData, null, 2))
Script.complete()