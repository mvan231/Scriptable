[Upcoming Calendar Indicator](Upcoming%20Calendar%20Indicator.js)  
* **Credit goes to [Raigo Jerva](https://gist.github.com/rudotriton/b51d227c3d1d9cb497829ae45583224f#instructions) for the original code that I modified to create the base of the view for the right side of the widget.**
    Inspiration was drawn from a comment on one of the r/Scriptable subreddit posts, but I cannot find it any longer. 
* This widget is similar to my Upcoming Calendar widget, but this now has a display for the full month view with indicators of up to five calendar colors for each day. Each event listed on the left side is tappable to open the calendar app to that date. 
![example image](https://i.imgur.com/0QVdD7s.jpg)
* Each calendar color only appears one time per date. 
* If you'd like certain calendars to not be included, you can add the calendar name(s) to the calIgnore array at the beginning of the script. 
    * **Note:** each calendar to be ignored must be added inside of single or double quotes and separated by a comma (if more than one). I.e. ['Personal','Work']
  * If you'd like just the left or the right side of the widget to be shown in a medium or small widget, you can use the widget parameter of 'left' or 'right' respectively. 
        
    ![Example](https://i.imgur.com/ri9Wzwr.jpg)
* Set the flag for allowDynamicSpacing to true if you want extra soacing between the events in the left side event list if there are less than 5. If you don't want the dynamic spacing, set to false. 
* Set the flag for monWeekStart to true if you want Monday to be the start of the week in the month view. If  you rather Sunday be the start of the week, then set to false.
* Set the useBackgroundColor flag to true to utilize the backgroundColor variable. This can be set per your liking.
* When updates to the code are available you will see a note in the widget
      
![update](https://i.imgur.com/owe3L3W.jpg)

**New as of v1.3, there is now a set of questions on the first run to get things setup for you before displaying in a widget. The questions to be answered are for:**     

    ![Dynamic Spacing and Monday as first day of week](https://i.imgur.com/ZTMxt3g.jpg)
        
    * Dynamic spacing of the event list

    * Using Monday as the start of the week in the month view on the right side
        
    ![Color background and no-background](https://i.imgur.com/cdCuM29.jpg)
    * Ability to use a different background color of the widget view than the standard white/black

    * Utilization of the no-background.js transparency module from supermamon (link is in my main Scriptable page)
        
    ![All Day events and shadow enable](https://i.imgur.com/5JEuCHe.jpg)
    * Ability to show "All Day" events that are occurring today or not (default behavior for this previously was to not show them)
  
    * Ability to show a shadow color under the event name in the event list. The color of the shadow is customizable in the next step. 

    ![Shadow color pick for light and dark modes](https://i.imgur.com/hYEjkmo.jpg)
    * If you choose "Yes" to have a shadow color, you will be asked to choose the color of the shadow for the light and dark mode appearances. This extra customization helps with different background colors and photos for better readability. 

    ![Background color entry and event font size](https://i.imgur.com/K1cBxB9.jpg)
    * If you chose "Yes" to utilizing a different background color for the widget, you will be asked to enter the hex color for the background to display.
      
    * Event list font size choice between Normal, Small, and Large
 
    ![Calendar Ignore and prompt](https://i.imgur.com/a7q2AOU.jpg)
    * You will be asked if you would like to EXCLUDE any calendars from the widget, this is beneficial if you don't want to display something like the "Holidays" calendar on the widget. 
        
    ![Calendar Choose and widget preview](https://i.imgur.com/LKFvBz7.jpg)
    ![Widget size and placement](https://i.imgur.com/HtO8kXN.jpg)
    * If you answered "Yes" to exclude calendars, you will be prompted to choose the calendars to exclude. 
    
**New in 1.5: there are even more options for your customization**
    * Reminders can now be displayed in the event list
    * The event list can be displayed with or without the color of the calendar or list for which it is from
    * Ability to set the base text color to be different from the default of black in light mode and white in dark mode (this is for the color of the calendar month and event list dates/times)
    * Added ability to set 24hr or 12hr time display for the event list
    

* Near the end of the setup, if you chose to use the no-background module, you will be asked for what size widget you will be using and also the placement of the widget. 

![Reset](https://i.imgur.com/w7kYZB9.jpg)
* When you run the widget in the app, it will ask you if you want to reset. This is useful if you don't quite like your setup, you can reconfigure it easily from this method. 

This is an example of what the v1.3 could look like. 
![new example image]( https://i.imgur.com/iUci7ty.jpg)
