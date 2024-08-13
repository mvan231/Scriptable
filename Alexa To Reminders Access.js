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

Setup: Insert the name of the desired reminders list in the "remCal" line. I use "Grocery and Shopping" with my wife, so i have that name entered.

When running the first time, the script will check if you are logged in. If not, it will notify and present with login page. After that, the script should run seamlessly. 

When running and items are found to sync, it will show a notification with the items that were added to reminders.

$$$$$$$$$$
$$$$$$$$$$$$$$$$$$$$$$$

$$$$$$$$$$$$$$$$$$$$$$$
$$$$$$$$$$

Version Info:
v4:modified the wv at beginning to use a variable for the response to aid with crashing
v3:working version with notification for synced items

$$$$$$$$$$
$$$$$$$$$$$$$$$$$$$$$$$
*/

//set baseURL based on your home country url
const baseURL = 'https://www.amazon.com'
const reminderListName = 'Grocery and Shopping'
//signInKey should be specific for your language. English uses "Sign In". German uses "Anmelden"
const signInKey = "Sign In"

main();
Script.complete();

async function checkIfUserIsAuthenticated() {
  try {
    const url = `${baseURL}/alexashoppinglists/api/getlistitems`;
    const request = new Request(url);
    await request.load();

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
    await webView.loadURL(url);
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

    const url = `${baseURL}/alexashoppinglists/api/getlistitems`;
    const deleteUrl = `${baseURL}/alexashoppinglists/api/deletelistitem`;
    const json = await new Request(url).loadJSON();
    const listItems = json[Object.keys(json)[0]].listItems;
    const existingReminders = await Reminder.all([reminderCalendar]);

    for (const item of listItems) {
      const reminderTitle = item.value.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
      const reminderExists = existingReminders.some(reminder => reminder.title === reminderTitle);

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
      } catch (deleteError) {
        console.error(deleteError);
      }
    }
  } catch (error) {
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