// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: red; icon-glyph: rss-square;
/*
|-------------------------------------|
|      Automators.fm Feed Widget      |
|                                     |
|          built by: mvan231          |
|                                     |
|                                     |
|                                     |
|                                     |
|                                     |
|-------------------------------------|
*/
let feed = 'scriptable'
let r = new Request(`https://talk.automators.fm/c/${feed}.json`)
let res = await r.loadJSON()
let userList = res.users
//log(userList)
res=res.topic_list.topics
//log(res)

let slicer = config.widgetFamily=='large'?11:6
res = res.slice(1,slicer)
//log(res.length)
//log(res)

let w = new ListWidget()

let finished = await Promise.all(
  res.map(async (fin)=> {
    let stacker = w.addStack()
    let left = stacker.addStack()
    stacker.addSpacer(5)
    let right = stacker.addStack()
    stacker.url = `https://talk.automators.fm/t/${fin.slug}`
    let userA = userList.filter(item => {
      if(item.id == fin.posters[0].user_id)return true
      return false
    })
    //log(userA)
    let avaUrl = `https://talk.automators.fm/${userA[0].avatar_template}`
    //log(avaUrl)
    avaUrl = avaUrl.replace(/\{size\}/,50)//100)
    //log(avaUrl)
    r.url = avaUrl
    let img = await r.loadImage(avaUrl)
    img = left.addImage(img)
    img.cornerRadius=15
    left.layoutVertically()
    img.resizable=true
    let t = right.addText(fin.title)
    t.font = Font.systemFont(12)
    t.textColor = Color.white()
    t.shadowColor = Color.black()
    t.shadowRadius = 3
    right.layoutVertically()
    left.size = new Size(0, 30)
    right.size=new Size(0, 30)
    stacker.layoutHorizontally()
    return stacker
  })
)

if(config.widgetFamily=='large'){
  let im = await getBackground()
  if(im != 'error')w.backgroundImage = im
}

w.backgroundColor=new Color('204b69')

let grad = new LinearGradient()
grad.colors = [new Color(Color.lightGray().hex,8/10),new Color(Color.darkGray().hex,10/10)]
grad.locations = [0,0.75]

w.backgroundGradient = grad

w.setPadding(20,5,20,5)

Script.setWidget(w)
Script.complete()
w.presentMedium()

async function getBackground(){
  try{
    r.url = 'https://i.imgur.com/MzimtwO.jpg'
    return await r.loadImage()
  }catch(e){
    return 'error'
  }
}