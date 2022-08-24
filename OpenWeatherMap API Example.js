// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-brown; icon-glyph: magic;

const API_KEY = "your key here"

let latLong = {}
const LAT = 40.8777
const LON = 82.94
var response = await Location.reverseGeocode(LAT, LON)
var LOCATION_NAME = response[0].postalAddress.city

const locale = "it"
const nowstring = "Now"

const units = "imperial"//"metric"

let weatherData;
try {
  weatherData = await new Request("https://api.openweathermap.org/data/2.5/onecall?lat=" + LAT + "&lon=" + LON + "&exclude=minutely,alerts&units=" + units + "&lang=" + locale + "&appid=" + API_KEY).loadJSON();
} catch(e) {
  console.log("Offline mode")
}

log(weatherData)