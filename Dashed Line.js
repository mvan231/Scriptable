// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: light-brown; icon-glyph: magic;
let line = lineSep(false,10) //first argument is vertical boolean, second argument is number if dashes

QuickLook.present(line, true)
  
function lineSep(vertical,numDashes){
  const context =new DrawContext()
  var width,h,dashLength
  if (!vertical)
  {
    width = 200
    h=1
    dashLength = width/numDashes
  }else{
    width = 1
    h = 200
    dashLength = h/numDashes
  }
  context.size=new Size(width, h)
  context.opaque=false
  context.respectScreenScale=true
  
  let Colors = [Color.green(),Color.black(),Color.green(),Color.red(),Color.brown(),Color.cyan(),Color.magenta(),Color.purple(),Color.orange(),Color.yellow(),Color.white()]
  log(dashLength)
  for (let i = 0; i<numDashes;i++){  
    path = new Path()
    pos = (dashLength*i)
    
    if(!vertical)
    {
      path.move(new Point(pos,h))
      path.addLine(new Point(pos+dashLength-5,h))  
    }else{
      path.move(new Point(width,pos))
      path.addLine(new Point(width,pos+dashLength-(dashLength/5)))  
    }
    context.addPath(path)
    color = (i+1>Colors.length)?Colors[1]:Colors[i]
    log(color)
    context.setStrokeColor(color)
    context.strokePath()  

  }
    
  return context.getImage()
}
