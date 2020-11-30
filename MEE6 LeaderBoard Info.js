// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-blue; icon-glyph: magic;
//use the widget parameter field as follows
//
//serverId|userName
//e.g. 491379054331559936|mvan231


let fm = FileManager.iCloud()
log(config.runsInWidget)
let url,b
if (!config.runsInWidget)
{
dir=fm.documentsDirectory()
let path = dir+"/discordUsername.txt"
  log(path)
  if(!fm.fileExists(path)){
      let a = new Alert()
      a.title="What is your Discord username?"
      a.addTextField("Username (without #0000)")
      a.addAction("Done")
      await a.present()
      let bb = a.textFieldValue(0)
      log(bb)
      fm.writeString(path, bb)
  }
  b = fm.readString(path)
  log(b)
  url ="https://mee6.xyz/api/plugins/levels/leaderboard/491379054331559936"
}else{
  
var widgetInputRAW = args.widgetParameter
  
  if (!widgetInputRAW){ throw new Error("Please long press the widget and add a parameter.\nserverId|userName e.g. 491379054331559936|mvan231");
}

var widgetInput = widgetInputRAW.toString();

var inputArr = widgetInput.split("|");
 
 b = inputArr[1]
 let id = inputArr[0]
 url ="https://mee6.xyz/api/plugins/levels/leaderboard/"+id
}

let wv = new WebView()
await wv.loadURL(url)
wv.waitForLoad()
let html = await wv.getHTML()


var regex = new RegExp('.*'+b+'.*')
let r = new Request(url)
json = await r.loadJSON()
let str = json.players
log(json)
log(json.guild.name)
let rank,xp,level,count
str.forEach(f)
log(rank)

let w = new ListWidget()
rank=rank.toString()
xp=xp.toString()
level=level.toString()
count =count.toString()
w.addText(json.guild.name)
w.addText(b+" Current Rank:"+rank)
w.addText("Level:"+level)
w.addText("XP:"+xp)
w.addText("MsgCount:"+count)
Script.setWidget(w)
Script.complete()
w.presentSmall()

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