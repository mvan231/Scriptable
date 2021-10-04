// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: red; icon-glyph: rss-square;
/*
|-------------------------------------|
|      Automators.fm Feed Widget      |
|                                     |
|          built by: mvan231          |
|                                     |
|The 'feed' item below can be any feed|
|from the automators.fm site          |
|(i.e. ios/shortcuts)                 |
|                                     |
|The 'showThreadPostNum' boolean is   |                                     |used to determine whether the number |
|of thread posts on the shown thread, |                                    |will be displayed before the title.  |
|                                     |
|              Version                |
|1.1 - fix for small widget's not     |
|being tappable.                      |
|-------------------------------------|
*/

let showThreadPostNum = true

let feed = args.widgetParameter?args.widgetParameter:'scriptable'

let r = new Request(`https://talk.automators.fm/c/${feed}.json`)
let res = await r.loadJSON()
let userList = res.users
//log(userList)
res=res.topic_list.topics
//log(res)

let slicer = config.widgetFamily=='large'?12:6
res = res.slice(1,slicer)

let w = new ListWidget()

let posts = await Promise.all(
  res.map(async (fin)=> {
    let url = `https://talk.automators.fm/t/${fin.slug}`
    let userA = userList.filter(item => {
      if(item.id == fin.posters[0].user_id)return true
      return false
    })
    let avaUrl = `https://talk.automators.fm/${userA[0].avatar_template}`
    avaUrl = avaUrl.replace(/\{size\}/,50)//100)
    r.url = avaUrl
    let avatar_image = await r.loadImage(avaUrl)
    let title = fin.title
    let postsCount = fin.posts_count
    return {url, avatar_image, title, postsCount}
  })
)

for (post of posts){
  let stacker = w.addStack()
  let left = stacker.addStack()
  stacker.addSpacer(5)
  let right = stacker.addStack()
  stacker.url = post.url
  let img = left.addImage(post.avatar_image)
  img.cornerRadius=15
  left.layoutVertically()
  img.resizable=true
  let t = right.addText(`${showThreadPostNum?'{'+post.postsCount+'} ':''}${post.title}`)
  t.font = Font.systemFont(12)
  t.textColor = Color.white()
  t.shadowColor = Color.black()
  t.shadowRadius = 3
  right.layoutVertically()
  left.size = new Size(0, 30)
  right.size=new Size(0, 30)
  stacker.layoutHorizontally()
}

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

w.url= `https://talk.automators.fm/c/${feed}`

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