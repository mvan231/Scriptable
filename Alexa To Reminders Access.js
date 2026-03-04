// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: purple; icon-glyph: magic;
/*
$$$$$$$$$$$$$$$$$$$$$$$
$$$$$$$$$$

Alexa To Reminders Access

Script made by: mvan231
Date made: 2023/10/26

Purpose: To sync alexa reminders to a iOS reminders list. previously IFTTT could do this, but Amazon revoked the Alexa IFTTT integration recently.

Setup: 
  - Insert the Amazon base url your country uses (if different from default) in the "baseURL" variable below
  - Insert the name of the desired reminders list in the "reminderListName" line. I use "Grocery and Shopping" with my wife, so i have that name entered.
  - Insert the wording for "Sign In" for the signInKeyvariable below. sometimes this varies based on region
  - For proper naming preference, please use the withVar and withoutVar for your local language to properly set naming of the reminders to be created


When running the first time, the script will check if you are logged in. If not, it will notify and present with login page. After that, the script should run seamlessly.

$$$$$$$$$$
$$$$$$$$$$$$$$$$$$$$$$$

$$$$$$$$$$$$$$$$$$$$$$$
$$$$$$$$$$

Version Info:
v6 had to make update to accomodate slight change on Amazon's end
v5 used code from user andereeicheln0z frok github repo issue linked below to inprove performance
https://github.com/mvan231/Scriptable/issues/25

v6 updated if statement from withVariable to withVar so it works properly

v7 updated to specifically target SHOPPING_LIST type and ignore other lists

$$$$$$$$$$
$$$$$$$$$$$$$$$$$$$$$$$
*/

//set baseURL based on your home country url
const baseURL = 'https://www.amazon.com'

//include the reminder list name exactly as it is in Reminders app
const reminderListName = 'Grocery and Shopping'

//signInKey should be specific for your language. English uses "Sign in". German uses "Anmelden"
const signInKey = "Sign in"

//withVar below needs to be set to your language's version of the word 'with'
const withVar = "with"

//withoutVar below needs to be set to your language's version of the word 'without'
const withoutVar = "without"

main();
Script.complete();

async function checkIfUserIsAuthenticated() {
  try {
    const url = `${baseURL}/alexashoppinglists/api/getlistitems`;
    const request = new Request(url);
    await request.load();
log(request.response.statusCode)
    if (request.response.statusCode === 401 || request.response.statusCode === 403) {
      return false;
    }

    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

async function makeLogin() {
  const url = `${baseURL}`;
  const webView = new WebView();
  
  try {
    await webView.loadURL(url)
    const html = await webView.getHTML();
    if (html.includes(signInKey)) {
      await webView.present(false);
      return false;
    } 
    
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

async function synchronizeReminders() {
  try {
    const reminderCalendar = await Calendar.forRemindersByTitle(reminderListName);
log(reminderCalendar)
    const url = `${baseURL}/alexashoppinglists/api/getlistitems`;
    const deleteUrl = `${baseURL}/alexashoppinglists/api/deletelistitem`;
    const json = await new Request(url).loadJSON()
    log(json)
    
    // Find the list with listType === "SHOPPING_LIST" and ignore other lists
    let listItems = [];
    let shoppingListId = null;

    for (const listId in json) {
      const list = json[listId];
      if (list.listInfo && list.listInfo.listType === "SHOPPING_LIST") {
        listItems = list.listItems || [];
        shoppingListId = listId;
        log(`Found shopping list: ${list.listInfo.listName || 'Default Shopping List'} with ${listItems.length} items`);
        break;
      }
    }
    
    // Exit if no shopping list found
    if (!shoppingListId) {
      log("No SHOPPING_LIST found in the response");
      return;
    }
    
    // Exit if shopping list is empty
    if (listItems.length === 0) {
      log("Shopping list is empty, nothing to sync");
      return;
    }
    
    for (const item of listItems) {
      const reminderTitle = item.value.split(' ').map(word => {
        if (word.toLowerCase() === withVar || word.toLowerCase() === withoutVar) {
          return word.toLowerCase();
        } else {
          return word.charAt(0).toUpperCase() + word.slice(1);
        }
      }).join(' ');
      const allReminders = await Reminder.all([reminderCalendar]);
      const incompleteReminders = allReminders.filter(reminder => !reminder.isCompleted);
      const reminderExists = incompleteReminders.some(reminder => reminder.title === reminderTitle);

      if (!reminderExists) {
        const reminder = new Reminder();
        reminder.title = reminderTitle;
        reminder.calendar = reminderCalendar;
        await reminder.save();

      }

      const request = new Request(deleteUrl);
      request.method = "DELETE";
      request.headers = {
        "Content-Type": "application/json"
      };
      request.body = JSON.stringify(item);
      
      try {
        const response = await request.loadString();
        log(`Deleted item from Alexa: ${item.value}`);
      } catch (deleteError) {
        console.error(`Failed to delete item: ${item.value}`);
        console.error(deleteError);
      }
    }
    
    log(`Sync completed: processed ${listItems.length} items`);
  } catch (error) {
    log("Error during synchronization")
    console.error(error);
  }
}


async function main() {
  const isAuthenticated = await checkIfUserIsAuthenticated();
  log(`authenticated? ${isAuthenticated}`);
  
  if (!isAuthenticated) {
    const loggedIn = await makeLogin();
    log(`loggedIn? ${loggedIn}`);
    if (!loggedIn) {
      console.log('Login failed. Exiting.');
      return;
    }
  }

  await synchronizeReminders();
}
