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

const eventsToShow = 10

/*
####################
####################

begin building widget
and start of script

####################
####################
*/


let w = new ListWidget()
var ind=0
let main = w.addStack()
let left = main.addStack()
left.size=new Size(140, 135)
main.addSpacer(1)
let right = main.addStack()
right.size=new Size(140, 135)
main.layoutHorizontally()
left.layoutVertically()
right.layoutVertically()
let dF = new DateFormatter()
await CalendarEvent.thisWeek().then(successCallback, failureCallback)
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
  let now = new Date()
  log(item.title)
  log('now '+now.getTime())  
  log('startTime '+item.startDate.getTime())

  if (item.startDate.getTime() > now.getTime())
  {
    ind+=1
    log(ind)
    let s
    if (ind <=eventsToShow){
      if (ind <=eventsToShow/2)
      {
        s = left.addStack()
      }else if (ind >eventsToShow/2)
        {
          s=right.addStack()
        }
        let dot = getColorDot(item.calendar.color.hex)
        s.setPadding(5,5,5,5)
        s.size= new Size(140, 27)
        let s1 = s.addStack()
        let imStack = s1.addStack()
        imStack.setPadding(2,0,2,0)
        let im = imStack.addImage(dot)
        imStack.layoutVertically()        
        let titleS = s1.addStack()
        im.resizable=false
        let titleS1 = titleS.addStack()
        let tx = titleS1.addText(item.title)
        titleS1.layoutVertically()
        tx.font=Font.systemFont(12)
        let s2=s.addStack()
        let dd = item.startDate
        dF.dateFormat='MMM d'
        let ddd=dF.string(dd)
        dF.dateFormat='EEE'
        let eee = dF.string(dd)
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
        log('diff is '+diff)
        s.url="calshow:"+diff
        s.layoutVertically()
    }
  }
}