# ![image](https://user-images.githubusercontent.com/50910610/130548611-ba07482a-f557-4fe6-9b6c-3cde56603625.png)

Weather Overview is a widget for Scriptable on iOS. It provides a general overview of the weather in your current area.


#### Normal Example (Hourly)
  ![image](https://user-images.githubusercontent.com/50910610/130523342-a5e88a5e-28b6-4fee-a70f-036f8cd5c728.jpeg)

#### Daily Example 
  ![image](https://user-images.githubusercontent.com/50910610/130523310-941f784a-9aa6-4d17-8e6a-a511d1f035d6.jpeg)

### Items Displayed
  * Location and Date
  * Legend for enabled items
  * Date and Time of graphed data points (x-axis)
  * Temperature and Condition
  * Humidity (percentage - magenta line)
  * Wind Speed and Direction (shown above the chart with a numeric value according to your units preference)
  * Cloud Cover (percentage - white line)
  * Precipitation Probability Bar (left side or full bar if no precipitation amount available)
  * Precipitation Amount Bar (right side and using the right y-axis)

### Configuration Items
![image](https://user-images.githubusercontent.com/50910610/130572584-c17ecf06-87bd-484b-8b8c-7526a249daa1.png)

  * showWindspeed will enable/disable the windsoeed display on the widget
    * default is showWindspeed = true

  * showWindArrow set to true will show a wind direction arrow. Set to false, and the cardinal direction will be displayed instead
    * default is showWindArrow = true

  * showPrecipitation will enable / disable the ability to display the precipitation information
    * default is showPrecipitation = true

  * showCloudCover will enable / disable the line display of the cloud cover forecast
    * default is showCloudCover = true

  * showHumidity will enable/disable the line display of the humidity level
    * default is showHumidity = true

  * showLegend will enable/disable the legend display at the top of the widget
    * default is showLegend = true

  * showAlerts will enable / disable the display of alerts in your area. A yellow warning triagle for each weather alert in your area will be displayed. Tapping the widget will take you to the OpenWeather page in Safari. 
    * default is showAlerts = true

  * units can be set to imperial or metric for your preference
    * default is units = "imperial"

  * locationNameFontSize determines the size of the location name at the top of the widget
    * default is locationNameFontSize = 18

  * To display the daily forecast, set the widgetParameter to "daily"
    ![image](https://user-images.githubusercontent.com/50910610/130573735-6a749fa6-57d9-46c0-bdbc-496941188330.png)
