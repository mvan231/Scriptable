// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: orange; icon-glyph: magic;
let widget = new ListWidget() 
let url = "https://coronavirus-19-api.herokuapp.com/countries/Canada" 

//load data from API
let req = new Request(url) 
let json = await req.loadJSON()

//get background image
let imgReq = new Request('https://i.imgur.com/WYmGnnH.jpg')
let img = await imgReq.loadImage()

log(json)

//get the data from the JSON
let todayCases = json['todayCases'].toString() 
let todayDeaths = json['todayDeaths'].toString()
let recovered = json['recovered'].toString()
let active = json['active'].toString()
let deaths = json['deaths'].toString()
let cases = json['cases'].toString()

const date = new Date()
const widgetTitle = widget.addText("🦠 " + date.toLocaleDateString()) 
widgetTitle.font = Font.systemFont(15) 

//add items to the widget
addItem('total cases', cases)
addItem('total deaths', deaths)
addItem('active', active)
addItem('recovered', recovered)
addItem('cases today', todayCases)
addItem('deaths today', todayDeaths)

// Finalize widget settings 
widget.setPadding(16,16,16,0) 
widget.spacing = -2
widget.backgroundImage=img
Script.setWidget(widget) 
widget.presentSmall() 
Script.complete()


function addItem(item,itemValue){
  let val = widget.addText(itemValue) 
  val.font=Font.mediumRoundedSystemFont(12)
  const subt1 = widget.addText(item) 
  subt1.font = Font.systemFont(9) 
  subt1.textColor = Color.darkGray()
}
