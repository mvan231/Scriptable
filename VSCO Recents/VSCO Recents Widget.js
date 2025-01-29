// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-purple; icon-glyph: magic;
// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-gray; icon-glyph: image;
/*

$$$$$$$$$$$$$$$

VSCO Recents Widget

$$$$$$$$$$$$$$$

made by: mvan231

$$$$$$$$$$$$$$$

version information
v1.1
- Add menu when tapping the widget so the user can save the image, view the post, or view the profile
v1.2
- Added image caching to save network data usage
- fix added for undefined response in JSON causing parse errors
*/

let bat = Device.batteryLevel()
log(bat)
if(bat <= 20/100){
  let widg = new ListWidget()
  widg.addText(`${Script.name()}\nbattery level is at ${(bat*100).toFixed(0)}%\ncan't run widget`)
  Script.setWidget(widg)
  Script.complete()
}else{

//check for an update quick before building the widget
let needUpdated = await updateCheck(1.2)

let scheme = URLScheme.forRunningScript()

let url = args.widgetParameter?args.widgetParameter:args.queryParameters
//url = '|latest'

log(url)
log(Object.keys(url).length)
log(url.length)
if((url.length < 1)||(Object.keys(url).length<1))throw new Error('Please input a profile url in the widget parameter, optionally you can set a secondary input to always show the latest post.\nExample: url|latest')
let menuOut,menu = url['menu']
log(menu)
if(menu){
  let menuA = new Alert()
  menuA.title = 'VSCO Recents Widget'
  menuA.addAction('Save Photo')
  menuA.addAction('Go To Post')
  menuA.addAction('Go To Profile')
  menuA.addCancelAction('Cancel')
  menuOut = await menuA.presentAlert()
  log(`menuOut choice is ${menuOut}`)

  switch (menuOut){
    case 0:
      let rr = new Request(url.imgURL)
      let saveImg = await rr.loadImage()
      Photos.save(saveImg)
      menuA=new Alert()
      menuA.title = 'VSCO Recents Widget'
      menuA.addAction('OK')
      menuA.message = 'Photo Saved to Photos App'
      await menuA.present()
      App.close()
      break
    case 1:
      Safari.open(url.url)
      break
    case 2:
      Safari.open(`http://vsco.co/${url.user}`)
      //http://vsco.co/sinyatkin
      break
    default:
      //log('nothing')
  }

}else{

  url=url.split('|')
  let latest = url[1]
  url = url[0]
  let r = new Request(url)
  let wv = new WebView()
  await wv.loadURL(url)
  
  let res = await wv.getHTML()
  //log(res)

  let reg = /PRELOADED_STATE__ = (.*?)\<\/script\>/
  //log(res.match(reg))
  let regRes = res.match(reg)[1]
  regRes = regRes.replace(":undefined,", ":\"undefined\",")
  log(regRes)
  regRes = JSON.parse(regRes)
  let items = regRes.entities.images
  let recentImagesCount = Object.keys(items).length
  
  let itemNo = getRandomInt(recentImagesCount)
  //log(`random itemNo is ${itemNo}`)
  
  let itemToGet = Object.keys(items)[latest=='latest'?0:itemNo]
  //log(`item to get is ${itemToGet}`)
  
  let item = items[itemToGet]
  log(item)
  
  let itemURL = item.permalink
  log(itemURL)
  
  let user = item.permaSubdomain
  log(user)
  
  let imgURL = `https://${item.responsiveUrl}`
  log(imgURL)
  
  r.url = imgURL
  let fmCache = FileManager.local()
  let fmCacheDirectory = fmCache.cacheDirectory()
  log(fmCacheDirectory)

//https://im.vsco.co/aws-us-west-2/b67234/75241738/66dc7598ea82ac136daf6ae5/vsco_090724.jpg

  let imgName = imgURL.replace(/(\/|:)/g, "-")
//https---im.vsco.co-aws-us-west-2-b67234-75241738-66dc7598ea82ac136daf6ae5-vsco_090724.jpg
  log(imgName)
  let imgPath = fmCache.joinPath(fmCacheDirectory, imgName)
  log(imgPath)
  let imgExists = fmCache.fileExists(imgPath)
  let img
  if(imgExists){
    img = fmCache.readImage(imgPath)
    log("Image read from cache")
  }else{
    
    img = await r.loadImage()
    fmCache.writeImage(imgPath, img)
    log("Image read from web, now cached")
  }
  //let imgName = imgURL.


  //let img = await r.loadImage()
  // QuickLook.present(img, true)
  
  let profileImgURL = regRes.sites.siteByUsername[user].site.profileImage
  log(profileImgURL)
  
  let name = regRes.sites.siteByUsername[user].site.name
  log(name)
  
  //log(item.captureDate)
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
  userStack.backgroundColor = Color.dynamic(Color.white(), Color.black())
  userStack.cornerRadius = 5
  
  w.url = `${scheme}?menu=true&url=${itemURL}&imgURL=${imgURL}&user=${user}`
  //w.url = `${w.url}&openEditor=true`
  
  w.refreshAfterDate = new Date(new Date().getTime()+ 60/*mins*/*60000/*ms/min*/)
  
  Script.setWidget(w)
  Script.complete()
  w.presentLarge()
}

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
        let r = new Request('https://raw.githubusercontent.com/mvan231/Scriptable/main/VSCO%20Recents/VSCO%20Recents%20Widget.js')
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

}//end low battery check