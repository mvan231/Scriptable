// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: light-gray; icon-glyph: calendar-alt;
/*

version:3

*/

/*
####################
####################
begin configuration
(user definable)
####################
####################
*/

const eventsToShow = 10

//sets whether or not to display reminders in the widget
const showReminders = false

//sets whether ir not to use the no-background.js module
const useTransparency = true

/*
####################
####################
begin settings file info
####################
####################
*/
let fm = FileManager.iCloud()
let scriptPath = fm.documentsDirectory()+'/UpcomingCalendarWidget/'
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
####################
####################
*/
let widgSizeSmall=false
if(config.widgetFamily=='small')widgSizeSmall=true
let w = new ListWidget()
var ind=0
w.setPadding(5,20,5,5)
let main = w.addStack()
main.addSpacer()
let right,left = main.addStack()
left.size=new Size(170, 0)//135)
if (!widgSizeSmall){
main.addSpacer(0)
right = main.addStack()
right.size=new Size(170, 0)//135)
right.layoutVertically()
}
main.layoutHorizontally()
left.layoutVertically()

let dF = new DateFormatter()
dF.dateFormat='ZZ'
let tZOffsetSec = (dF.string(new Date())/100)*60*60
await CalendarEvent.thisWeek().then(successCallback, failureCallback)

if(useTransparency){
const RESET_BACKGROUND = !config.runsInWidget
const { transparent } = importModule('no-background')
w.backgroundImage = await transparent(Script.name(), RESET_BACKGROUND)
}

Script.setWidget(w)
Script.complete()
w.presentMedium()


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
  if(showReminders){
    remin = await Reminder.allDueThisWeek()
    reminNext=await Reminder.allDueNextWeek()
    newCalArray = mergeArrays(calcal,newCalArray,remin,reminNext)
  }else{
    newCalArray = mergeArrays(calcal,newCalArray)
  }
  newCalArray=JSON.stringify(newCalArray).replace(/dueDate/g, 'startDate')
  
  newCalArray=JSON.parse(newCalArray)
// Sort array by date in ASCENDING order
  newCalArray.sort(function (a, b) {
    if (a.startDate > b.startDate) return 1;
    if (a.startDate < b.startDate) return -1;
    return 0;
  });
  //newCalArray.forEach(eventCount)

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

function getColorDot(colorHex){
  const context =new DrawContext()
    context.size=new Size(10,10)
    context.opaque=false
    context.respectScreenScale=true
    context.setFillColor(new Color('#'+colorHex))
    const path = new Path()
    path.addEllipse(new Rect(0, 0, 10,10))
    context.addPath(path)
    context.fillPath()
    return context.getImage() 
}

function f(item){
  //const date = new Date(); 
  let isCalEvent
  if('endDate' in item){
    isCalEvent=true
  }else{
    isCalEvent=false
  }  
  let now = new Date()
  dF.dateFormat='yyyy-MM-dd HH:mm:ss.SSSZ'
  let dateString = item.startDate.toString()
  dateString=dateString.replace('T', ' ')
//   log(dateString)
  item.startDate = dF.date(dateString)
  if(isCalEvent){
    dateString=item.endDate.toString()
    dateString=dateString.replace('T',' ')
    item.endDate = dF.date(dateString)
  }
//   log(item.startDate+'\n'+isCalEvent?item.endDate:'')
//   log(item)  log(item.title)
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
      if (ind <= eventsToShow/2)
      {
        s = left.addStack()
        addIt()
      }else if ((ind >eventsToShow/2) && !widgSizeSmall)
        {
          s=right.addStack()
          addIt()
        }
        
      function addIt(){
          
        //let dot = getColorDot(item.calendar.color.hex)
        s.setPadding(5,5,5,5)
        s.size= new Size(150, 27)
        let s1 = s.addStack()
        let imStack = s1.addStack()
        imStack.setPadding(2,0,2,0)
        //let im = imStack.addImage(dot)
        //im.resizable=false
        imStack.layoutVertically()        
        let titleS = s1.addStack()
        let titleS1 = titleS.addStack()
        let tx = s1.addText((isCalEvent?'':item.isCompleted?'☑':'☐')+item.title)
        //let tx = titleS1.addText(item.title)
        tx.font=Font.systemFont(12)  
        tx.textColor= new Color(item.calendar.color.hex)
        titleS1.layoutVertically()
        let s2=s.addStack()
        let dd = item.startDate
        dF.dateFormat='MMM d'
        let ddd=dF.string(dd)
        dF.dateFormat='EEE'
        let eee = dF.string(dd)
        let dt = eee+' '+ddd+' '
        //let dt = s2.addText(eee+' '+ddd+' ')
        dt.font=Font.systemFont(8)
        if(!item.isAllDay){    
          dF.dateFormat= 'h:mma'
          let sAndFTimes = isCalEvent?dF.string(item.startDate)+'-'+dF.string(item.endDate):dF.string(item.startDate)            
          dt = dt + sAndFTimes          
        }
        dt = s2.addText(dt)
        dt.font=Font.systemFont(8)
        const oDate = new Date(2001,00,01).getTime()
        const nDate = item.startDate.getTime()  
        var diff = ((nDate-oDate)/1000)
        let AllD=item.isAllDay?50000:0
        var diff = ((nDate-oDate)/1000)
        diff=Number(diff)-tZOffsetSec
        tx.url=isCalEvent?"calshow:"+diff:"x-apple-reminderkit://"
        s.layoutVertically()
      }
    }
  }
}