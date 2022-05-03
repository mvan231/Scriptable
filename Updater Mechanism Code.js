// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-gray; icon-glyph: wrench;
/*
$$$$$$$$$$$$$$$$$$$$$$
Updater Mechanism Code￼
     by: mvan231
$$$$$$$$$$$$$$$$$$$$$$

$$$$$$$$$$$$$$$$$$$$$$
Information:
to implement this update check you can follow the commented lines of code below. 

The method involves setting a variable to the output of the update check function and passing in the current version number of your code. ￼
$$$$$$$$$$$$$$$$$$$$$$
*/

let scriptURL = 'https://raw.githubusercontent.com/mvan231/Scriptable/main/Updater%20Mechanism%20Code.js'

//set w as a ListWidget to display the update status if needed
let w = new ListWidget()

//uCheck is set up to receive the output of the update check function. It will either be set to true or false depending on whether or not an update is available￼
let uCheck = updateCheck(1.0)

//begin the updateCheck function￼
async function updateCheck(version){
  /*
  #####
  Update Check
  #####
  */
  //setup of uC variable to hold the response from the server request
  let uC   
  try{
    //load the JSON file located at the same place as the script file but with the additional 'on' at the end
    let updateCheck = new Request(`${scriptURL}on`)
    uC = await updateCheck.loadJSON()
  }catch(e){return log(e)}
  log(uC)
  log(uC.version)
  //setup the 'needUpdate' variable as false unless the server version and the current version don't match
  let needUpdate = false
  if (uC.version != version){
    needUpdate = true
    log("Server version available")
    if (!config.runsInWidget)
    {//if the code is being executed from somewhere other than inside of a widget￼￼
      log("running standalone")
      
      //generate an alert to notify the user of the update and the changes included
      let upd = new Alert()
      upd.title="Server Version Available"
      upd.addAction("OK")
      upd.addDestructiveAction("Later")
      upd.message="Changes:\n"+uC.notes+"\n\nPress OK to get the update from GitHub"
      if (await upd.present()==0){
        let r = new Request(${scriptURL})
        //download the updated script file
        let updatedCode = await r.loadString()
        let fm = FileManager.iCloud()
        let path = fm.joinPath(fm.documentsDirectory(), `${Script.name()}.js`)
        log(path)
        //save the downloaded code file to the Scriptable folder in iCloud Drive
        fm.writeString(path, updatedCode)
        throw new Error("Update Complete!")
      }
    } 
  }else{
    log("up to date")
  }
  
  return needUpdate
  /*
  #####
  End Update Check
  #####
  */
}