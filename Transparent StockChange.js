// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-gray; icon-glyph: chart-line;
// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-blue; icon-glyph: book; share-sheet-inputs: plain-text;
// Stock Ticker Widget
const nobg = importModule('no-background')
const BG_IMAGE = await nobg.getSlice('medium-top')

let stocksInfo = await getStockData()
let widget = await createWidget()
if (config.runsInWidget) {
  // The script runs inside a widget, so we pass our instance of ListWidget to be shown inside the widget on the Home Screen.
  Script.setWidget(widget)
} else {
  // The script runs inside the app, so we preview the widget.
  widget.presentMedium()
}
// Calling Script.complete() signals to Scriptable that the script have finished running.
// This can speed up the execution, in particular when running the script from Shortcuts or using Siri.
Script.complete()

async function createWidget(api) {
  
  let upticker = SFSymbol.named("chevron.up");
  let downticker = SFSymbol.named("chevron.down");
 
  let widget = new ListWidget()
  // Add background gradient
  let gradient = new LinearGradient()
  gradient.locations = [0, 1]
  gradient.colors = [
    new Color("32323d"),
    new Color("32323d")
  ]
//   widget.backgroundGradient = gradient
  
  //new background image
  widget.backgroundImage = BG_IMAGE
  let redColor = new Color("EB5494")
  let greenColor = new Color("75FBDE")

var numStocks = stocksInfo.length
let stackHolder
let curStack
let st1,st2
let mainStack = widget.addStack()
let currentStock
  for(j=0; j<numStocks; j++)
  {
    if (j<numStocks)currentStock = stocksInfo[j];
//     let nextStock = stocksInfo[j+1];
    if ((j)%8==0){
//      if (!st1){ 
      stackHolder = mainStack.addStack()
      mainStack.addSpacer()
//       stackHolder=st1
//       }
    }
    
//   else if ((1+j)/8 > 1 && (1+j)/8 <=16) {
//     if (!st2){
//       mainStack.addSpacer(2)
//       st2 = mainStack.addStack()
//       stackHolder=st2
//       }
// 
//     }
    
    curStack = stackHolder
    
//     widget.addStack();
    
    
    // Add Stock Symbol
    let aStack = curStack.addStack()
    let stockSymbol = aStack.addText(currentStock.symbol);
    stockSymbol.textColor = Color.white();
    stockSymbol.font = Font.boldMonospacedSystemFont(12);
   
    //Add Today's change in price
    aStack.addSpacer();
    let changeValue = aStack.addText(currentStock.changepercent+"%");
    if(currentStock.changepercent < 0) {
      changeValue.textColor = redColor;
    } else {
      changeValue.textColor = greenColor;
    }
    changeValue.font = Font.boldMonospacedSystemFont(12);
    
    // Add Ticker icon
    aStack.addSpacer(1);
    let ticker = null;
    if(currentStock.changevalue < 0){
      ticker = aStack.addImage(downticker.image);
      ticker.tintColor = redColor;
    } else {
      ticker = aStack.addImage(upticker.image);
      ticker.tintColor = greenColor;
    }
       
    ticker.imageSize = new Size(8,8);
    aStack.layoutHorizontally()
//     curStack.layoutHorizontally()
    if (j%8==0){
    curStack.layoutVertically()
    }
   
//     mainStack.addSpacer(2);
   
  }
  mainStack.layoutHorizontally()
  return widget
}

async function getStockData() { 
  let stocks = null;
// Read from WidgetParameter if present or use hardcoded values
// Provide values in Widget Parameter as comma seperated list  
  if(args.widgetParameter == null) {
    stocks = ["SNAP", "PTON", "ZM", "TSLA", "AAPL", "ETSY", "CVNA", "DOCU", "SHOP", "SQ", "FSLY", "GOOGL", "NFLX", "AMZN", "SPOT", "IPOC"];
  } else {
    stocks = args.widgetParameter.split(",");
  }
 
  let stocksdata = [];
  for(i=0; i< stocks.length; i++)
  {
    let stkdata = await queryStockData(stocks[i].trim());
    let price = stkdata.quoteSummary.result[0].price;
    let priceKeys = Object.keys(price);
 
    let data = {};
    data.symbol = price.symbol;
    data.changepercent = (price.regularMarketChangePercent.raw * 100).toFixed(1);
    data.changevalue = price.regularMarketChange.raw.toFixed(2);
    data.price = price.regularMarketPrice.raw.toFixed(2);
    data.high = price.regularMarketDayHigh.raw.toFixed(2);
    data.low = price.regularMarketDayLow.raw.toFixed(2);
    data.prevclose = price.regularMarketPreviousClose.raw.toFixed(2);
    data.name = price.shortName;
    stocksdata.push(data);
   
  }
  return stocksdata;
}

async function queryStockData(symbol) {
  let url = "https://query1.finance.yahoo.com/v10/finance/quoteSummary/" + symbol + "?modules=price"
  let req = new Request(url)
  return await req.loadJSON()
}