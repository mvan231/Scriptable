// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-green; icon-glyph: magic;
/*
##########

Script created by:
mvan231

This script will backup all of your current scripts into the iCloud Drive Scriptable directory underneath the folder "ScriptBackup" and then under "yyyy_MM_dd" folder that is created when it runs.

$$$$$
Version History
$$$$$

v1.1 - Update to include the proper month number due to month being 0 indexed
v1.0 - Initial Release

##########
*/

ab = FileManager.iCloud()
dir=ab.documentsDirectory()

const now = new Date()
const bDirName = "ScriptBackup"
const newDirName = dir+"/"+bDirName+"/"+now.getFullYear()+"_"+(now.getMonth() + 1)+"_"+now.getDate()

ab.createDirectory(newDirName,true)

log(dir)
let a = ab.listContents(dir)
a.forEach(myFunction)

function myFunction(item, index){
  var ext = (ab.fileExtension(dir+"/"+item))
  if (ext == "js")
  {
    log(item)
    let file = ab.read(dir+"/"+item)
    ab.write(newDirName+"/"+item, file)
  }
}

let aa = new Alert()
aa.addAction("OK")
aa.message = "All Done"
aa.present()