// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: green; icon-glyph: magic;
let param = args.widgetParameter
//param = "yourUsername"
if (!param)throw new Error("please set a username in widget parameter")

param=encodeURI(param)


/*
#####
Update Check
#####
*/
let version = "1.3"

let updateCheck = new Request('https://raw.githubusercontent.com/mvan231/Scriptable/main/COD%20Warzone%20Stats.json')
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
    Safari.open("https://raw.githubusercontent.com/mvan231/Scriptable/main/COD%20Warzone%20Stats.js")
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

let wv = new WebView()
let ur = 'https://cod.tracker.gg/warzone/profile/psn/'+param+'/overview'

let r = new Request(ur)
let out = await r.loadString()

let reg = /(Warzone Overview\<.*)(\n.*)+?(\d+%)<\/span>/
let regout = out.match(reg)
regout=regout.toString()
reg = /\>(.{0,15}?)\<\/span.{0,50}?\>(\d.*?)\</g
regout = regout.match(reg)
log(regout)
reg=/\>(.{0,15}?)\<\/span.{0,50}?\>(\d.*?)\</
let arrrr = []
let dict ={}

let w = new ListWidget()
let title = w.addText("Warzone Stats")
title.centerAlignText()
let main = w.addStack()
let newS = main.addStack()
main.addSpacer()
let newS2 = main.addStack()
regout.forEach(f)
log(dict)
newS.layoutVertically()
newS2.layoutVertically()
main.layoutHorizontally()
Script.setWidget(w)
Script.complete()
w.presentLarge()

function f (inp,index){
  if (index <=14){
  dict[inp.match(reg)[1]]=inp.match(reg)[2]
  newS.addText(inp.match(reg)[1])
  newS2.addText(inp.match(reg)[2])
  }
}