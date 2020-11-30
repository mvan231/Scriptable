// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: cyan; icon-glyph: robot;
/*---------------------
set the justification you want: left,right,center
---------------------*/
let justify = "left"
/*---------------------
add the guildIds you want to cycle through on each refresh of the widget
---------------------*/
let url =['491379054331559936','760937324711641108']

/*---------------------
image background, set to true to use an image as the background of the widget
---------------------*/
const imgBack = false
let img
/*---------------------
start setup
---------------------*/
let fm = FileManager.iCloud()
log(config.runsInWidget)
let b, urlBase = 'https://mee6.xyz/api/plugins/levels/leaderboard/'

dir=fm.documentsDirectory()
let path = dir+"/MEE6.json"
log(path)
if(!fm.fileExists(path)){
  let a = new Alert()
  a.title="What is your Discord username?"
  a.addTextField("Username (without #0000)")
  a.addAction("Done")
  await a.present()
  let bb = a.textFieldValue(0)
  log(bb)
  let tDict = {}
  tDict.uName = bb
  tDict.index = -1
  tDict = JSON.stringify(tDict)
  fm.writeString(path, tDict)
}

if (imgBack && !fm.fileExists(dir+"/MEE6back"))
    {
      img = await Photos.fromLibrary()
      fm.writeImage(dir+"/MEE6back", img)
    }
if (imgBack && fm.fileExists(dir+"/MEE6back.jpg"))
{
  fm.readImage(dir+"/MEE6back.jpg")
}
  
b = fm.readString(path)
log(b)
b=JSON.parse(b)
if (url.length-1>b.index){
  b.index=b.index+1
}else{
  b.index = 0
}
fm.writeString(path, JSON.stringify(b))
log(b.index)
let gId = url[b.index]

url ="https://mee6.xyz/api/plugins/levels/leaderboard/"+gId
log(url)
/*---------------------

---------------------*/

/*
#####
Update Check
#####
*/
let version = "1.0"

let updateCheck = new Request('https://raw.githubusercontent.com/mvan231/Scriptable/main/MEE6.json')
let uC = await updateCheck.loadJSON()
log(uC)
log(uC.version)
let needUpdate
if (uC.version != version){
  needUpdate = "yes"
 log("Server version available")
  if (!config.runsInWidget)
  {
  log("running standalone")

  let upd = new Alert()
  upd.title="Server Version Available"
  upd.addAction("OK")
  upd.addDestructiveAction("Later")
  upd.add
  upd.message="Changes:\n"+uC.notes+"\n\nPress OK to get the update from GitHub"
    if (await upd.present()==0){
    Safari.open("https://raw.githubusercontent.com/mvan231/Scriptable/main/MEE6%20Leaderboard%20Info.js")
    throw new Error("Update Time!")
    }
  } 
}else{
  log("up to date")
}
/*
#####
End Update Check
#####g
*/


/*---------------------
get data from current url item
---------------------*/
let wv = new WebView()
await wv.loadURL(url)
wv.waitForLoad()
let html = await wv.getHTML()

/*---------------------
parse the results from the leaderboard to find your username
---------------------*/
var regex = new RegExp('.*'+b.uName+'.*')
let r = new Request(url)
json = await r.loadJSON()
let str = json.players
log(json)
log(json.guild.name)
let rank,xp,level,count
str.forEach(f)
log(rank)

/*---------------------
setup the widget
---------------------*/
let w = new ListWidget()
w.setPadding(2, 8, 2, 8)
rank=rank.toString()
xp=xp.toString()
level=level.toString()
count =count.toString()
let title = w.addText(json.guild.name)
title.textColor=Color.blue()
title.font=Font.boldRoundedSystemFont(18)
if (justify=="center")title.centerAlignText()
if (justify=="right")title.rightAlignText()
// fonter("User → "+b,10) //commented out display of username
fonter("Rank: "+rank, 13)
fonter("Level: "+level,13)
fonter("XP: "+xp,13)
fonter("MsgCount: "+count,13)
if(imgBack)w.backgroundImage=img
Script.setWidget(w)
Script.complete()
w.presentSmall()


/*---------------------
start function section
---------------------*/
function fonter(text,size){
  let a = w.addText(text)
  a.font=Font.lightRoundedSystemFont(size)
  if (justify=="center")a.centerAlignText()
  if (justify=="right")a.rightAlignText()
}

async function f(inp,index){
  let h = JSON.stringify(inp)
  if(regex.exec(h))
  {
    log(regex.exec(h))
    let cc = JSON.parse(regex.exec(h))
    log(cc)
    rank = index+1
    xp = cc.xp
    level = cc.level
    count=cc.message_count
  }
}