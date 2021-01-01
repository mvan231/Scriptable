// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: light-gray; icon-glyph: calendar-alt;
let fm = FileManager.iCloud()
let scriptPath = fm.documentsDirectory()+'/UpcomingIndicator/'
let settingsPath = scriptPath+'settings.json'
const reRun = URLScheme.forRunningScript()
if(!fm.fileExists(scriptPath))fm.createDirectory(scriptPath, false)
let needUpdated = await updateCheck(1.4)
//log(needUpdated)
/*--------------------------
|------version history------
v1.0 
- initial release

v1.1
- update to improve efficiency of loading with full medium widget

v1.2
- add date URLs to the month view to allow you to tap on a date and go to it in the calendar app
- add spacing in cases where less than 5 events are found for the calendar event list (user choice to use this or not in the configuration section)
- add user choice for background color selection

v1.3
- error handling for no data connection
- new setup questions to help with getting things ready
- new transparency ability added (needs latest module of no-background.js to work, otherwise the widget will crash
- new shadow under event names on the left side list of events
- user choice of event list shadow color
- removal of extea left over code

v1.4
- include url to open calendar app When tapping the event title as well as the event time￼
- reduce size of date stacks' height for the calendar month view to accommodate large months
--------------------------*/
/*
####################
####################
begin building user
pref file
####################
####################
*/
let a,settings = {}

if(!fm.fileExists(settingsPath)){
  await setup()
} 

if(!config.runsInWidget && fm.fileExists(settingsPath) && !JSON.parse(fm.readString(settingsPath)).quickReset){
    let resetQ = new Alert()
    resetQ.title='Want to reset?'
    resetQ.message='If you tap "Yes" below, the settings for this widget will be reset and setup will run again'  
    resetQ.addAction('Yes')
    resetQ.addAction('No')
    a = await resetQ.presentSheet()
    if(a==0){
      fm.remove(settingsPath)
      Safari.open(reRun)
      throw new Error('running again now')
    }
}


settings = JSON.parse(fm.readString(settingsPath))
if(settings.quickReset)
{  
  settings.quickReset=false  
  log(settings)
  fm.writeString(settingsPath, JSON.stringify(settings))
}



/*
####################
####################
end building user
pref file
####################
####################
*/


/*
####################
####################
start of user definition - no longer needed as manuak entry as it is handled in setup questions
####################
####################
*/

//calendar names can be added to the calIgnore array below if you do not want them to be shown in either the list of calendar events or the indicators on the month view. These must be enclosed in single or double quotes.  

const calIgnore = settings.calsToIgnore

//set the flag for allowDynamicSpacing to true if you want extra soacing between the events in the left side event list if there are less than 5. If you don't want the dynamic spacing, set to false. 

const allowDynamicSpacing = settings.dynamicSpacing

//set the flag for monWeekStart to true if you want Monday to be the start of the week in the month view. If  you rather Sunday be the start of the week, then set to false.

const monWeekStart = settings.monStart


//set the useBackgroundColor flag to true to utilize the backgroundColor variable below. This can be set per your liking.

const useBackgroundColor = settings.useBackgroundColor

//backgroundColor below is setup as darkGray ny default but can be changed to hex as well

if(settings.useBackgroundColor){const backgroundColor = new Color(settings.backgroundColor)}

//useTransparency is setup during initialization questions. This determines if the transparency setting should be used or not
const useTransparency = settings.useTransparency

//useEventShadow is setup during initialization questions. This determines if the event name should have a shadow behind it to help with readability in some situations
const useEventShadow = settings.useEventShadow
let shadowColorLight,shadowColorDark
if (useEventShadow)
{
  shadowColorLight = '#'+settings.shadowColorLight
  shadowColorDark = '#'+settings.shadowColorDark
}
//eventFontSize sets the size of the event title to be displayed in the left side view. Default is 11.
const eventFontSize = settings.eventFontSize

//showCurrentAllDayEvents enables the ability to show an event that is happening today and is set as all day
const showCurrentAllDayEvents = settings.showCurrentAllDayEvents

//For more info see the github page.
/*
####################
####################
end of user definition
####################
####################
*/
let widg,l,r, h = 5
if(args.widgetParameter){
  widg=args.widgetParameter
}else{
  r=true
  l=true
}
let indexed = 0;
var eventCounter=0
let w = new ListWidget()
const currentDayColor = "#000000";
const textColor = "#ffffff";
const textRed = "#ec534b";
  
