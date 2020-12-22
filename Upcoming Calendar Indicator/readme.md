* [Upcoming Calendar Indicator](Upcoming%20Calendar%20Indicator.js)  
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
      
        ![uodste](https://i.imgur.com/owe3L3W.jpg)
