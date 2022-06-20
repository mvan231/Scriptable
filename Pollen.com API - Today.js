// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: gray; icon-glyph: magic;
// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: blue; icon-glyph: magic;
/*Our pollen levels are on a scale of 12. Low is 0-2.4, Low-Medium is 2.5-4.8, Medium is 4.9-7.2, High-Medium is 7.3-9.6, and High is 9.7-12.0. These levels take into account how much pollen the allergy sufferer is likely to be exposed to for that given period.

https://www.pollen.com/help/faq
*/
let indexDict = {"Low-Medium":{"lower":"2.5","upper":"4.8"},"High":{"lower":"9.7","upper":"12"},"High-Medium":{"lower":"7.3","upper":"9.6"},"Low":{"lower":"0","upper":"2.4"},"Medium":{"lower":"4.9","upper":"7.2"}}

let loc = await Location.current()
log(loc)

const LAT = loc.latitude
const LON = loc.longitude

var response = await Location.reverseGeocode(LAT, LON)
log(response)
var state = response[0].administrativeArea
var LOCATION_NAME = response[0].postalAddress.city
var zip = response[0].postalCode
// log(state)
// log(zip)
// log(LOCATION_NAME)
let url = `https://www.pollen.com/api/forecast/current/pollen/${zip}`
let r = new Request(url)
r.headers = {Referer:`https://www.pollen.com/forecast/current/pollen/${zip}`}
let res = await r.loadJSON()
log(res)
let today = res.Location.periods[1]/*.forEach((f)=>{
log(f.Triggers)
})*/
log(today)
let level,levelFlg,ind = today.Index

Object.keys(indexDict).forEach((f) => {
  
  if(!level)level = ((ind >= Number(indexDict[f]['lower'])) && (ind <= Number(indexDict[f]['upper'])))?f:false
})
log(level)
let w= new ListWidget()
w.addText(`Pollen.com Info For ${LOCATION_NAME}`)
w.addText(`Index is ${level} ${ind}`)
w.addText(`Top Allergens:`)
today.Triggers.forEach((f)=>{
  w.addText(f.Name)
})

Script.complete()
Script.setWidget(w)
w.presentMedium()