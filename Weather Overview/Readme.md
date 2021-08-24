# ![image](https://user-images.githubusercontent.com/50910610/130548611-ba07482a-f557-4fe6-9b6c-3cde56603625.png)

Weather Overview is a widget for Scriptable on iOS. It provides a general overview of the weather in your current area.

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
![image](https://user-images.githubusercontent.com/50910610/130572152-b718a939-aa74-4980-9dbe-9e1335713a8a.jpeg)
  * showWindspeed will enable/disavle the windsoeed display on the widget
const showWindspeed = true

  * showWindArrow set to true will show a wind direction arrow. Set to false, and the cardinal direction will be displayed instead
const showWindArrow = true

  * showPrecipitation will enable / disable the ability to display the percentage of precipitation
const showPrecipitation = true

  * showCloudCover will enable / disable the line display of the cloud cover forecast
const showCloudCover = true

  * showHumidity will enable/disable the line display of the humidity level
const showHumidity = true

  * showLegend will enable/disable the legend display at the top of the widget
let showLegend = true

  * showAlerts will enable / disable the display of alerts in your area. A yellow warning triagle for each weather alert in your area will be displayed. Tapping the widget will take you to the OpenWeather page in Safari. 
const showAlerts = true

  * units can be set to imperial or metric for your preference
const units = "imperial"  * "metric"

  * locationNameFontSize determines the size of the location name at the top of the widget
const locationNameFontSize = 18


#### Normal Example (Hourly)
  ![image](https://user-images.githubusercontent.com/50910610/130523342-a5e88a5e-28b6-4fee-a70f-036f8cd5c728.jpeg)

#### Daily Example 
  ![image](https://user-images.githubusercontent.com/50910610/130523310-941f784a-9aa6-4d17-8e6a-a511d1f035d6.jpeg)
