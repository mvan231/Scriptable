# [Scriptable.app](https://scriptable.app)
   * [Widgets](#widgets)
   * [Scripts](#scripts)
   * [Utilities made by others](#utilites-from-others)
   * [First time adding a widget?](#first-time-adding-a-widget)
   * [Buy me a ☕️ or 🍺?](#buy-me-a-%EF%B8%8F-or-)
## Widgets

* ### [RH-Downloads.js](RH-Downloads.js)
    * a widget to show the total downloads for a user of RoutineHub or a given shortcut hosted on RoutineHub. The widget will cycle through the URLs you provide to it with each refresh. This will show total downloads, the recent widget update Date/Time, and the increase in downloads since the previous day (resets at 00:00).
        * If you see a text in the widget saying "Update Available", please run the script from within Scriptable to get the update.  

* ### [Strava Widget](Strava)
    * Widget to give you your year-to-date stats from Strava's API

* ### [MEE6 Leaderboard Widget](MEE6%20LeaderBoard%20Info.js)
    * This widget will show you the current stats for a given user according to the MEE6 leaderboard for that server. 

      ![example](https://i.imgur.com/xzqEoue.jpg)

    * As of v1.5, we now have avatar display and progress to next level. Avatar image is cached so no need to download it each time the widget refreshes.
    
      ![new v1.5](https://i.imgur.com/88TIBs3.jpg)
    
    * Big thanks to [juniorchen](https://github.com/Juniorchen2012/scriptable) for the base of the progress bar portion of the code. You can check the progress widget out [here](https://github.com/Juniorchen2012/scriptable/blob/master/progress.js)

* ### [Transparent StockChange Widget](Transparent%20StockChange.js)
    * Credit for the original code base for this widget goes to [Murdo](https://github.com/CaptainMurdo/Scriptable/blob/master/StockPrice.js). I helped him to modify it to have dynamic column creation for adding more stocks in. I have also just made an update for this so it can have a transparent background using no-background.js from Supermamon.
    
      ![example](https://i.imgur.com/4QxTrw8.jpg)
    
* ### [Upcoming Calendar Events Widget](Upcoming%20Calendar%20Widget.js)
    * This widget was made as a request from some users on r/Scriptable. It's just a simple calendar display showing your upcoming events in a medium widget format.
   
      ![example1](https://i.imgur.com/B5N98lW.jpg) ![example2](https://i.imgur.com/rCgF54y.jpg)

    * Now has support for small widget size too! (**Note:** the events are not tappable in the small widget size)
    
      ![small example](https://i.imgur.com/2s1lN6f.jpg) ![small example2](https://i.imgur.com/MRoqurH.jpg)

    * In the latest version, I have added support for reminders utilizing the code from the Upcoming Calendar Indicator widget and also utilizing the title color being the calendar/list color
      ![updated example with reminders](https://i.imgur.com/jIB32gB.jpg)
    
* ### [Upcoming Calendar Indicator](Upcoming%20Calendar%20Indicator)
     
    * **Credit goes to [Raigo Jerva](https://gist.github.com/rudotriton/b51d227c3d1d9cb497829ae45583224f#instructions) for the original code that I modified to create the base of the view for the right side of the widget.**
        Inspiration was drawn from a comment on one of the r/Scriptable subreddit posts, but I cannot find it any longer. 
    * This widget is similar to my Upcoming Calendar widget, but this now has a display for the full month view with indicators of up to five calendar colors for each day. 
    * **For more info, see the page linked above**
    
      ![example image](https://i.imgur.com/0QVdD7s.jpg)

* ### [Twitter Widget](Twitter%20Widget.js)
    * ##### As of v1.4 there are new error messages available. Unfortunately, the Twitter API changed some things and this broke the widget code. This is now accounted for.
    * This widget can display tweets from public profiles on your home screen and shows them to you in chronological order as well as how long ago (or on what date) the tweet was posted. This can be configured as a medium or large size widget for your own preference. Simply set the username you'd like to "follow" in the widget parameter, and you'll be all set.
    * Customization options have been added as of version 1.1
    ![customization](https://i.imgur.com/8YpoQmJ.jpg)
        * rtsOn setting can be changed below to display retweets along with normal tweets. 
           * false = do not display retweets
           * true = display retweets with tweets
        * postFontSize setting can be modified to have larger or smaller font in the widget as you desire.
           * 9 is the default
        * postFontColor setting can be modified as you wish. This will change the text color of the tweets shown. Default is set to be dynamic.
           * default = Color.dynamic(Color.black(), Color.white())
        * twitterIcon setting will change the display of the Twitter icon in the widget. 
           * false = off
           * true = on
        * clockIcon setting will change the display of the clock symbol in the widget. 
           * false = off
           * true = on
        * widgAccentColor setting can be modified to your liking. This controls the widget title color, time since  last refresh, and icon colors (if chosen to display them)
        * checkUpdates setting is to allow or deny uodate checking function. If an update is available, you will be shown 'Update Available' in the widget title instead of the username entered as the widget parameter. 
           * false = do not check for updates
           * true = check for updates
    
    ![twitter setup](https://i.imgur.com/7YGqOga.jpg)
    
    ![example](https://i.imgur.com/pWPL10j.jpg) ![example2](https://i.imgur.com/Vsqwoyz.jpg)

    
* ### [COD Warzone Stats Widget](COD%20Warzone%20Stats.js)
    * Setting your PSN username as the widget parameter will show you the user stats for COD Warzone. This can be adjusted for other COD games as well.
    
    ![example](https://i.imgur.com/52X0MaC.jpg)

* ### [Canada Covid Light](Canada%20Covid%20Light.js)
    * See Covid stats for Canada in light color
    * *based on the [script](https://reddit.com/r/Scriptable/comments/l4kypx/_/gkp6svd/?context=1) from u/Mr-H-E-Ron on reddit*

* ### [Canada Covid Dark](Canada%20Covid%20Dark.js)
    * See Covid stats for Canada in dark color
    * *based on the [script](https://reddit.com/r/Scriptable/comments/l4kypx/_/gkp6svd/?context=1) from u/Mr-H-E-Ron on reddit*

* ### [COVID Trend Widget](COVID%20Trend%20Widget)
    ![Example1 - with colors](https://i.imgur.com/ISs6Hgi.jpg)
    * This widget will display country level stats for COVID-19 and also display a trending indicator whether the given item is trending up, down, or steady. 
    * **See more info at the link**

* ### [Exchange Rate Widget](exchangeRate.js)
    * This widget is based on the version by juniorchen. It has been adapted to work with the free version of the exchangerateapi. 
    * Inputing a currency code will use that as the base for the widget. The default base is EUR.

* ### [Weather Overview Widget](Weather%20Overview)
  This widget displays an overview of the weather in your location. Click/Tap the link to see more about it.
  ![image](https://user-images.githubusercontent.com/50910610/130523342-a5e88a5e-28b6-4fee-a70f-036f8cd5c728.jpeg)

* ### [VSCO Recents Widget](VSCO%20Recents)
    This widget displays a random recent photo or the most recent photo of a specified user of VSCO
    ![Example](https://i.imgur.com/z8CNRmx.png)

* ### [Automators.fm Feed Widget](Automators.fm%20Feed)
  

## Scripts

* ### [ScriptBackup.js](ScriptBackup.js)
    * This script will backup all of your current scripts into the iCloud Drive Scriptable directory underneath the folder "ScriptBackup" and then under the date formatted "yyyy_M_d__HHmm" folder that is created when it runs.
* ### [Remove Scheduled Notifications.js](Remove%20Scheduled%20Notifications.js)
    * See how many pending notifications you have in the Scriptable app and choose from them to remove them, or alternatively, remove them all with one button.

## Utilites (from others)
---
* ### [no-background from supermamon](https://github.com/supermamon/scriptable-no-background)
    * a module to simulate transparent background for widgets. Includes examples.
* ### [openweathermap from supermamon](https://github.com/supermamon/scriptable-scripts/tree/master/openweathermap)
    * A module to encapsulate OpenWeatherMap's [One Call API](https://openweathermap.org/api/one-call-api) and more
* ### [import-script.js from supermamon](https://github.com/supermamon/scriptable-scripts/tree/master/Import-Script)
    * A helpful script for importing scripts to scriptable from various different sites
* ### [widget blur from mzeryck](https://github.com/mzeryck/Widget-Blur)
    * A script to help generate a blurred slice of your wallpaper for usage as a widget background image
    
## First time adding a widget?

**Here is what to do:**
* Tap and hold an empty area of the home screen until you enter the "jiggle mode"
* Tap the plus button in the upper left
* In the add widget menu that appears, search for "Scriptable" and tap it
* Choose the display size of the widget you want (small, medium, large) and tap "Add Widget"
* Tap and hold on the widget now, and tap "Edit Widget"
* Tap the "Script" option, and select the script name to run
* Tap outside the edit widget window and you should be all set

## Buy me a ☕️ or 🍺?
  If you like my work and want to buy me a coffee or a beer, you can do so with [Venmo](https://venmo.com/code?user_id=1967077766201344976) or [PayPal](https://www.paypal.me/mvan231).
