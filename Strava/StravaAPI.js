// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: pink; icon-glyph: magic;
/*


$------------>

created by:
mvan231

$------------<



$------------>

NOTES:

You will need a client ID, client secret, and athlete ID for this script / widget to work.

the script will gather the tokens for you and store them in your Scriptable folder in iCloud Drive under the name StravaAPI.json

The athlete ID can be grabbed from the strava website URL. For info: 
https://support.strava.com/hc/en-us/articles/216928797-Where-do-i-find-my-Strava-ID-?mobile_site=true


$------------<

$------------>

version history:

v1.1
- Incorporated updater mechanism

v1.0
- Initial Release (get activity data current commented out)

$------------<
*/
let version = "1.1"

let updateCheck = new Request('https://raw.githubusercontent.com/mvan231/Scriptable/main/Strava/file.json')
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
  upd.title="Server Version Available\n\nChanges:\n"+uC.notes
  upd.addAction("OK")
  upd.message="Press OK to get the update from GitHub"
  await upd.present()
  Safari.open("https://raw.githubusercontent.com/mvan231/Scriptable/main/Strava/StravaAPI.js")
  exit()
  } 
}else{
  log("up to date")
}

let wi = new ListWidget()

ab = FileManager.iCloud()
dir=ab.documentsDirectory()
let path = dir+"/StravaAPI.json"
log(path)
let file



let now = new Date()



if (!ab.fileExists(path))
{
  //if file does not exist
  let prompter = new Alert()
  
  file={}

  prompter.addTextField('clientId')
  prompter.addTextField('clientSecret')
  prompter.addTextField('athleteId')
  //   prompter.addSecureTextField('Enter Client Secret')
  prompter.addAction('Done')
  prompter.addCancelAction('Cancel')
  prompter.title="Strava Setup"
    var aa = await prompter.present() //.then(onFulfilled)//, onRejected)
  log("Alert output is "+aa)
  //   log(prompter.textFieldValue(0))
  //   log(prompter.textFieldValue(1))
  //if input is cancelled
  if (aa==-1)exit()

    file = {
    clientId:prompter.textFieldValue(0),
    clientSecret:prompter.textFieldValue(1),
    athleteId:prompter.textFieldValue(2)
    }
  ab.writeString(path, JSON.stringify(file))
  log(file)
}

//ab.read(path)

file = JSON.parse(ab.readString(path))
log(file)
// file.athleteId = "2002540"
// ab.writeString(path, JSON.stringify(file))

if (!file.hasOwnProperty('code'))
{
  await getCode(file.clientId)
  let haveCode = new Alert()
  haveCode.message = "have you copied the resultant URL to clipboard?"
  haveCode.addAction("Yes")
  haveCode.addAction("No")
  var haveCodeAnswer = await haveCode.present()
  log("haveCodeAnswer is "+haveCodeAnswer)
  if (haveCodeAnswer==0){
    log("finish")
//   getCode(file.clientId)
    let clipBoard = Pasteboard.paste()

    if (!clipBoard.includes("code="))
    {
          let errorAlert = new Alert()
          errorAlert.message = "Seems you didn't copy the URL properly\nExiting now"
          errorAlert.present()

          exit()
    }

    log(clipBoard)

    var reg = /code\=(.*?)\&/
    log("clipBoard contains code? "+reg.test(clipBoard))

    if(reg.test(clipBoard))
    {
      var code = clipBoard.match(reg)[1]
      log("code is "+code)
      file.code = code
      log(file)
      //save the json file with the code added in
      ab.writeString(path, JSON.stringify(file))
    }

  }else {
    let noAns = new Alert()
    noAns.message="Seems you said you have not copied the code to clipboard, please do that and then run the script again"
    noAns.present()
    exit()
    }
}
log(JSON.stringify(file).includes("Token"))
if (!JSON.stringify(file).includes("Token")){
  log("Token Not Found\nlets grab one now\none second...")
  //token doesn't exist in json file. run module of code to get the token now
  
  getToken()
  
}else {
 log("tokens and information is good to go") 
}
log("\ncurrent time "+now.getTime()/1000 + "\nexpiresAt time "+file.expiresAt+"\ndelta time "+(file.expiresAt-(now.getTime()/1000)))
if (now.getTime()/1000 > file.expiresAt)refreshToken()


var after_Date

if(!file.hasOwnProperty('afterDate'))
{
after_Date=1
}else{
  after_Date = file.afterDate
}
/*---------------------------

get data

----------------------------*/

let result

/*
#####

Get Athlete Stats

#####
*/

let athReq = new Request("https://www.strava.com/api/v3/athletes/"+file.athleteId+"/stats")
athReq.headers={
  "Authorization": "Bearer "+file.accessToken
  }
  
  result=await athReq.loadJSON()
  log("athlete stats are\n"+JSON.stringify(result))
  
