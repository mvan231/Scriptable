// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-gray; icon-glyph: image;
/*

$$$$$$$$$$$$$$$

VSCO widget

$$$$$$$$$$$$$$$

made by: mvan231

$$$$$$$$$$$$$$$

version information
v:1.0
- Initial Release

*/

//check for an update quick before building the widget
let needUpdated = await updateCheck(1.0)

let url = args.widgetParameter
url='https://vs.co/53863314'
if(!url)throw new Error('Please input a profile url in the widget parameter, optionally you can set a secondary input to always show the latest post.\nExample: url|latest')

url=url.split('|')
let latest = url[1]
url = url[0]
let r = new Request(url)
let res = await r.loadString()
// log(res)

let reg = /PRELOADED_STATE__ = (.*?)\<\/script\>/
let regRes = res.match(reg)[1]
//log(regRes)
regRes = JSON.parse(regRes)
let items = regRes.entities.images
let recentImagesCount = Object.keys(items).length

let itemNo = getRandomInt(recentImagesCount)
log(itemNo)

let itemToGet = Object.keys(items)[latest=='latest'?0:itemNo]
log(itemToGet)

let item = items[itemToGet]
log(item)

let itemURL = item.permalink
log(itemURL)

let user = item.permaSubdomain
log(user)

let imgURL = `https://${item.responsiveUrl}`

r.url = imgURL
let img = await r.loadImage()
// QuickLook.present(img, true)

let profileImgURL = regRes.sites.siteByUsername[user].site.profileImage
log(profileImgURL)

let name = regRes.sites.siteByUsername[user].site.name
log(name)

log(item.captureDate)
let capDate = item.captureDate//Math.floor(item.captureDate/1000)
log(capDate)
capDate= new Date(capDate)

let dF = new DateFormatter()
dF.dateFormat = 'MMM d, yyyy'
log(capDate)
capDate = dF.string(capDate)
log(capDate)

let w = new ListWidget()

w.backgroundImage = img

let tStack = w.addStack()
let dtStack = tStack.addStack()
let date = dtStack.addText(` ${capDate}${needUpdated?'\n UpdateAvailable!':''} `)
tStack.addSpacer()
date.font = Font.lightRoundedSystemFont(config.widgetFamily=='small'?8: 10)
date.shadowColor = Color.dynamic(Color.black(), Color.white())
//title.shadowRadius = 2
dtStack.backgroundColor = Color.dynamic(Color.white(), Color.black())
dtStack.cornerRadius = 5

w.addSpacer()
let bStack = w.addStack()
let userStack = bStack.addStack()
bStack.addSpacer()
userStack.layoutVertically()
let btitle = userStack.addText(` VSCO ${(latest=='latest'||latest==true||latest=='Latest')?'Latest':'Recents'} `)
btitle.font = Font.lightRoundedSystemFont(config.widgetFamily=='small'?8: 10)
let userInfo = userStack.addText(` ${name} ${config.widgetFamily=='small'?'\n':'-'} @${user} `)
userInfo.font = Font.systemFont(config.widgetFamily=='small'?10: 12)
userInfo.shadowColor = Color.dynamic(Color.white(), Color.black())
//userInfo.shadowRadius = 15
userStack.backgroundColor = Color.dynamic(Color.white(), Color.black())
userStack.cornerRadius = 5

w.url = itemURL
w.refreshAfterDate = new Date(new Date().getTime()+ 60/*mins*/*60000/*ms/min*/)

Script.setWidget(w)
Script.complete()
w.presentLarge()

/*$$$$$$$$$$$$$$$

start functions

$$$$$$$$$$$$$$$*/

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

async function updateCheck(version){
  /*
  #####
  Update Check
  #####
  */   
  let uC   
  try{let updateCheck = new Request('https://raw.githubusercontent.com/mvan231/Scriptable/main/VSCO%20Recents/VSCO%20Recents%20Widget.json')
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
      Safari.open("https://github.com/mvan231/Scriptable/blob/main/VSCO%20Recents/VSCO%20Recents%20Widget.js")
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