[Upcoming Calendar Indicator](Upcoming%20Calendar%20Indicator.js)
* **Credit goes to [Raigo Jerva](https://gist.github.com/rudotriton/b51d227c3d1d9cb497829ae45583224f#instructions) for the original code that I modified to create the base of the view for the right side of the widget.**
    Inspiration was drawn from a comment on one of the r/Scriptable subreddit posts, but I cannot find it any longer.

* This widget is similar to my Upcoming Calendar widget, but this now has a display for the full month view with indicators of up to five calendar colors for each day. Each event listed on the left side is tappable to open the calendar app to that date.
![example image](https://i.imgur.com/wz6ZSCG.jpg)
* Each calendar color dot only appears one time per date in the month view.
* In the month view, each date is tappable to go to that date in the calendar app.
* If you'd like just the left or the right side of the widget to be shown in a medium or small widget, you can use the widget parameter of 'left' or 'right' respectively.

    ![Example](https://i.imgur.com/1uZ3wzZ.jpg)
* When updates to the code are available you will see a note in the widget

![update](https://i.imgur.com/JBawO7v.jpg)
---
  This is an example of what v1.3 could look like.
  
  ![new example image]( https://i.imgur.com/iUci7ty.jpg)

  This is an example of what v1.5 could look like with a base color set to red and using the 24hr time display.
  
  ![v1.5 example](https://i.imgur.com/CORi5YL.jpg)

  In v1.7 the large size widget is now an option. When using the large widget, transparency is automatically disabled due to issues with displaying the content.
  
  ![1.7 example](https://i.imgur.com/K30Ehrf.jpg)
  
  v1.9 introduces some new features:
  - Color highlight of Saturday and Sunday (instead of just the text color opacity being different)
  - Text color change of just the day initials in the calendar view
  - Ability to show previous month and next month dates that are visible in the calendar view

  ![1.9example1](https://i.imgur.com/8Sxj5ZK.jpg)
  ![1.9example2](https://i.imgur.com/0CQm6Wv.jpg)
---
Upon installing and running the script in the app, you will be asked a set of questions on the first run to get things setup for you. The questions to be answered are for:
---
*As a helping tool, you can get the app [Jayson](https://apps.apple.com/gb/app/jayson/id1447750768) to help with modifying the settings file manually if you only want to change one or two settings without going through the entire setup process.*

---
  ![Dynamic Spacing and Monday as first day of week](https://i.imgur.com/ZTMxt3g.jpg)

  * Dynamic spacing of the event list

  * Using Monday as the start of the week in the month view on the right side
---
  ![Color background and no-background](https://i.imgur.com/cdCuM29.jpg)
  * Ability to use a different background color of the widget view than the standard white/black

  * Utilization of the no-background.js transparency module from supermamon (link is in my main Scriptable page)
---
  ![All Day events and show reminders](https://i.imgur.com/LsQQrTk.jpg)
  * Ability to show "All Day" events that are occurring today or not (default behavior for this previously was to not show them)

  * Ability to show reminders in the event list that have due dates coming up
---
  ![Show event times in 24hr format](https://i.imgur.com/KbHeWST.jpg)
  * Ability to show event times in 24hr (00:00) format instead of 12hr format (12:30 PM)

  * Choose between showing the event names in the event list as the color of the calendar or reminder list from which they are from
---
  ![base text color enable and shadow color enable](https://i.imgur.com/IeYQwnT.jpg)
  * Ability to modify the base text color in the widget (these are the items displayed normally in black or white depending on light/dark mode). The color choices for this are chosen after the event shadow color choosing step..

  * Ability to show a shadow color under the event name in the event list. The color of the shadow is customizable in the next step.
---
  ![Sunday and Saturday Color Enable](https://i.imgur.com/97Ic5UH.png)
  * Ability to change the colors of Sunday / Saturday in the month view
---
  ![Shadow color pick for light and dark modes](https://i.imgur.com/hYEjkmo.jpg)
  * If you choose "Yes" to have a shadow color, you will be asked to choose the color of the shadow for the light and dark mode appearances. This extra customization helps with different background colors and photos for better readability.
---
  ![Base Text Color Pick](https://i.imgur.com/1sZ281Q.jpg)
  * If you choose "Yes" to change the base text color, you will be asked to choose the colors to be used for light and dark mode appearances. This can be purely for personalization preference or if you noticed that the default black in light mode and white in dark mode do not allow the widget to be read properly with your wallpaper setting (if utilizing the transparency module).
---
  ![Background color entry and event font size](https://i.imgur.com/K1cBxB9.jpg)
  * If you chose "Yes" to utilizing a different background color for the widget, you will be asked to enter the hex color for the background to display.

  * Event list font size choice between Normal, Small, and Large
---
  ![Sunday / Saturday Color Choice](https://i.imgur.com/OKDJy0A.jpg)
  * If you chose yes to Sunday or Saturday color, you'll be prompted to choose the color for those days.
---
  * New Heat Map feature for reminders completed allows you to choose the heat map maximum (full color) and heat map color to display. These are based on the reminders list entered in the widget parameter.
  * To use the heat map, either specify in the widgetparameter a pipe character followed by the name of the reminders list (i.e. |Reminders) or you can just use the right side of the widget with the heat map enabled (i.e. right|Reminders). During the setup, make sure to select the color and the value you want as the max to show the full color when above or at this value of completed reminders for a given day
---
  ![Calendar Select and prompt](https://i.imgur.com/a7q2AOU.jpg)
  * You will be asked which calendars you would like to include in the widget.
---
  ![Calendar Choose and widget preview](https://i.imgur.com/LKFvBz7.jpg)
  ![Widget size and placement](https://i.imgur.com/HtO8kXN.jpg)
  * If you answered "Yes" to exclude calendars, you will be prompted to choose the calendars to exclude.
  * **In v1.7, this has changed and the calendar picker will display at the end to have you pick the calendars you want displayed.** This helps to keep the "Found in Natural Language" calendar items from being populated. Because of this change the question for excluding calendars has also been removed.

* Near the end of the setup, if you chose to use the no-background module, you will be asked for what size widget you will be using and also the placement of the widget.
---
![Reset](https://i.imgur.com/w7kYZB9.jpg)
* When you run the widget in the app, it will ask you if you want to reset. This is useful if you don't quite like your setup, you can reconfigure it easily from this method.
---


