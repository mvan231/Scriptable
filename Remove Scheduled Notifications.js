// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-gray; icon-glyph: trash;
let msg,msgOut='',ary = await Notification.allPending()

log(ary)
let notifsRemoved = 'Pending Notifications Removed\n\nNotification Contents:\n'

let menu=new Alert()
ary.forEach(f)

menu.addCancelAction('Exit')
menu.addAction('Remove All Pending')
menu.title = ary.length + ' total pending notifications'
let menuOutput = await menu.presentSheet()
log(menuOutput)

menu=new Alert()
menu.title='Completed'

if(menuOutput==-1)throw new Error('Exiting as you wish')
if(menuOutput==ary.length){
Notification.removeAllPending()
msgOut='All '+notifsRemoved+msgOut
}else{
let chosen = ary[menuOutput]
Notification.removePending([chosen.identifier])
msgOut=notifsRemoved+chosen.title+' '+chosen.body
}

menu.message=msgOut
menu.addAction('OK')
menu.present()

Script.complete()

/*
Start Functions
*/
function f(inpu){
  log(inpu)
  log(inpu.body)
  menu.addAction(inpu.title+' '+inpu.body)
  msg=inpu.title +' '+inpu.body+'\n'
  msgOut=msgOut+msg
}