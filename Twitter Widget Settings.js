// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: blue; icon-glyph: cogs;
  var rtsOn = true
  var postFontSize = 9
  var postFontColor = Color.dynamic(Color.black(), Color.white())
  var twitterIcon = true
  var clockIcon = true
  var widgAccentColor = Color.blue()
  var checkUpdates = true
  var displayTimeSinceRefresh = true
  var widgBackgroundColor = Color.dynamic(Color.white(), Color.black())
  var displayTitle = true
  var displayLine = true

  module.exports.numTweets = (wsize) => {
switch(wsize){
  case 'medium':
  case 'small':
    numT = 2;
    break;
  case 'large':
    numT = 5;
    break
  case undefined:
    numT = 5;
    break
  }
  return numT
  }

module.exports.rtsOn = rtsOn
module.exports.postFontSize = postFontSize
module.exports.postFontColor = postFontColor
module.exports.twitterIcon = twitterIcon
module.exports.clockIcon = clockIcon
module.exports.widgAccentColor = widgAccentColor
module.exports.checkUpdates = checkUpdates
module.exports.displayTimeSinceRefresh = displayTimeSinceRefresh
module.exports.widgBackgroundColor = widgBackgroundColor
module.exports.displayTitle = displayTitle
module.exports.displayLine = displayLine


