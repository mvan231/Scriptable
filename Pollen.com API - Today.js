// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: brown; icon-glyph: magic;

/*Our pollen levels are on a scale of 12. Low is 0-2.4, Low-Medium is 2.5-4.8, Medium is 4.9-7.2, High-Medium is 7.3-9.6, and High is 9.7-12.0. These levels take into account how much pollen the allergy sufferer is likely to be exposed to for that given period.

https://www.pollen.com/help/faq
*/
//setup JSON of level classes
let indexDict = {"Low-Medium":{"lower":"2.5","upper":"4.8"},"High":{"lower":"9.7","upper":"12"},"High-Medium":{"lower":"7.3","upper":"9.6"},"Low":{"lower":"0","upper":"2.4"},"Medium":{"lower":"4.9","upper":"7.2"}}
//get current location data
let loc = await Location.current()
log(loc)

const LAT = loc.latitude
const LON = loc.longitude
//reverse geocode LAT and LON
var response = await Location.reverseGeocode(LAT, LON)
log(response)
var state = response[0].administrativeArea
var LOCATION_NAME = response[0].postalAddress.city
var zip = response[0].postalCode
// log(state)
// log(zip)
// log(LOCATION_NAME)
let url = `https://www.pollen.com/api/forecast/current/pollen/${zip}`
//setup new Request with proper headers
let r = new Request(url)
r.headers = {Referer:`https://www.pollen.com/forecast/current/pollen/${zip}`}
let res = await r.loadJSON()
log(res)
//assign today's values to the variable 'today'. 0 is  yesterday, 1 is today, and 2 is tomorrow
let today = res.Location.periods[1]/*.forEach((f)=>{
log(f.Triggers)
})*/
log(today)
//setup variables to use in next lines of code
let level,ind = today.Index

Object.keys(indexDict).forEach((f) => {
  if(!level)level = ((ind >= Number(indexDict[f]['lower'])) && (ind <= Number(indexDict[f]['upper'])))?f:false
})
log(level)
//initialize the widget
let w= new ListWidget()
//if running in accessory widget (on lock screen)
if(config.runsInAccessoryWidget){
  addTextToLSWidget(`${ind} ${level}`)
  today.Triggers.forEach((f)=>{
    //log(f)
    //log(f.Name)
    addTextToLSWidget(f.Name)
  })
}else{
  //if not running in accessory widget (not on lock screen)
  w.addText(`Pollen.com Info For ${LOCATION_NAME}`)
  w.addText(`Index is ${level} ${ind}`)
  w.addText(`Top Allergens:`)
  today.Triggers.forEach((f)=>{
    w.addText(f.Name)
  })
}
//tell Scriptable the script is complete
Script.complete()
//set the widget 'w' with the info from the code above
Script.setWidget(w)
//present the widget if running in app
w.presentMedium()

function addTextToLSWidget(text){
  let a = w.addText(text)
  a.centerAlignText()
  a.minimumScaleFactor = 0.5
  a.font = Font.regularSystemFont(10)
}