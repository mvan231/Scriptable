// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: light-gray; icon-glyph: calendar-alt;


/*
####################
####################
begin building widget
and start of script
####################
####################
*/

//calendar names can be added to the calIgnore array below if you do not want them to be shown in either the list of calendar events or the indicators on the month view
const calIgnore = ['']
/*--------------------------
|------version history------
v1.0 
- initial release

v1.1
- update to improve efficiency of loading with full medium widget
--------------------------*/

let needUpdated = await updateCheck(1.1)
log(needUpdated)



let widg,l,r
if(args.widgetParameter){
  widg=args.widgetParameter
}else{
  r=true
  l=true
}
var ind=0
let w = new ListWidget()
let main = w.addStack()
let left = main.addStack()
left.size=new Size(0, 135)
left.layoutVertically()
if(r && l)main.addSpacer(15)
let right = main.addStack()
right.size=new Size(0, 135)
right.layoutVertically()

const currentDayColor = "#000000";
const textColor = "#ffffff";
const textRed = "#ec534b";
let dF = new DateFormatter()
if (widg=='right')r=true
if (widg=='left')l=true

if(r)await createWidget();
if(l)await CalendarEvent.thisWeek().then(successCallback, failureCallback)
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

async function createWidget() {

  // opacity value for weekends and times
  const opacity = 0.6;

  const date = new Date();
  const dateFormatter = new DateFormatter();
  dateFormatter.dateFormat = "MMMM";

  // Current month line
  const monthLine = right.addStack();
  monthLine.addSpacer(4);
  addWidgetTextLine(monthLine, dateFormatter.string(date).toUpperCase() + (needUpdated? ' Update' : ''), {
    color: textRed,
    textSize: 12,
    font: Font.boldSystemFont(12),
  });

  // between the month name and the week calendar
//   right.addSpacer(1);

  const calendarStack = right.addStack();
  calendarStack.spacing = 2;

  const month = buildMonthVertical();
  for (let i = 0; i < month.length; i += 1) {
    let weekdayStack = calendarStack.addStack();
    weekdayStack.layoutVertically();

    for (let j = 0; j < month[i].length; j += 1) {
      let dateStack = weekdayStack.addStack();
      
      let dateStackUp = dateStack.addStack()
//       let dayStack = dateStackUp.addStack()  
      dateStackUp.size = new Size(20, 17);
      dateStackUp.centerAlignContent();   
      dateStack.size = new Size(20, 20);
      if (month[i][j] === date.getDate().toString()) {
        const highlightedDate = getHighlightedDate(
          date.getDate().toString(),
          currentDayColor
        );
        dateStackUp.addImage(highlightedDate);
      }else{
        addWidgetTextLine(dateStackUp, `${month[i][j]}`, {
          color: textColor,
          opacity: (i > 5 || i == 0) ? opacity : 1,
          font: Font.boldSystemFont(10),
          align: "left",
        });
      }
      
      let colorDotStack = dateStack.addStack()
      colorDotStack.size=new Size(20, 3)
      dateStack.layoutVertically()  
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
//           log(colors)
          if(colors.length>0){
            let colorDotsImg=colorDots(colors)
            colorDotStack.addSpacer()  
            let colDotsImg = colorDotStack.addImage(colorDotsImg)  
            colDotsImg.resizable=true
            colDotsImg.imageSize=new Size(20,3)
            colDotsImg.centerAlignImage()
    //         colDotsImg.applyFillingContentMode()
            colorDotStack.addSpacer()
          }
        }
      }
    }
  }

//   return widget;
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
  const firstDayStack = new Date(date.getFullYear(), date.getMonth(), 2);
  const lastDayStack = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  const month = [["S"],["M"], ["T"], ["W"], ["T"], ["F"], ["S"]];

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
  drawing.setFillColor(new Color(textRed));
  drawing.fillEllipse(new Rect(1, 1, size - 2, size - 2));
  drawing.setFont(Font.boldSystemFont(25));
  drawing.setTextAlignedCenter();
  drawing.setTextColor(new Color("#ffffff"));
  drawing.drawTextInRect(date, new Rect(0, 10, size, size));
  const currentDayImg = drawing.getImage();
  return currentDayImg;
}

/**
 * formats the event times into just hours
 *
 * @param  {Date} date
 *
 * @returns {string} time
 */
function formatTime(date) {
  let dateFormatter = new DateFormatter();
  dateFormatter.useNoDateStyle();
  dateFormatter.useShortTimeStyle();
  return dateFormatter.string(date);
}

/*
 * Adds a event name along with start and end times to widget stack
 *
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
  switch (align) {
    case "left":
      textLine.leftAlignText();
      break;
    case "center":
      textLine.centerAlignText();
      break;
    case "right":
      textLine.rightAlignText();
      break;
    default:
      textLine.leftAlignText();
      break;
  }
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

// function getColorDot(colorHex){
//   const context =new DrawContext()
//     context.size=new Size(10,10)
//     context.opaque=false
//     context.respectScreenScale=true
//     context.setFillColor(new Color('#'+colorHex))
//     const path = new Path()
//     path.addEllipse(new Rect(0, 0, 10,10))
//     context.addPath(path)
//     context.fillPath()
//     return context.getImage() 
// }

function f(item){
  let now = new Date()
//   log(item.title)
//   log('now '+now.getTime())  
//   log('startTime '+item.startDate.getTime())

  if (item.startDate.getTime() > now.getTime())
  {
    if(!calIgnore.includes(item.calendar.title)){
    
    ind+=1
//     log(ind)
    let s
    let h = 5
// log(h)
    if (ind <=5){
        s = left.addStack()
        s.setPadding(5,5,5,5)
        s.size= new Size(0, 27)
        let s1 = s.addStack()
        let imStack = s1.addStack()
        imStack.setPadding(2,0,2,0)
        let dot = colorDots([item.calendar.color.hex])//getColorDot(item.calendar.color.hex)
        dot.size=new Size(5,5)
        let im = imStack.addImage(dot)
          
//         let im = s1.addImage(dot)
        im.resizable=false
        
//         imStack.layoutVertically()        
//         let titleS = s1.addStack()
//         let titleS1 = titleS.addStack()
//         let tx = titleS1.addText(item.title)  
        let tx = s1.addText(item.title)
        tx.font=Font.systemFont(12)  
//         titleS1.layoutVertically()
        
        let dd = item.startDate
        dF.dateFormat='MMM d'
        let ddd=dF.string(dd)
        dF.dateFormat='EEE'
        let eee = dF.string(dd)
        
        let s2=s.addStack()
        let dt = s2.addText(eee+' '+ddd+' ')
        
        dt.font=Font.systemFont(8)
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
//         log('diff is '+diff)
        s.url="calshow:"+diff
        s.layoutVertically()
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
  let updateCheck = new Request('https://raw.githubusercontent.com/mvan231/Scriptable/main/Upcoming%20Calendar%20Indicator/Upcoming%20Calendar%20Indicator.json')
  let uC = await updateCheck.loadJSON()
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