let dF = new DateFormatter()

dF.dateFormat='ZZ'
let tZOffsetSec = (dF.string(new Date())/100)*60*60
let dHolder,later

let main = w.addStack()
if (widg=='right')r=true
if (widg=='left')l=true
if(l){
  var left = main.addStack()
  left.size=new Size(0, 135) 
  left.layoutVertically()  
  await CalendarEvent.thisWeek().then(successCallback, failureCallback)
}
if(r && l)main.addSpacer()
if(r)
{  
  var right = main.addStack()  
  right.size=new Size(0, 135)
  right.layoutVertically()

  await createWidget();
}
if(useBackgroundColor)w.backgroundColor=new Color(settings.backgroundColor)

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

begin function section

####################
####################
*/

async function setup(){
  
  let quests = [{'key':'dynamicSpacing','q':'Do you want to enable dynamic spacing of the events in the left events view?'},{'key':'monStart','q':'Do you want the week to start on Monday in the right month view?'},{'key':'useBackgroundColor','q':'Do you want to use a backgroundColor different than the default white / black based on iOS appearance?'},{'key':'useTransparency','q':'Do you want to use the no-background.js transparency module?'},{'key':'showCurrentAllDayEvents','q':'Do you want to show "All Day" events that are happening today?'},{'key':'useEventShadow','q':'Do you want to show a shadow under the event name in the event list on the left of the widget (this helps for readability)?'}]

  await quests.reduce(async (memo,i)=>{
    await memo
    let q = new Alert()
    q.message=String(i.q)
    q.title='Setup'
    q.addAction('Yes')
    q.addAction('No')
    a=await q.presentSheet()
    settings[i.key]=(a==0)?true:false
  },undefined)  
  
  if (settings.useEventShadow)
  {
    let shadowColorLight = new Alert()
    shadowColorLight.title = 'shadowColor Setup'
    shadowColorLight.message = 'What color shadow would you like to utilize behind the text in the event list while in light mode?'
    shadowColorLight.addAction('White')
    shadowColorLight.addAction('Black')
    shadowColorLight.addAction('Green')
    shadowColorLight.addAction('Red')
    shadowColorLight.addAction('Blue')
    let sColorLight = await shadowColorLight.presentSheet()
    switch (sColorLight){
      case 0:
        settings.shadowColorLight=Color.white().hex
        break
      case 1:
        settings.shadowColorLight=Color.black().hex
        break
      case 2:
        settings.shadowColorLight=Color.green().hex
        break
      case 3:
        settings.shadowColorLight=Color.red().hex
        break
      case 4:
        settings.shadowColorLight=Color.blue().hex
        break
      default:
        settings.shadowColorLight=Color.black().hex
        break
    }
    
    let shadowColorDark = new Alert()
    shadowColorDark.title = 'shadowColor Setup'
    shadowColorDark.message = 'What color shadow would you like to utilize behind the text in the event list while in dark mode?'
    shadowColorDark.addAction('White')
    shadowColorDark.addAction('Black')
    shadowColorDark.addAction('Green')
    shadowColorDark.addAction('Red')
    shadowColorDark.addAction('Blue')
    let sColorDark = await shadowColorDark.presentSheet()
      switch (sColorDark){
        case 0:
          settings.shadowColorDark=Color.white().hex
          break
        case 1:
          settings.shadowColorDark=Color.black().hex
          break
        case 2:
          settings.shadowColorDark=Color.green().hex
          break
        case 3:
          settings.shadowColorDark=Color.red().hex
          break
        case 4:
          settings.shadowColorDark=Color.blue().hex
          break
        default:
          settings.shadowColorDark=Color.black().hex
          break
      }
  }
  
  if(settings.useBackgroundColor)
  {
    let q = new Alert()
    q.title='What color?'
    q.message='Please enter the hex color value to use as the background color of the widget (e.g. #FFFFFF)'   
    q.addTextField('hex color', '#')
    q.addAction("Done")
    await q.present()
    settings.backgroundColor = q.textFieldValue(0)
    //write the settings to iCloud Drive  
    fm.writeString(settingsPath, JSON.stringify(settings))
  }
  let eventFontS = new Alert()
  eventFontS.title='eventFontSize Setup'
  eventFontS.message='What font size should the event list be shown as?'
  eventFontS.addAction('Small')
  eventFontS.addAction('Normal')
  eventFontS.addAction('Large')
  
  let aa = await eventFontS.presentSheet()
  switch(aa){
    case 0:
      settings.eventFontSize=82/100
      break
    case 1:
      settings.eventFontSize=1
      break
    case 2:
      settings.eventFontSize=118/100
      break
  }
  log(settings)
  
  settings['calsToIgnore']=[]
  log('settings is now:\n'+settings)
  //write the settings to iCloud Drive
  fm.writeString(settingsPath, JSON.stringify(settings))
    
  let calIgnoreP = new Alert()
  calIgnoreP.title='calIgnore Setup'
  calIgnoreP.message='Do you want to prevent specific calendars from being displayed?'
  calIgnoreP.addAction('Yes')
  calIgnoreP.addAction('No')
  a= await calIgnoreP.presentSheet()
  
  settings['calIgnore']=(a==0)?true:false
  log(settings)
  let calIg = []
  if(settings.calIgnore){
    calIgnoreP=new Alert()
    calIgnoreP.message='In the next screen, please select the calendars to prevent from displaying'
    calIgnoreP.addAction('OK')
    await calIgnoreP.present()
    await Calendar.presentPicker(true).then((cals)=>{
      let cally =[]
      cals.forEach((f)=>{
        cally.push(f.title)
      })
      calIg = cally
    })
    
  }
  
  settings['calsToIgnore'] = calIg
  settings['quickReset']=true
  fm.writeString(settingsPath, JSON.stringify(settings))
  
  Safari.open(reRun)
  throw new Error('running again')  
}




