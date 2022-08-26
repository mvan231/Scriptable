// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: yellow; icon-glyph: magic;
// Scriptable path
var scriptablePath = "/var/mobile/Library/Mobile Documents/iCloud~dk~simonbs~Scriptable/Documents/";

const canvSize = 100;
const canvTextSize = 24;
const canvas = new DrawContext();
canvas.opaque = false;

const canvWidth = 21; //Circle thickness
const canvRadius = 50; //Circle radius

canvas.size = new Size(canvSize, canvSize);
canvas.respectScreenScale = true;

// Vodafone logo
var V_logoName = "Vodafone_logo1.PNG"
let V_logoPath = scriptablePath+V_logoName.toString();
log(V_logoPath)
let fm = FileManager.iCloud()
V_logoPath=fm.documentsDirectory() + "/"+V_logoName
let V_image = fm.readImage(V_logoPath)

let oggi = new Date().getDate()
let rinnovoVodafone = new Date(2021, nuovomeseVodafone(12,new Date().getMonth()), 12)
let differenzaVodafone = Math.ceil((rinnovoVodafone - oggi)/86400000)
let rapportoVodafone = 1-(differenzaVodafone/1000)

// Create the widget
let w = new ListWidget()
//     w.backgroundColor = colorBG
    w.setPadding(12, 12, 12, 12)

let main = w.addStack()
// Vodafone red ring
drawArc(
  Math.floor(rapportoVodafone * 100 * 3.6),
  Color.red(),
  Color.white(),
  Color.blue(),
  Math.floor(rapportoVodafone * 100).toString(),
  "",
  V_image
)
drawArc(
  Math.floor(rapportoVodafone * 100 * 3.6),
  Color.red(),
  Color.white(),
  Color.blue(),
  Math.floor(rapportoVodafone * 100).toString(),
  "",
  V_image
)
drawArc(
  Math.floor(rapportoVodafone * 100 * 3.6),
  Color.red(),
  Color.white(),
  Color.blue(),
  Math.floor(rapportoVodafone * 100).toString(),
  "",
  V_image
)
main.layoutHorizontally()
Script.setWidget(w);
w.presentMedium();
Script.complete();


/*$$$$$$$$$$$$$$$$$$$$$$$$
$$$$$$$$$$$$$$$$$$$$$$$$

$$ Functions Start Here $$

$$$$$$$$$$$$$$$$$$$$$$$$
$$$$$$$$$$$$$$$$$$$$$$$$*/

//Vodafone
function nuovomeseVodafone(giorno,mese) {
    if (1<=giorno && giorno<=12)return mese
    if (13<=giorno && giorno<=31)return mese+1
}


function sinDeg(deg) {
  return Math.sin((deg * Math.PI) / 180);
}

function cosDeg(deg) {
  return Math.cos((deg * Math.PI) / 180);
}

function drawArc(deg, fillColor, strokeColor, txtColor, text, label,image) {
  let ctr = new Point(canvSize / 2, canvSize / 2),
  bgx = ctr.x - canvRadius;
  bgy = ctr.y - canvRadius;
  bgd = 2 * canvRadius;
  bgr = new Rect(bgx, bgy, bgd, bgd);

  // canvas.opaque = false;

  canvas.setFillColor(fillColor);
  canvas.setStrokeColor(strokeColor);
  canvas.setLineWidth(canvWidth);
  canvas.strokeEllipse(bgr);

  for (t = 0; t < deg; t++) {
    rect_x = ctr.x + canvRadius * sinDeg(t) - canvWidth / 2;
    rect_y = ctr.y - canvRadius * cosDeg(t) - canvWidth / 2;
    rect_r = new Rect(rect_x, rect_y, canvWidth, canvWidth);
    canvas.fillEllipse(rect_r);
  }
  // attempt to draw info text
  const canvTextRect = new Rect(
    0,
    (canvSize/2) - canvTextSize / 2,
    canvSize,
    canvTextSize
  );
  const canvLabelRect = new Rect(
    0,
    ((canvSize/2) - canvTextSize / 2)-30,
    canvSize,
    canvTextSize+5
  );
  canvas.setTextAlignedCenter();
  canvas.setTextColor(txtColor);
  canvas.setFont(Font.boldSystemFont(canvTextSize));
  canvas.drawTextInRect(text, canvTextRect);
  canvas.drawTextInRect(label, canvLabelRect);
  canvas.drawImageInRect(image, bgr)
  let stk = main.addStack()
  stk.addImage(canvas.getImage())
  return canvas.getImage()
}
