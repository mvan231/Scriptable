// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: purple; icon-glyph: magic;
/*
$$$$$$$$$$$$$$$$$$$$$$$
$$$$$$$$$$

Alexa To Reminders Access

Script made by: mvan231
Date made: 2023/10/26

Purpose: To sync alexa reminders to a iOS reminders list. previously IFTTT could do this, but Amazon revoked the Alexa IFTTT integration recently.

Setup: Insert the name of the desired reminders list in the "remCal" line. I use "Grocery and Shopping" with my wife, so i have that name entered.

When running the first time, the script will check if you are logged in. If not, it will notify and present with login page. After that, the script should run seamlessly. 

When running and items are found to sync, it will show a notification with the items that were added to reminders.

$$$$$$$$$$
$$$$$$$$$$$$$$$$$$$$$$$

$$$$$$$$$$$$$$$$$$$$$$$
$$$$$$$$$$

Version Info:
v4:modified the wv at beginning to use a variable for the response to aid with crashing
v3:working version with notification for synced items

$$$$$$$$$$
$$$$$$$$$$$$$$$$$$$$$$$
*/

//fill in the specific name of the reminders list in the "remCal" line below
let remCal = await Calendar.forRemindersByTitle("Grocery and Shopping")

let url = 'https://www.amazon.com'

let wv = new WebView()
let wvRes = await wv.loadURL(url)
//await wv.present(false)

let html = await wv.getHTML()
//log(html)

let n = new Notification()

if(config.runsInApp)log(`index of "Sign in" is ${html.indexOf("Sign in")}`)

if(html.indexOf("Sign in")<0 ){
  if(config.runsInApp)log("logged in")
}else{
  if(config.runsInApp)log("not logged in")
  n.title = 'Alexa Reminder Sync'
  n.body = `You appear not logged in, run in app to login to Amazon within Scriptable`
  n.schedule()
  if(config.runsInApp)await wv.present(false)
}

//empty html and wv variable
html = ""
wv = ""

//initialize the AlexaLastCreatedDateTime variable from file if it exists
let fm = FileManager.iCloud()
let path = fm.documentsDirectory()
path = `${path}/AlexaLastCreatedDateTime.txt`
if(config.runsInApp)log(`file path is ${path}`)

let lastDate = fm.fileExists(path)?fm.readString(path):0
if(config.runsInApp)log(`lastDate file is ${lastDate}`)

//perform the request to the Amazon Alexa Shopping List API
url = "https://amazon.com/alexashoppinglists/api/getlistitems"
let r = new Request(url)

let json = await r.loadJSON()
//log(json)

let itemArr = json[Object.keys(json)]["listItems"]
//log(itemArr)

let newArr = itemArr.filter((item)=> {
  if(config.runsInApp)log(`${item["value"]}\n is completed? ${item["completed"]}\n date is after last stored/ran? ${item["createdDateTime"]>lastDate}`)
  if((!item["completed"]) && (item["createdDateTime"]>lastDate)) return true
  return false
})

let result = []
//show new array in console
if(config.runsInApp)log(newArr)
newArr.forEach((item) => {
  if(config.runsInApp)log(`saving ${item["value"]} to reminders\n newSaveDate is ${item["createdDateTime"]}`)

  let rem = new Reminder()
  rem.title = item["value"]
  result.push(rem.title)
  rem.calendar = remCal
  rem.save()
  if(item["createdDateTime"]>lastDate)lastDate=item["createdDateTime"]
})

fm.writeString(path, String(lastDate))

if(result.length > 0){
  n = new Notification()
  n.title = 'Alexa Reminder Sync'
  n.body = `added to reminders:\n${result}`
  n.schedule()
}

//end of script
Script.complete()