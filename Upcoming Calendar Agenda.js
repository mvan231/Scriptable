// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: light-gray; icon-glyph: calendar-alt;
/*
####################
####################
begin configuration
(user definable)
####################
####################
*/

const eventsToShow = 14

const useTransparency = true
/*
####################
####################
begin settings file info
####################
####################
*/
let fm = FileManager.iCloud()
let scriptPath = fm.documentsDirectory()+'/UpcomingCalendarAgenda/'
let settingsPath = scriptPath+'settings.json'
const reRun = URLScheme.forRunningScript()

if(!fm.fileExists(scriptPath))fm.createDirectory(scriptPath, false)

let a,settings = {}

if(fm.fileExists(settingsPath)){
  settings = JSON.parse(fm.readString(settingsPath))
//   await setup(false)
}else{
  await setup(true)
}

settings = JSON.parse(fm.readString(settingsPath))

if(!config.runsInWidget && fm.fileExists(settingsPath) && !settings.quickReset){
    let resetQ = new Alert()
    resetQ.title='Want to reset?'
    resetQ.message='If you tap "Yes" below, the settings for this widget will be reset and setup will run again'  
    resetQ.addAction('Yes')
    resetQ.addAction('No')
    a = await resetQ.presentSheet()
    if(a==0){
      await fm.remove(settingsPath)
      let ttyn = await setup(true)
      log(`ttyn is ${ttyn}`)
      //Safari.open(reRun)
      //throw new Error('running again now')
    }
}

settings = JSON.parse(fm.readString(settingsPath))

if(settings.quickReset)
{  
  settings.quickReset=false  
  log(settings)
  fm.writeString(settingsPath, JSON.stringify(settings))
}


//calendar names are included in thr cal variable belowto display them in the list of calendar events and the indicators on the month view. These must be enclosed in single or double quotes. (this is handled by the setup questions)

const cal = settings.cals


/*
####################
####################
begin building widget
and start of script
####################
####################
*/
let widgSizeSmall=false
if(config.widgetFamily=='small')widgSizeSmall=true
let dateHold,w = new ListWidget()
var ind=0
w.setPadding(5,20,5,5)
let main = w.addStack()// 
// main.addSpacer()
let right,left = main.addStack()
// left.size=new Size(170, 0)
if (!widgSizeSmall){
main.addSpacer()
// right = main.addStack()
// right.size=new Size(170, 0)
// right.layoutVertically()
}
main.layoutHorizontally()
left.layoutVertically()

let dF = new DateFormatter()
await CalendarEvent.thisWeek().then(successCallback, failureCallback)

if(useTransparency){
const RESET_BACKGROUND = !config.runsInWidget
const { transparent } = importModule('no-background')
w.backgroundImage = await transparent(Script.name(), RESET_BACKGROUND)
}

Script.setWidget(w)
Script.complete()
w.presentLarge()


/*
####################
####################

begin functuon section

####################
####################
*/
async function setup(full){
    let cal = []
    calP=new Alert()
    calP.message='In the next screen, please select the calendars to display in the widget'
    calP.addAction('OK')
    await calP.present()
    await Calendar.presentPicker(true).then((cals)=>{
      cals.forEach((f)=>{
        cal.push(f.title)
      })
    })
    
    settings['cals'] = cal
    settings['quickReset']=true
    await fm.writeString(settingsPath, JSON.stringify(settings))
  
    return true
}



async function successCallback(result) {
  calcal=result
  await CalendarEvent.nextWeek().then((res) => {
    newCalArray = res
  })
  newCalArray = mergeArrays(calcal,newCalArray)
  newCalArray.forEach(f)
}

function mergeArrays(...arrays) { 
        let mergedArray = []; 
        arrays.forEach(array => { 
            mergedArray.push(...array) 
        }); 
        return mergedArray; 
} 
    
async function failureCallback(error) {
  console.error("Error generating calendar data: " + error);
}

function getColorLine(colorHex){
  const context =new DrawContext()
    context.size=new Size(2,27)
//     new Size(width, height)
    context.opaque=false
    context.respectScreenScale=true
    context.setFillColor(new Color('#'+colorHex))
    const path = new Path()
    path.addRect(new Rect(0, 0, 27,27))
    context.addPath(path)
    context.fillPath()
    return context.getImage() 
}

function f(item){
  let isCalEvent
  if('endDate' in item){
    isCalEvent=true
  }else{
    isCalEvent=false
  }  
  let now = new Date()
  log(item.title)
  log('now '+now.getTime())  
  log('startTime '+item.startDate.getTime())

  if ((item.startDate.getTime() > now.getTime()) && (cal.includes(item.calendar.title) || !isCalEvent))
  {
    ind+=1
    log(ind)
    let s
    let h = widgSizeSmall?5:eventsToShow/2
log(h)
    if (ind <=eventsToShow){
      if (ind <= eventsToShow)///2)
      {
        s = left.addStack()
        addIt()
      }else if ((ind >eventsToShow))///2) && !widgSizeSmall)
        {
          s=right.addStack()
          addIt()
        }
        
      function addIt(){
          
        let dot = getColorLine(item.calendar.color.hex)
        s.setPadding(1,0,1,0)
//         s.setPadding(top, leading, bottom, trailing)
        s.size= new Size(0, 27)
        let dtStack = s.addStack()
        let dd = item.startDate
        dF.dateFormat='MMM d'
        let ddd = dF.string(dd)
        
        dF.dateFormat='EEE'
        let eee = dF.string(dd)
        //dtStack.addSpacer()
        if (dateHold != ddd){
          dateHold = ddd
          log(dateHold)
          let dt = dtStack.addText(ddd)
          let dt2 = dtStack.addText(eee)  
          dt.font=Font.systemFont(8)    
          dt2.font=Font.systemFont(8)
        }
        dtStack.size = new Size(30,27)
        dtStack.layoutVertically()
        
        let imStack = s.addStack()
        imStack.size = new Size(2,27)
        let textStacks = s.addStack()
        let titleS = textStacks.addStack()
//         titleS.size = new Size(100,25)
        s.layoutHorizontally()
        //imStack.setPadding(2,0,2,0)
        let im = imStack.addImage(dot)
        im.size = new Size(2,27)
        im.resizable=false
        //imStack.layoutVertically()        
        textStacks.layoutVertically()
        //let titleS = s1.addStack()
//         let titleS1 = titleS.addStack()
        let tx = titleS.addText(item.title)
        tx.font=Font.systemFont(12)  
//         titleS.layoutVertically()
        let s2=textStacks.addStack()
        if(!item.isAllDay){
          let staTime = s2.addDate(item.startDate)
          let sep = s2.addText('-')
          sep.font=Font.systemFont(8)
          let finTime = s2.addDate(item.endDate)
          finTime.applyTimeStyle()
          finTime.font=Font.systemFont(8)
          staTime.applyTimeStyle()
          staTime.font=Font.systemFont(8)
        }
        const oDate = new Date(2001,00,01).getTime()
        const nDate = item.startDate.getTime()  
        var diff = ((nDate-oDate)/1000)
        let AllD=item.isAllDay?50000:0
        diff=Number(diff)+AllD
        log('diff is '+diff)
        s.url="calshow:"+diff
        //s.layoutVertically()
        
//         s.borderWidth=1
//         s.borderColor=Color.black()
        s.addSpacer()
      }
    }
  }
}