let addTe
/*
####
add widget title
####
*/
let title = wi.addStack()
title.addSpacer()

let adl = needUpdate?" - Update Available":""
let titleTex = title.addText("Strava YTD"+adl)
title.addSpacer()
titleTex.textColor = Color.dynamic(Color.red(), Color.orange())
titleTex.font = Font.boldRoundedSystemFont(14)
title.layoutHorizontally()

let dataView = wi.addStack()

let types = ["run","ride","swim"]
let placeHold  

let index = 0
  for (const curType of types)
  {
    let typeKey = `ytd_${ curType }_totals`
    let stat = result[ typeKey ]
    
    /*example - log(`info is ${ curType}: ${ (stat.distance/1000).toFixed(2)}`)*/
     
    if (stat.count>0){
      let first = `${ curType.match(/^./)}`
      let second = first.toUpperCase()
      
      placeHold = `--${ curType.replace(/^./,second) }--\nCount ${ stat.count}\nTime ${ (stat.elapsed_time/60).toFixed(1) }m\nDist ${ (stat.distance/1000).toFixed(1)}km\nElev ${ stat.elevation_gain}m`
      index++
      log("index is "+index)
      log(placeHold)
      widget_Text(placeHold,index)
    }
  }
dataView.layoutHorizontally()
Script.setWidget(wi)
Script.complete()
wi.presentMedium()
  

/*
#####
----------------------
Get Activity Data
----------------------
#####
*/
/*log("start getting activity data")

var end=[]
var i
for (i=1; i<=3; i++)
{
   let req = new Request("https://www.strava.com/api/v3/athlete/activities?per_page=2&after="+after_Date);
  req.method="get"
    req.headers = {
    "Authorization": "Bearer "+file.accessToken
    }
    
    result = await req.loadJSON()
    log("result length is"+result.length)
    log(result)
    //end.push(result)//alternative method to end=end.concat
    end=end.concat(result)
    //log(end)
 
}
end=end.flat()
log("start of the end\n\n\n"+end)
log(JSON.stringify(end))
log(end.length)*/
/*
#####

End of Script

#####
*/

/*


/*
#####

Begin Functions

#####
*/

function widget_Text(textAdd,index)
{
  log(index)
//   if (index>1)textAdd="\n"+textAdd
  
  let newSt = dataView.addStack()
  newSt.addSpacer()
  addTe = newSt.addText(textAdd)
  addTe.centerAlignText()
  newSt.addSpacer()
  addTe.font = Font.systemFont(12)
  addTe.color = Color.dynamic(Color.black(), Color.white())
}

function onFulfilled(input){
  log(input)
  //if cancel button is tapped
  if (input==-1){
    log(input)

          exit()
  }
}

async function getToken()
{
  let req = new Request("https://www.strava.com/api/v3/oauth/token");
  req.method="post"
    req.headers = {
    "Content-Type": "application/json"
    }

  req.body= JSON.stringify({
    client_id:file.clientId,
    client_secret:file.clientSecret,
   code:file.code,
    grant_type:"authorization_code"
  })

  let out
    out = await req.loadJSON()
    log(out)
       if((JSON.stringify(out).includes("invalid"))||(JSON.stringify(out).includes("expired")))
      {
        log("need new code")

      var regex = /\,\"code\"\:\".*?\"/
  file = JSON.stringify(file).replace(regex,"")
  log(file)
      ab.writeString(path, file)
      }else{
  file.accessToken = out.access_token
  file.refreshToken = out.refresh_token
  file.expiresAt = out.expires_at
  log(file)
  ab.writeString(path,JSON.stringify(file))
        
      }
}

async function refreshToken()
{
   let req = new Request("https://www.strava.com/api/v3/oauth/token");
  req.method="post"
    req.headers = {
    "Content-Type": "application/json"
    }

  req.body= JSON.stringify({
    client_id:file.clientId,
    client_secret:file.clientSecret,
    refresh_token:file.refreshToken,
    grant_type:"refresh_token"
  })

  let out
    out = await req.loadJSON()
    log(out)
    
  file.accessToken = out.access_token
  file.refreshToken = out.refresh_token
  file.expiresAt = out.expires_at
  log(file)
  ab.writeString(path,JSON.stringify(file))
        
}


async function getCode(clientId)
{
  let url = 'https://www.strava.com/oauth/authorize?client_id='+clientId+'&redirect_uri=http://localhost&response_type=code&scope=activity:read'

  let a1 = new Alert()
  a1.message="Please authorize on the next screen and copy the URL from the resulting blank page in Safari, then return to Scriptable again."
  a1.addAction("OK")
  await a1.present()

  Safari.open(url)
}

function exit(){
   throw ''
}