async function createWidget() {  
  // opacity value for weekends and times
  const opacity = 6/10;  
  const oDate = new Date(2001,00,01).getTime(),date = new Date();   
  if(useTransparency) {
     let diff = ((new Date(date.getFullYear(),date.getMonth(),date.getDate())-oDate)/1000)
     diff=Number(diff)-tZOffsetSec
     right.url='calshow:'+diff
  }
  dF.dateFormat = "MMMM";

  // Current month line
  const monthLine = right.addStack();
  monthLine.addSpacer(4);
  addWidgetTextLine(monthLine, dF.string(date).toUpperCase() + (needUpdated? ' Update' : ''), {
    color: textRed,
    textSize: 12,
    font: Font.boldSystemFont(12),
  });

  const calendarStack = right.addStack();
  calendarStack.spacing = 3;

  const month = buildMonthVertical();
  
  for (let i = 0; i < month.length; i += 1) {
    let weekdayStack = calendarStack.addStack();
    weekdayStack.layoutVertically();

    for (let j = 0; j < month[i].length; j += 1) {
      let dateStack = weekdayStack.addStack();   
      let dateStackUp = dateStack.addStack()
      dateStackUp.size = new Size(20, 15);
      dateStackUp.centerAlignContent();   
      dateStack.size = new Size(20, 18);
      if (month[i][j] === date.getDate().toString()) {
        const highlightedDate = getHighlightedDate(
          date.getDate().toString(),
          currentDayColor
        );
        dateStackUp.addImage(highlightedDate);
      }else{
        let sat,sun
        if (monWeekStart){
          sat = 5
          sun = 6
        }else{
          sat = 6
          sun = 0
        }
        addWidgetTextLine(dateStackUp, `${month[i][j]}`,
        {
          color: textColor,
          opacity: (i == sat || i == sun) ? opacity : 1,
          font: Font.boldSystemFont(10),
          align: "left",
        });
      }
      
      if (!useTransparency){   
        const nDate = new Date(date.getFullYear(),date.getMonth(),month[i][j])
        let diff = ((nDate-oDate)/1000)
        diff=Number(diff)-tZOffsetSec
        dateStack.url='calshow:'+diff
      }
      let colorDotStack = dateStack.addStack()
      colorDotStack.size=new Size(20, 3)
      dateStack.layoutVertically() 
      colorDotStack.layoutHorizontally() 
      let yr = date.getFullYear()
      let mth = date.getMonth()
      let dots = [],colors=[]
      if (Number(month[i][j])) {
        let st = new Date(yr,mth,month[i][j],0,0)
        let fn = new Date(yr,mth,month[i][j],23,59)

        let events = await CalendarEvent.between(st, fn)
        if (events.length>0){       
          events.forEach((kk,index)=>{ 
           if(!calIgnore.includes(kk.calendar.title)){
            if(index<=5){
              if(!colors.includes(kk.calendar.color.hex)){
               colors.push(kk.calendar.color.hex)
              }
            }
           }
          })
          if(colors.length>0){
            let colorDotsImg=colorDots(colors)
            colorDotStack.addSpacer()  
            let colDotsImg = colorDotStack.addImage(colorDotsImg)  
            colDotsImg.resizable=true
            colDotsImg.imageSize=new Size(20,3)
            colDotsImg.centerAlignImage()
            colorDotStack.addSpacer()
          }
        }
      }
    }
  }
}

