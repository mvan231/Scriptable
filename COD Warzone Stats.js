// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: teal; icon-glyph: magic;
// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: green; icon-glyph: magic;
let param = args.widgetParameter
//param = "dutchvan231"
if (!param)throw new Error("please set a username in widget parameter")

param=encodeURI(param)


/*
#####
Update Check
#####
*/
let version = "1.1"

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
Pasteboard.copyString(out)
let reg = /INITIAL_STATE__\=(.*?)\;/
let regout = out.match(reg)[1]
regout=JSON.parse(regout)
//log(regout)
// regout=regout.toString()

let w = new ListWidget()
let title = w.addText("Warzone Stats")
title.centerAlignText()
let main = w.addStack()
let newS = main.addStack()
main.addSpacer()
let newS2 = main.addStack()
let handle = Object.keys(regout.stats.standardProfiles)

//reduce regout to just the stats
regout = regout.stats.standardProfiles[handle].segments[0].stats
log(regout)
let testArr = ["wins","top5","top10","top25","kills","deaths","kdRatio","downs","averageLife","score","scorePerMinute","scorePerGame","cash","contracts","wlRatio"]
testArr.forEach((stat) => {
  log(stat)
  f(stat, regout[stat].displayValue.toString())
})

newS.layoutVertically()
newS2.layoutVertically()
main.layoutHorizontally()
Script.setWidget(w)
Script.complete()
w.presentLarge()

function f (statName,value,index){
  newS.addText(statName)
  
  newS2.addText(value)
}