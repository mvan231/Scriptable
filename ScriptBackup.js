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

v1.0 - Initial Release

v1.1 - Update to include the proper month number due to month being 0 indexed

v1.2 - Improvements to the alert at the end to specify how many scripts were backed uo and where to\n- Modified the code to use variables directly in the strings aa templates\n- Script backup folders are now labeled with the hour and minute of the backup so multiple backuos can be kep from a given day (i.e. a backup oerformed at 0940 on January 5, 2025 would be labeled as 2025_1_5__0940)

##########
*/

ab = FileManager.iCloud()
dir=ab.documentsDirectory()

const now = new Date()
const bDirName = "ScriptBackup"
const backupTo = `/${bDirName}/${now.getFullYear()}_${(now.getMonth() + 1)}_${now.getDate()}__${(now.getHours()<10)?'0'+now.getHours():now.getHours()}${now.getMinutes()}`
const newDirName = `${dir}${backupTo}`

ab.createDirectory(newDirName,true)

let a = ab.listContents(dir)

//provide a container for the script count
let count = 0
//for each item found in the directory, perform myFunction
a.forEach(myFunction)

let aa = new Alert()
aa.addAction("OK")
aa.title = "Script Backup"
aa.message = `All Done!\n${count} scripts backed up to\n${backupTo}`
aa.present()
//end of script
Script.complete()

/*
Begin Functions
*/

function myFunction(item, index){
  var ext = (ab.fileExtension(dir+"/"+item))
  if (ext == "js")
  {
    let file = ab.read(dir+"/"+item)
    ab.write(newDirName+"/"+item, file)
    count++
  }
}