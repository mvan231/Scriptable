// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: purple; icon-glyph: rss-square;
//api endpoints
//'/api/v1/accounts/:id/statuses'
//'https://mastodon.social/api/v1/accounts/lookup?acct=mvan231'

//example link for widget parameter
//https://mastodon.social/@mvan231

const showLog = false

let url = args.widgetParameter?args.widgetParameter:`https://mastodon.social/@mvan231`

//url='https://mstdn.social/@ClubTeleMatique'

let reg = /(?<=https\:\/\/).*?(?=\/)/
const domain = url.match(reg)[0]
if(showLog) log(`domain:${domain}`)
reg = /\@.*?$/
let usern = url.match(reg)[0]
if(showLog)log(`user:${usern}`)

url = `https://${domain}/api/v1/accounts/lookup?acct=${usern}`

let r = new Request(url)
let res = await r.loadString()
//if(showLog)log(res)
res=JSON.parse(res)
//if(showLog)log(res)
//if(showLog)log(res.id)
url=`https://${domain}/api/v1/accounts/${res.id}/statuses?exclude_reblogs=true&exclude_replies=true`
r.url = url
res = await r.loadString()
//if(showLog)log(res)

res=JSON.parse(res)

let w = new ListWidget()
w.setPadding(5,7,7,7)
let titleSt = w.addStack()
titleSt.layoutHorizontally()
let i = titleSt.addImage(icon())
titleSt.addSpacer(5)
i.imageSize = new Size(20,20)
titleSt.addText(Script.name())

let grad = new LinearGradient()
grad.colors = [new Color(Color.gray().hex,0.3), new Color(Color.gray().hex,0.8)]
grad.startPoint = new Point(0,0)
grad.endPoint = new Point(1,1)
grad.locations= [0,1]
w.backgroundGradient = grad

titleSt.addSpacer()
let userSt = titleSt.addStack()
userSt.addSpacer()
userSt.layoutVertically()
userSt.size = new Size(0, 20)
let username = userSt.addText(res[0].account.username)
username.font = Font.systemFont(10)

addLine()

//convert all `u003c` to `<` and `u003e` to `>` you get a real html string. And then possibly use WebView to decode other HTML entities.
let ar = []
await reLoop()

Script.setWidget(w)
Script.complete()
w.presentMedium()

/*$$$$$$$$$$$$$$$$$$$$$$$$$

$$$ Start Functions $$$

$$$$$$$$$$$$$$$$$$$$$$$$$*/

async function reLoop(){
  //reLoop function loops through the user's posts and determines how many to add to the widget'
  convPost = await convertPostContent(res[0].content)
  postLengthThrsld = (config.widgetFamily=='large')?200:150
  let postsToShow = convPost.length < postLengthThrsld?(config.widgetFamily=='large')?4:2:1
  if(config.widgetFamily=='large')
  if(showLog)log(`posts to show:${postsToShow}`)
  for (const re of res) {
      ar.push(re.url)
      if(ar.length <=postsToShow){
        //log(re)
        let info = await convertPostContent(re.content)
        if(showLog)log(info.length)
        if(showLog)log(info)
        //if(showLog)log(re.url)
        //if(showLog)log(ar.length)
        let tSt = w.addStack()
        let t = tSt.addText(info)
        tSt.size = new Size(0, postsToShow==1? 0:(config.widgetFamily=='large')?70:50)
        
        if(postsToShow==1) t.minimumScaleFactor=0.8
        t.url = re.url
        if(postsToShow>1 && ar.length<postsToShow)addLine()

      }
  }
}

/*$$$$$$$$$$$$$$$$$$$$$$$$$
code below is thanks to normal-tangeine8609#3735 from Discord
https://discord.com/channels/760937324711641108/760944681134850048/1100530844952703037
🔽🔽🔽🔽🔽🔽
$$$$$$$$$$$$$$$$$$$$$$$$$*/
async function convertPostContent(content){
  
  //this function converts the Mastodon content text into readable text instead of HTML encoded text
  const text = content
  const html = text.replace(/u003e/g, ">").replace(/u003c/g, "<").replace(/u0026/g, "&")
  
  const wv = new WebView()
  await wv.loadHTML(html)
  
  const paragraphs = await wv.evaluateJavaScript(`completion([...document.querySelectorAll("p")].map(e => e.innerText))`, true)
    
  data = paragraphs.join("\n\n")
  //if(showLog)log(data)
  return data
}
/*$$$$$$$$$$$$$$$$$$$$$$$$$
🔼🔼🔼🔼🔼🔼
code above is thanks to normal-tangeine8609#3735 from Discord
$$$$$$$$$$$$$$$$$$$$$$$$$*/

function addLine(){
  //add a centered line to the widget
  let lineSt = w.addStack()
  lineSt.addSpacer()
  let line = lineSt.addImage(lineSep())
  line.centerAlignImage()
  line.imageOpacity = 0.8
  line.resizable = true
  lineSt.addSpacer()
  lineSt.layoutHorizontally()
  lineSt.setPadding(2,0,2,0)
}

function lineSep(){
  //generate line separator
  const context =new DrawContext()
  let width = 200,h=1
  context.size=new Size(width, h)
  context.opaque=false
  context.respectScreenScale=true
  const path = new Path()
  path.move(new Point(1,h))
  path.addLine(new Point(width,h))
  context.addPath(path)
  context.setStrokeColor(Color.gray())
  context.strokePath()
  return context.getImage()
}

function icon(){
  //provide mastodon icon using base64
  return Image.fromData(Data.fromBase64String("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"))
}