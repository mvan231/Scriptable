// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: red; icon-glyph: dollar-sign;
// {"CAD":1.5542,"HKD":9.1412,"ISK":162.8,"PHP":57.083,"DKK":7.4422,"HUF":356.28,"CZK":27.11,"AUD":1.6405,"RON":4.8715,"SEK":10.42,"IDR":17340.01,"INR":86.1985,"BRL":6.5796,"RUB":90.9413,"HRK":7.5765,"JPY":124.95,"THB":36.629,"CHF":1.0773,"SGD":1.5986,"PLN":4.4702,"BGN":1.9558,"TRY":9.3279,"CNY":7.9047,"NOK":10.8623,"NZD":1.7821,"ZAR":19.4315,"USD":1.1795,"MXN":25.0833,"ILS":3.9859,"GBP":0.91167,"KRW":1350.52,"MYR":4.8808}

//updated by mvan231 to allow for free API subscription access
let base
if (args.widgetParameter)base=args.widgetParameter

let fm = FileManager.local()
let path = fm.documentsDirectory()+"/exchangeRateAPIKey.txt"

if (!fm.fileExists(path)){
  let a = new Alert()
  a.title = "API Key Entry"
  a.addTextField("API Key Here")
  a.message = "Add your API key here"
  a.addAction("OK")
  a.addCancelAction("I don't have one")
  let aRes = await a.presentAlert()
  aRes = a.textFieldValue(0)
  fm.writeString(path, aRes)
}
let key = fm.readString(path)

const w = new ListWidget()
w.backgroundColor = new Color("#222222")

const resp= await get({url:"http://api.exchangeratesapi.io/v1/latest?access_key="+key+"&symbols=CNY,GBP,CAD,RUB,JPY,AUD,USD"}) //add any synbols you would like to see

if (base){  
  base=resp.rates[base]
}else{
  base=1
}
//log(base)

for(let rate in resp.rates){
  const stack =w.addStack()
  stack.centerAlignContent()
  const img= await loadImage("https://www.ecb.europa.eu/shared/img/flags/"+rate+".gif")
  const imgw =stack.addImage(img)
  imgw.imageSize=new Size(20, 20)
  stack.addSpacer(10)
  let tx = stack.addText(rate)
  tx.textColor = Color.white()
  stack.addSpacer(10)
  let adjustedRate = resp.rates[rate]/base
  const textw = stack.addText(adjustedRate.toFixed(2))
  textw.textColor = Color.white()
  stack.addSpacer(5)
}

let date = new Date()
w.refreshAfterDate = new Date(date.getFullYear(),date.getMonth(),date.getDate()+1,00,00)

log(`will refresh after ${w.refreshAfterDate}`)

Script.setWidget(w)
Script.complete()
w.presentSmall()

async function get(opts) {
  const request = new Request(opts.url)
  request.headers = {
    ...opts.headers,
    ...this.defaultHeaders
  }
  var result=await request.loadJSON()
  log(result)
  return result
}

async function  loadImage(imgUrl) {
  let req = new Request(imgUrl)
  let image = await req.loadImage()
  return image
}