/**
 * Creates an array of arrays, where the inner arrays include the same weekdays
 * along with an identifier in 0 position
 * [
 *   [ 'M', ' ', '7', '14', '21', '28' ],
 *   [ 'T', '1', '8', '15', '22', '29' ],
 *   [ 'W', '2', '9', '16', '23', '30' ],
 *   ...
 * ]
 *
 * @returns {Array<Array<string>>}
 */
function buildMonthVertical() {
  const date = new Date();  
  const firstDayStack = new Date(date.getFullYear(), date.getMonth(), monWeekStart?1:2);
  const lastDayStack = new Date(date.getFullYear(), date.getMonth() + 1, 0);  
  let month
  if(!monWeekStart){
    month = [["S"],["M"], ["T"], ["W"], ["T"], ["F"], ["S"]];  
  }else{
    month = [["M"], ["T"], ["W"], ["T"], ["F"], ["S"],["S"]];}

  let dayStackCounter = 0;

  for (let i = 1; i < firstDayStack.getDay(); i += 1) {
    month[i - 1].push(" ");
    dayStackCounter = (dayStackCounter +1) % 7;
  }

  for (let date = 1; date <= lastDayStack.getDate(); date += 1) {
    month[dayStackCounter].push(`${date}`);
    dayStackCounter = (dayStackCounter + 1) % 7;
  }

  const length = month.reduce(
    (acc, dayStacks) => (dayStacks.length > acc ? dayStacks.length : acc),
    0
  );
  month.forEach((dayStacks, index) => {
    while (dayStacks.length < length) {
      month[index].push(" ");
    }
  });  

  return month;
}

/**
 * Draws a circle with a date on it for highlighting in calendar view
 *
 * @param  {string} date to draw into the circle
 *
 * @returns {Image} a circle with the date
 */

function getHighlightedDate(date) {
  const drawing = new DrawContext();
  drawing.respectScreenScale = true;
  const size = 50;
  drawing.size = new Size(size, size);
  drawing.opaque = false;
  drawing.setFillColor(new Color('#ec534b'));
  drawing.fillEllipse(new Rect(1, 1, size - 2, size - 2));
  drawing.setFont(Font.boldSystemFont(25));
  drawing.setTextAlignedCenter();
  drawing.setTextColor(new Color("#ffffff"));
  drawing.drawTextInRect(date, new Rect(0, 10, size, size));
  const currentDayImg = drawing.getImage();
  return currentDayImg;
}

/*
 * Adds a event name along with start and end times to widget stack
 * @param  {WidgetStack} stack - onto which the event is added
 * @param  {CalendarEvent} event - an event to add on the stack
 * @param  {number} opacity - text opacity
 */

function addWidgetTextLine(
  widget,
  text,
  {
    color = "#ffffff",
    textSize = 12,
    opacity = 1,
    align,
    font = "",
    lineLimit = 0,
  }
) {
  let textLine = widget.addText(text);
  if (typeof font === "string") {
    textLine.font = new Font(font, textSize);
  } else {
    textLine.font = font;
  }
  textLine.textOpacity = opacity;
}

