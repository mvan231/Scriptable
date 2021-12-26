// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-gray; icon-glyph: star-and-crescent;
let key = 'your_key_here'
let r = new Request(`https://api.nasa.gov/planetary/apod?api_key=${key}`)

let scheme = URLScheme.forRunningScript()

let url = args.queryParameters?args.queryParameters:false

let menuOut,menu = url['menu']
log(menu)
if(menu){
  let menuA = new Alert()
  menuA.title = Script.name()
  menuA.addAction('Save Photo')
  menuA.addAction('Go To NASA POTD Site')
  menuA.addCancelAction('Cancel')
  menuOut = await menuA.presentAlert()
  log(`menuOut choice is ${menuOut}`)

  switch (menuOut){
    case 0:
      let rr = new Request(url.imgURL)
      let saveImg = await rr.loadImage()
      Photos.save(saveImg)
      menuA=new Alert()
      menuA.title = Script.name()
      menuA.addAction('OK')
      menuA.message = 'Photo Saved to Photos App'
      await menuA.present()
      App.close()
      break
    case 1:
      Safari.open(url.url)
      break
    default:
      App.close()
      //log('nothing')
  }
}else{
  
  let res = await r.loadJSON()
  log(res)
  
  if(res.media_type == "image"){
    let imgUrl = res.url
    let hdImgUrl = res.hdurl
    let title = res.title
    
    log(imgUrl)
    log(hdImgUrl)
    log(title)
    
    let w = new ListWidget()
    
    r.url = hdImgUrl
    let img = await r.loadImage()
    
    w.addSpacer()
    
    let tStack = w.addStack()
    let textStack = tStack.addStack()
    
    let tText = textStack.addText(`NASA Photo of the Day:\n${title}`)
    tText.textColor = Color.gray()
    tText.font = Font.mediumRoundedSystemFont(10)
    
    
    textStack.backgroundColor = Color.black()
    textStack.cornerRadius = 5
    tStack.addSpacer()
    
    w.backgroundImage = img
    
    let page = 'https://apod.nasa.gov/apod/'
    w.url = `${scheme}?menu=true&url=${page}&imgURL=${hdImgUrl}`

log(w.url)
    
    let d = new Date()
    w.refreshAfterDate = new Date(d.getFullYear(),d.getMonth(),d.getDate()+1,08,00)
    log(w.refreshAfterDate)
    
    Script.setWidget(w)
    Script.complete()
    w.presentSmall()
  }
}