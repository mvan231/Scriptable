# [Scriptable.app](https://scriptable.app)

## Widgets

* [RH-Downloads.js](RH-Downloads.js) - a widget to show the total downloads for a user of RoutineHub. This will show total downloads, the recent widget update Date/Time, and the increase in downloads since the previous day (resets at 00:00).
    * If you see a text in the widget saying "Update Available", please run the script from within Scriptable to get the update.  

* [Strava Widget](Strava) - widget to give you your year-to-date stats from Strava's API

* [MEE6 Leaderboard Widget](MEE6%20LeaderBoard%20Info.js) - This widget will show you the current stats for a given user according to the MEE6 leaderboard for that server. 

    ![example](https://i.imgur.com/xzqEoue.jpg)

    As of v1.5, we now have avatar display and progress to next level. Avatar image is cached so no need to download it each time the widget refreshes.
    
    ![new v1.5](https://i.imgur.com/88TIBs3.jpg)
    
    Big thanks to [juniorchen](https://github.com/Juniorchen2012/scriptable) for the base of the progress bar portion of the code. You can check the progress widget out [here](https://github.com/Juniorchen2012/scriptable/blob/master/progress.js)

* [COD Warzone Stats Widget](COD%20Warzone%20Stats.js) - Setting your PSN username as the widget parameter will show you the user stats for COD Warzone. This can be adjusted for other COD games as well.
    ![example](https://i.imgur.com/52X0MaC.jpg)

* [Transparent StockChange Widget](Transparent%20StockChange.js) - Credit for the original code base for this widget goes to [Murdo](https://github.com/CaptainMurdo/Scriptable/blob/master/StockPrice.js). I helped him to modify it to have dynamic column creation for adding more stocks in. I have also just made an update for this so it can have a transparent background using no-background.js from Supermamon. 
    ![example](https://i.imgur.com/4QxTrw8.jpg)
    
* [Upcoming Calendar Events Widget](Upcoming%20Calendar%20Widget.js) - This widget was made as a request from some users on r/Scriptable. It's just a simple calendar display showing your upcoming events in a medium widget format.
    ![example1](https://i.imgur.com/B5N98lW.jpg) ![example2](https://i.imgur.com/rCgF54y.jpg)

    * Now has support for small widget size too! (**Note:** the events are not tappable in the small widget size)
    ![small example](https://i.imgur.com/2s1lN6f.jpg) ![small example2](https://i.imgur.com/MRoqurH.jpg)
    
* [Twitter Feed Widget](Twitter%20Feed%20Widget.js) - This widget can display tweets from public profiles on your home screen and shows them to you in chronological order as well as how long ago (or on what date) the tweet was posted. This can be configured as a medium or large size widget for your own preference. Simply set the username you'd like to "follow" in the widget parameter, and you'll be all set.
    ![twitter setup](https://i.imgur.com/7YGqOga.jpg)
    
    ![example](https://i.imgur.com/pWPL10j.jpg) ![example2](https://i.imgur.com/Vsqwoyz.jpg)


## Scripts

* [ScriptBackup.js](ScriptBackup.js) - This script will backup all of your current scripts into the iCloud Drive Scriptable directory underneath the folder "ScriptBackup" and then under the date formatted "yyyy_MM_dd" folder that is created when it runs.
* [Remove Scheduled Notifications.js](Remove%20Scheduled%20Notifications.js) - See how many pending notifications you have in the Scriptable app and choose from them to remove them, or alternatively, remove them all with one button.

## Utilites (from others)
---
* [no-background from supermamon](https://github.com/supermamon/scriptable-no-background) - a module to simulate transparent background for widgets. Includes examples.
* [openweathermap from supermamon](https://github.com/supermamon/scriptable-scripts/tree/master/openweathermap) - A module to encapsulate OpenWeatherMap's [One Call API](https://openweathermap.org/api/one-call-api) and more
* [import-script.js from supermamon](https://github.com/supermamon/scriptable-scripts/tree/master/Import-Script) - A helpful script for importing scripts to scriptable from various different sites
## First time adding a widget?

**Here is what to do:**
* Tap and hold an empty area of the home screen until you enter the "jiggle mode"
* Tap the plus button in the upper left
* In the add widget menu that appears, search for "Scriptable" and tap it
* Choose the display size of the widget you want (small, medium, large) and tap "Add Widget"
* Tap and hold on the widget now, and tap "Edit Widget"
* Tap the "Script" option, and select the script name to run
* Tap outside the edit widget window and you should be all set

<!--* this is just template info borrowed from Supermamon's page
[RH Downloads](RH%20Downloads.js)
## Widgets
* [xkcd-widget](xkcd-widget) - a widget to show current/random xkcd comic
* [peanuts-widget](peanuts-widget) - a widget to show current/random Peanuts™ comic
* [ig-latest-post](instagram-widgets) - randomly show between the 12 of the most recent post from a user or users.
* [simple-weather-widget](openweathermap/simple-weather-widget.js) - example widget that uses the [openweathermap](openweathermap) module
* [transparent-backgrounds](no-background/examples) - example scripts that use the [no-background](no-background) module
* [us-elections.js](misc/us-elections.js) - show the latest electoral votes for all candidates

## Utilites
---
* [no-background](no-background) - a module to simulate transparent background for widgets. Includes examples.
* [openweathermap](openweathermap) - A module to encapsulate OpenWeatherMap's [One Call API](https://openweathermap.org/api/one-call-api) and more
* [basic-ui](utilities/basic-ui.js) - a helper moduel for user interactions
* [json-utils](utilities/json-utils.js) - a helper module for reading, storing, and converint JSON.
-->