async function successCallback(result) {
  calcal=result
  await CalendarEvent.nextWeek().then((res) => {
    newCalArray = res
  })
  newCalArray = mergeArrays(calcal,newCalArray)

  newCalArray.forEach(eventCount)

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

function eventCount(item){
  let now = new Date()

  if (item.startDate.getTime() > now.getTime() || (showCurrentAllDayEvents?(item.startDate.getDate()==now.getDate() &&  item.isAllDay):false))
  {
    if(!calIgnore.includes(item.calendar.title)){
      eventCounter +=1
    }      
  }
}


function f(item){
  eventDisplay = (eventFontSize>1)?3 : 5
  const date = new Date(); 
  if (item.startDate.getTime() > date.getTime() || (showCurrentAllDayEvents?(item.startDate.getDate()==date.getDate() &&  item.isAllDay):false))
  {
    if(!calIgnore.includes(item.calendar.title))
    {
      indexed+=1  
      if(!allowDynamicSpacing)eventCounter=null
      switch (eventCounter) {
        case 1:
        case 2:
        case 3:
          spacer = null
          break;
        case 4:
          spacer = 3
          break;
        default:
          spacer = 0
          break;
          }
      if(indexed <= eventDisplay)
      {      
        const oDate = new Date(2001,00,01).getTime()
        dF.dateFormat='MMM d'
        let dd = item.startDate
        let ddd=dF.string(dd)
        if(!dHolder && dF.string(date)==ddd)         
        {
          let when = left.addText(' TODAY ')
//           indexed+=1
          when.font=Font.boldSystemFont(8*eventFontSize)
          //when.textOpacity=0.6
        }else if(ddd!=dHolder && !later){
          left.addSpacer(2)
          let when = left.addText(' LATER ')
          //indexed+=1
          when.font=Font.boldSystemFont(8*eventFontSize)
          //when.textOpacity=0.6
          later = true
        }
        let s = left.addStack()      
        dHolder = ddd
        let tx = left.addText(item.title)
       tx.font=Font.boldMonospacedSystemFont(11*eventFontSize)         
        tx.textColor=new Color(item.calendar.color.hex)
        if(useEventShadow){
          //add a shadow
          tx.shadowRadius=4
          //shadow color for the calendar event title
          tx.shadowColor=Color.dynamic(new Color(shadowColorLight), new Color(shadowColorDark))  
        }
        dF.dateFormat='EEE'
        let eee = dF.string(dd)        
        let dt = eee+' '+ddd+' '
        if(!item.isAllDay){
          let staTime = item.startDate
          let sep = '-'
          let finTime = item.endDate
          dF.dateFormat='h:mm'
          let sAndFTimes = dF.string(staTime)+sep+dF.string(finTime)
          dt = dt + sAndFTimes
        }
        dt = left.addText(dt)
        dt.font=Font.systemFont(8*eventFontSize)
        const nDate = item.startDate.getTime()
        var diff = ((nDate-oDate)/1000)
        diff=Number(diff)-tZOffsetSec
        dt.url="calshow:"+diff
        tx.url="calshow:"+diff
      }
    }
    
  }
}

function colorDots(colors){
//   let colors = ['ffffff','f17c37','3e9cbf','ffffff','f17c37','3e9cbf']  
  let numE = colors.length  
  let img = colDot(numE)
  return img
  
  function colDot(numE){  
    const context =new DrawContext()
    context.size=new Size(10*numE,10)
    context.opaque=false
    context.respectScreenScale=true
    const path = new Path()
    
    for (let i = 0;i<numE;i++){
    context.setFillColor(new Color('#'+colors[i]))
    context.fillEllipse(new Rect(10*i, 0, 10,10))
    }
    context.addPath(path)    
    context.fillPath()
    return context.getImage()  
  } 
}

async function updateCheck(version){
  /*
  #####
  Update Check
  #####
  */   
  let uC   
  try{let updateCheck = new Request('https://raw.githubusercontent.com/mvan231/Scriptable/main/Upcoming%20Calendar%20Indicator/Upcoming%20Calendar%20Indicator.json')
  
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
    upd.add
    upd.message="Changes:\n"+uC.notes+"\n\nPress OK to get the update from GitHub"
      if (await upd.present()==0){
      Safari.open("https://raw.githubusercontent.com/mvan231/Scriptable/main/Upcoming%20Calendar%20Indicator/Upcoming%20Calendar%20Indicator.js")
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