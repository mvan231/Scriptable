// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: blue; icon-glyph: file-alt;
/* SCRIPTABLE NEWS WIDGET (WORDPRESS OR RSS)
 v1.0.0 coded by Saudumm (https://twitter.com/saudumm)
 GitHub: https://github.com/Saudumm/scriptable-News-Widget
 
 WIDGET PARAMETERS: you can long press on the widget on your homescreen and edit parameters
 - example: small|https://www.stadt-bremerhaven.de|Caschys Blog|true|background.jpg|false|true
 - parameter order has to be: widget size, site url, site name, show post images, background image, blur background image, background image gradient
 - parameters have to be separated by |
 - You can omit parameters, for example background image: small|https://www.stadt-bremerhaven.de|Caschys Blog
 - you can just set "small", "medium" or "large" as a parameter
 - parameters that are not set will be set by the standard widget config
 
 STANDARD WIDGET CONFIG: standard config below can be overwritten by widget parameters
 - SITE_URL: address (URL) of the website you want to fetch posts from
 - SITE_NAME: name of the website to display in the widget
 - BG_IMAGE_NAME: CASE SENSITIVE! filename of the custom background image, set to none if you don't want a custom image
 - Note: custom background image files have to be in the Scriptable iCloud Files directory (same as the script js file)
 - BG_IMAGE_BLUR: true if you want background images to be blurred, false if not
 - BG_IMAGE_GRADIENT: true = gradient over the background image, false = no gradient
 - SHOW_POST_IMAGES: true = display images next to the post headlines; set to false if you don't want images next to posts
 - Note: combining SHOW_POST_IMAGES = true + small widget will ignore BG_GRADIENT_COLOR values in small config widgets
 */
var SITE_URL = "https://www.bbc.com/urdu/index.xml";
var SITE_NAME = "";
var BG_IMAGE_NAME = "none";
var BG_IMAGE_BLUR = "true";
var BG_IMAGE_GRADIENT = "true";
var SHOW_POST_IMAGES = "true";

/*
 COLOR CONFIG: You can edit almost all colors of your widget
 - BG_GRADIENT: widget background; true = use gradient; false = single background color
 - BG_COLOR: background color value if BG_GRADIENT = false
 - BG_GRADIENT_COLOR_TOP: gradient color at the top
 - BG_GRADIENT_COLOR_BTM: gradient color at the bottom
 - BG_GRADIENT_OVERLAY_TOP: gradient background image overlay color top
 - BG_GRADIENT_OVERLAY_BTM: gradient background image overlay color bottom
 - FONT_COLOR_SITENAME: font color of the website name (SITE_NAME)
 - FONT_COLOR_POST_DATE: font color of the date/time label
 - FONT_COLOR_HEADLINE: font color of the post title
 */
var BG_GRADIENT = false;
var BG_COLOR = new Color("#b00a0fe6");
var BG_GRADIENT_COLOR_TOP = new Color("#b00a0fe6");
var BG_GRADIENT_COLOR_BTM = new Color("#b00a0fe6");
const BG_GRADIENT_OVERLAY_TOP = new Color("#b00a0fe6", 1.0);
const BG_GRADIENT_OVERLAY_BTM = new Color("#b00a0fe6", 1.0);
const FONT_COLOR_SITENAME = Color.white();
const FONT_COLOR_POST_DATE = Color.white();
const FONT_COLOR_HEADLINE = Color.white();

// DO NOT CHANGE ANYTHING BELOW!
// Unless you know what you're doing.
// Unlike me, I don't know what I'm doing.
var WIDGET_SIZE = (config.runsInWidget ? config.widgetFamily : "small");

if (args.widgetParameter) {
  let param = args.widgetParameter.split("|");
  if (param.length >= 1) {WIDGET_SIZE = param[0];}
  if (param.length >= 2) {SITE_URL = param[1];}
  if (param.length >= 3) {SITE_NAME = param[2];}
  if (param.length >= 4) {SHOW_POST_IMAGES = param[3];}
  if (param.length >= 5) {BG_IMAGE_NAME = param[4];}
  if (param.length >= 6) {BG_IMAGE_BLUR = param[5];}
  if (param.length >= 7) {BG_IMAGE_GRADIENT = param[6];}
}

// set the number of posts depending on WIDGET_SIZE
var POST_COUNT = 1;
switch (WIDGET_SIZE) {
  case "small":
    POST_COUNT = 1;
    break;
  case "medium":
    POST_COUNT = 2;
    break;
  case "large":
    POST_COUNT = 5;
    break;
}

// check directories
await checkFileDirs()

// Create Widget
const widget = await createWidget();

if (!config.runsInWidget) {
  switch (WIDGET_SIZE) {
    case "small":
      await widget.presentSmall();
      break;
    case "medium":
      await widget.presentMedium();
      break;
    case "large":
      await widget.presentLarge();
      break;
  }
}

Script.setWidget(widget);
Script.complete();

// create the widget
// parameter: none
// return: an awesome widget
async function createWidget() {
  let postData
  if (await isJSON(SITE_URL+"/wp-json/wp/v2/posts")) {
    postData= await getJSONData();
  } else {
    postData = await getRSSData(SITE_URL);
  }
  
  const list = new ListWidget();

  // display name of the website
  const siteName = list.addText(SITE_NAME.toUpperCase());
  siteName.font = Font.heavySystemFont(0);
  siteName.textColor = FONT_COLOR_SITENAME;
  
  if (postData) {
    if (POST_COUNT == 1) {
      // load widget background image (if SHOW_POST_IMAGES = true or BG_IMAGE_NAME is set)
      if (SHOW_POST_IMAGES == "true" && BG_IMAGE_NAME == "none") {
        if (postData.aPostIMGPaths[0] != "none") {
          list.backgroundImage = await loadLocalImage(postData.aPostIMGPaths[0]+(BG_IMAGE_BLUR == "true" ? "-bg-blur" : "-bg"));
        }
        // draw gradient over background image for better readability
        BG_GRADIENT = true;
        BG_GRADIENT_COLOR_TOP = BG_GRADIENT_OVERLAY_TOP;
        BG_GRADIENT_COLOR_BTM = BG_GRADIENT_OVERLAY_BTM;
        
        // small shadow outline on SITE_NAME for better readability
        siteName.shadowRadius = 1;
        siteName.shadowColor = Color.black();
      }
      
      const postStack = list.addStack();
      postStack.layoutVertically();

      const labelDateTime = postStack.addText(await new Date(postData.aPostDates[0]).toLocaleString([], {hour: "2-digit", minute: "2-digit"}));
      labelDateTime.font = Font.heavySystemFont(12);
      labelDateTime.textColor = FONT_COLOR_POST_DATE;
      labelDateTime.lineLimit = 1;
      labelDateTime.minimumScaleFactor = 0.5;
      
      const labelHeadline = postStack.addText(postData.aPostTitles[0]);
      labelHeadline.font = Font.heavySystemFont(12);
      labelHeadline.textColor = FONT_COLOR_HEADLINE;
      labelHeadline.lineLimit = 3;
      labelHeadline.rightAlignText()
      list.url = postData.aPostURLs[0];
    } else {
      const aStackRow = await new Array(POST_COUNT);
      const aStackCol = await new Array(POST_COUNT);
      const aLblPostDate = await new Array(POST_COUNT);
      const aLblPostTitle = await new Array(POST_COUNT);
      const aLblPostIMG = await new Array(POST_COUNT);
      
      let i;
      for (i = 0; i < POST_COUNT; i++) {
        aStackRow[i] = list.addStack();
        aStackRow[i].addSpacer()
        aStackRow[i].layoutHorizontally();
        aStackRow[i].url = postData.aPostURLs[i];
        aStackCol[i] = aStackRow[i].addStack();

        
        aStackCol[i].layoutVertically();

        let aStackColRow1 = aStackCol[i].addStack()
        let aStackColRow2 = aStackCol[i].addStack()
        aStackColRow1.addSpacer()
        aStackColRow2.addSpacer()
        
        //aLblPostDate[i] = aStackCol[i].addText(await new Date(postData.aPostDates[i]).toLocaleString([], {hour: "2-digit", minute: "2-digit"}));
        aLblPostDate[i] = aStackColRow1.addText(await new Date(postData.aPostDates[i]).toLocaleString([], {hour: "2-digit", minute: "2-digit"}));
        aLblPostDate[i].font = Font.heavySystemFont(10);
        aLblPostDate[i].textColor = FONT_COLOR_POST_DATE;
        aLblPostDate[i].lineLimit = 1;
        aLblPostDate[i].rightAlignText()
        
        //aLblPostTitle[i] = aStackCol[i].addText(postData.aPostTitles[i]);
        aLblPostTitle[i] = aStackColRow2.addText(postData.aPostTitles[i]);
        aLblPostTitle[i].font = Font.heavySystemFont(17);
        aLblPostTitle[i].textColor = FONT_COLOR_HEADLINE;
        aLblPostTitle[i].lineLimit = 3;
        aLblPostTitle[i].rightAlignText()

        if (SHOW_POST_IMAGES == "true" && postData.aPostIMGPaths[i] != "none") {
          aStackRow[i].addSpacer();
          aLblPostIMG[i] = aStackRow[i].addImage(await loadLocalImage(postData.aPostIMGPaths[i]));
          aLblPostIMG[i].imageSize = new Size(45,45);
          aLblPostIMG[i].cornerRadius = 8;
          aLblPostIMG[i].leftAlignImage();
        }
        
        if (i < POST_COUNT-1) {list.addSpacer();}
      }
    }
  } else {
    const sad_face = list.addText(":(")
    sad_face.font = Font.regularSystemFont(config.widgetFamily === "large" ? 190 : 72);
    sad_face.lineLimit = 1;
    sad_face.minimumScaleFactor = 0.1;
    
    list.addSpacer();
    
    const err_msg = list.addText("Couldn't load data");
    err_msg.font = Font.regularSystemFont(12);
    err_msg.textColor = FONT_COLOR_HEADLINE;
    
    BG_COLOR = new Color("#1f67b1");
    BG_GRADIENT = false;
    BG_IMAGE_NAME = "none";
  }
  
  // widget background (image, single color or gradient)
  if (BG_IMAGE_NAME != "none") {
    const customBGImage = await loadBGImage(BG_IMAGE_NAME, BG_IMAGE_BLUR);
    if (customBGImage != "not found") {
      list.backgroundImage = customBGImage;
      
      if (BG_IMAGE_GRADIENT == "true") {
        // draw gradient over background image for better readability
        const gradient = new LinearGradient();
        gradient.locations = [0, 1];
        gradient.colors = [BG_GRADIENT_OVERLAY_TOP, BG_GRADIENT_OVERLAY_BTM];
        list.backgroundGradient = gradient;
      }
      
      // small shadow outline on SITE_NAME for better readability
      siteName.shadowRadius = 1;
      siteName.shadowColor = Color.black();
    } else {
      list.backgroundColor = BG_COLOR;
    }
  } else if (BG_GRADIENT == true) {
    const gradient = new LinearGradient();
    gradient.locations = [0, 1];
    gradient.colors = [BG_GRADIENT_COLOR_TOP, BG_GRADIENT_COLOR_BTM];
    list.backgroundGradient = gradient;
  } else {
    list.backgroundColor = BG_COLOR;
  }
  
  return list;
}

// get all the data for the widget - this is where the magic happens
// for WordPress sites
// parameter: nothing at all
// return: arrays with data
async function getJSONData() {
  try {
    const loadedJSON = await new Request(SITE_URL+"/wp-json/wp/v2/posts").loadJSON();
    
    const aPostDates = await new Array(5);
    const aPostTitles = await new Array(5);
    const aPostURLs = await new Array(5);
    const aPostIMGURLs = await new Array(5);
    const aPostIMGPaths = await new Array(5);
    const aPostFileNames = await new Array(7);
    
    let i;
    for (i = 0; i < 5; i++) {
      aPostDates[i] = loadedJSON[i].date;
      
      aPostTitles[i] = loadedJSON[i].title.rendered;
      aPostTitles[i] = formatPostTitle(aPostTitles[i]);
      
      aPostURLs[i] = loadedJSON[i].guid.rendered;
      
      if (SHOW_POST_IMAGES == "true") {
        aPostIMGURLs[i] = await getMediaURL(loadedJSON[i].featured_media, loadedJSON[i].id);
        if (aPostIMGURLs[i] != "none") {
          aPostIMGPaths[i] = await getImagePath(loadedJSON[i].id);
          aPostFileNames[i] = await getFileName(loadedJSON[i].id);
          
          const addBGImage = (i == 0 ? true : false);
          await downloadPostImage(aPostIMGPaths[i], aPostIMGURLs[i], addBGImage);
        } else {
          aPostIMGPaths[i] = "none";
          aPostFileNames[i] = "none";
        }
      }
    }
    
    if (SHOW_POST_IMAGES == "true") {
      aPostFileNames[5] = aPostFileNames[0]+"-bg";
      aPostFileNames[6] = aPostFileNames[0]+"-bg-blur";
      await cleanUpImages(aPostFileNames);
    }
    
    const result = {
    aPostDates: aPostDates,
    aPostTitles: aPostTitles,
    aPostURLs: aPostURLs,
    aPostIMGPaths: aPostIMGPaths
    };
    
    return result;
  } catch (err) {
    logError(err)
    return null;
  }
}

// get all relevant data from the rss feed
// for RSS Feeds - look, I'm not proud of this code, but it works
// parameter: url of the feed
// return: arrays with data
async function getRSSData(rssFeedURL) {
  try {
    const loadRSSFeed = await new Request(rssFeedURL).loadString();
    
    if (!loadRSSFeed.includes("xml") && !loadRSSFeed.includes("rss")) {return null;}
    
    const aRSSItems = [...loadRSSFeed.matchAll(/<item>(.*?)<\/item>/gs)];
    
    let aRSSData = await new Array(5);
    
    if (aRSSItems.length >= 5) {
      for (i = 0; i < 5; i++) {
        let rssDate = aRSSItems[i][1].match(/<pubDate>(.*?)<\/pubDate>/)[1];
        
        const rssDateSort = await new Date(rssDate).toLocaleString(["fr-CA"], {year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit"})
        
        const rssTitle = aRSSItems[i][1].match(/<title>(.*?)<\/title>/)[1];
        const rssURL = aRSSItems[i][1].match(/<link>(.*?)<\/link>/)[1];
        
        let rssIMGURL = "none";
        const rssIMGRegEx = aRSSItems[i][1].match(/\=\"(http(?!.*http)s?\:\/\/.*?\.)(jpe?g|png|bmp)\"/i);
        if (rssIMGRegEx && rssIMGRegEx.length == 3) {
          let rssIMGPath = rssIMGRegEx[1];
          let rssIMGExt = rssIMGRegEx[2];
          
          rssIMGURL = rssIMGPath+rssIMGExt;
        }
        
        aRSSData[i] = [rssDateSort, rssDate+"|||"+rssTitle+"|||"+rssURL+"|||"+rssIMGURL];
      }
    }
    
    // sort rss items
    aRSSData.sort(function sortFunction(a, b) {
      if (a[0] === b[0]) {
        return 0;
      } else {
        return (a[0] < b[0]) ? -1 : 1;
      }
    })
    // reverse sorting
    aRSSData.reverse()
    
    const aRSSDates = await new Array(5);
    const aRSSTitles = await new Array(5);
    const aRSSURLs = await new Array(5);
    const aRSSIMGURLs = await new Array(5);
    const aRSSIMGPaths = await new Array(5);
    const aRSSFileNames = await new Array(7);
    
    for (i = 0; i < aRSSData.length; i++) {
      const aStrSplit = aRSSData[i][1].split("|||")
      
      aRSSDates[i] = await new Date(aStrSplit[0]);
      
      aRSSTitles[i] = aStrSplit[1];
      aRSSTitles[i] = formatPostTitle(aRSSTitles[i]);
      
      aRSSURLs[i] = aStrSplit[2];
      
      if (SHOW_POST_IMAGES == "true") {
        aRSSIMGURLs[i] = aStrSplit[3];
        if (aRSSIMGURLs[i] != "none") {
          let dateID = aRSSDates[i].toLocaleString(["fr-CA"], {year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit"});
          dateID = dateID.replace(/[^a-zA-Z1-9]+/g, "");
          
          aRSSIMGPaths[i] = await getImagePath(dateID);
          aRSSFileNames[i] = await getFileName(dateID);
          
          const addBGImage = (i == 0 ? true : false);
          aRSSIMGURLs[i] = await encodeURI(aRSSIMGURLs[i]);
          aRSSIMGURLs[i] = await aRSSIMGURLs[i].replaceAll("%25", "%"); // hack for some image URLs with %
          
          await downloadPostImage(aRSSIMGPaths[i], aRSSIMGURLs[i], addBGImage);
        } else {
          aRSSIMGPaths[i] = "none";
        }
      }
    }
    
    if (SHOW_POST_IMAGES == "true") {
      aRSSFileNames[5] = aRSSFileNames[0]+"-bg";
      aRSSFileNames[6] = aRSSFileNames[0]+"-bg-blur";
      await cleanUpImages(aRSSFileNames);
    }
    
    const result = {
    aPostDates: aRSSDates,
    aPostTitles: aRSSTitles,
    aPostURLs: aRSSURLs,
    aPostIMGPaths: aRSSIMGPaths
    };
    
    return result;
  } catch(err) {
    logError("Error: "+err);
    return null;
  }
}

// check if the url leads to a json file
// parameter: url of the website
// return: true or false
async function isJSON(url) {
  try {
    await new Request(url).loadJSON();
  } catch(err) {
    return false;
  }
  return true;
}

// format the post title and replace all html entities with characters
// parameter: string of the title
// return: string with the title, readable by a human being
function formatPostTitle(strHeadline) {
  strHeadline = strHeadline.replaceAll("&quot;", '"');
  strHeadline = strHeadline.replaceAll("&amp;", "&");
  strHeadline = strHeadline.replaceAll("&lt;", "<");
  strHeadline = strHeadline.replaceAll("&gt;", ">");
  strHeadline = strHeadline.replaceAll("&apos;", "'");
  strHeadline = strHeadline.replaceAll("&#034;", '"');
  strHeadline = strHeadline.replaceAll("&#038;", "&");
  strHeadline = strHeadline.replaceAll("&#039;", "'");
  strHeadline = strHeadline.replaceAll("&#060;", "<");
  strHeadline = strHeadline.replaceAll("&#062;", ">");
  strHeadline = strHeadline.replaceAll("&#338;", "Œ");
  strHeadline = strHeadline.replaceAll("&#339;", "œ");
  strHeadline = strHeadline.replaceAll("&#352;", "Š");
  strHeadline = strHeadline.replaceAll("&#353;", "š");
  strHeadline = strHeadline.replaceAll("&#376;", "Ÿ");
  strHeadline = strHeadline.replaceAll("&#710;", "ˆ");
  strHeadline = strHeadline.replaceAll("&#732;", "˜");
  strHeadline = strHeadline.replaceAll("&#8211;", "–");
  strHeadline = strHeadline.replaceAll("&#8212;", "—");
  strHeadline = strHeadline.replaceAll("&#8216;", "‘");
  strHeadline = strHeadline.replaceAll("&#8217;", "’");
  strHeadline = strHeadline.replaceAll("&#8218;", "‚");
  strHeadline = strHeadline.replaceAll("&#8220;", "“");
  strHeadline = strHeadline.replaceAll("&#8221;", "”");
  strHeadline = strHeadline.replaceAll("&#8222;", "„");
  strHeadline = strHeadline.replaceAll("&#8224;", "†");
  strHeadline = strHeadline.replaceAll("&#8225;", "‡");
  strHeadline = strHeadline.replaceAll("&#8230;", "…");
  strHeadline = strHeadline.replaceAll("&#8240;", "‰");
  strHeadline = strHeadline.replaceAll("&#8249;", "‹");
  strHeadline = strHeadline.replaceAll("&#8250;", "›");
  strHeadline = strHeadline.replaceAll("&#8364;", "€");
  strHeadline = strHeadline.replaceAll("<![CDATA[", "");
  strHeadline = strHeadline.replaceAll("]]>", "");
  return strHeadline;
}

// get the featuredMedia image URL
// parameter: featureMedia ID, id of the post
// return: encoded URL to the image file on the server or none
async function getMediaURL(featuredMedia, postID) {
  let featuredMediaJSONURL = SITE_URL+"/wp-json/wp/v2/media/"+featuredMedia;
  let loadedMediaJSON = await new Request(featuredMediaJSONURL).loadJSON();
  let mediaURL = loadedMediaJSON.source_url;
  
  if (mediaURL == undefined || mediaURL == "undefined") {
    // search for other images
    featuredMediaJSONURL = SITE_URL+"/wp-json/wp/v2/posts/"+postID;
    loadedMediaJSON = await new Request(featuredMediaJSONURL).loadJSON();
    mediaURL = loadedMediaJSON.jetpack_featured_media_url;
    if (mediaURL == undefined || mediaURL == "undefined") {
      return "none";
    } else {
      mediaURL = mediaURL.match(/(http?s.*\.)(jpe?g|png|bmp)/i)
      mediaURL = mediaURL[1]+""+mediaURL[2];
      return await encodeURI(mediaURL);
    }
  } else {
    mediaURL = mediaURL.match(/(http?s.*\.)(jpe?g|png|bmp)/i)
    mediaURL = mediaURL[1]+""+mediaURL[2];
    return await encodeURI(mediaURL);
  }
  return "none";
}

// set the filename of the post image (site name + image id)
// parameter: id of the image
// return: filename of the image
function getFileName(id) {
  return SITE_NAME.replace(/[^a-zA-Z1-9]+/g, "").toLowerCase()+"-"+id;
}

// set the complete file path for the image
// parameter: id of the image
// return: local filepath of the image
function getImagePath(id) {
  const fm = FileManager.local();
  const docDir = fm.documentsDirectory();
  const fileName = getFileName(id);
  return fm.joinPath(docDir+"/saudumm-widget-news-data/image-cache", fileName);
}

// download the post image (if it doesn't already exist)
// parameter: path to the image, url to the image, addBGImage (true/false)
// return: nothing
async function downloadPostImage(path, url, addBGImage) {
  const fm = FileManager.local();
  
  // check if file already exists
  if (!addBGImage && fm.fileExists(path)) {
    return;
  } else if (!addBGImage && !fm.fileExists(path)) {
    // download, resize, crop and store image
    let req = await new Request(url);
    let loadedImage = await req.load();
    // write image and read again (it's smaller that way???)
    await fm.write(path, loadedImage);
    loadedImage = await fm.readImage(path);
    loadedImage = await resizeImage(loadedImage, 150);
    loadedImage = await cropImageToSquare(loadedImage);
    await fm.remove(path);
    await fm.writeImage(path, loadedImage);
    return;
  }
  
  if (addBGImage) {
    const pathBG = path+"-bg"
    const pathBGBlur = path+"-bg-blur"
    
    if (fm.fileExists(path) && fm.fileExists(pathBG) && fm.fileExists(pathBGBlur)) {
      return;
    } else {
      // download image
      let req = await new Request(url);
      let loadedImage = await req.load();
      // write image and read again (it's smaller that way???)
      await fm.write(path+"-temp", loadedImage);
      loadedImage = await fm.readImage(path+"-temp");
      
      if (await Math.min(loadedImage.size.height, loadedImage.size.width) > 500) {
        loadedImage = await resizeImage(loadedImage, 500);
      }
      
      // resize, crop and store image
      if(!fm.fileExists(path)) {
        let loadedSmallImage = await resizeImage(loadedImage, 150);
        loadedSmallImage = await cropImageToSquare(loadedSmallImage);
        await fm.writeImage(path, loadedSmallImage);
      }
      
      // store original image
      if (!fm.fileExists(pathBG)) {
        await fm.writeImage(pathBG, loadedImage);
      }
      
      // store blurred resized original image
      if (!fm.fileExists(pathBGBlur)) {
        let loadedImageBlur = await blurImage(loadedImage)
        await fm.writeImage(pathBGBlur, loadedImageBlur);
      }
      
      await fm.remove(path+"-temp");
    }
  }
  return;
}

// load post image from file path
// parameter: path to the image
// return: image
async function loadLocalImage(imgPath) {
  const fm = FileManager.local();
  if (fm.fileExists(imgPath)) {return await fm.readImage(imgPath);}
}

// search for and load a local (or iCloud) background image
// parameter: filename of the image (case sensitive!) and option to blur "true" / "false"
// return: path to the image or "not found" if image doesn't exist
async function loadBGImage(imageName, optBlur) {
  const fm = FileManager.local();
  let fmiCloud;
  try {
    fmiCloud = FileManager.iCloud();
  } catch(err) {
    // no iCloud, no BG Image
    return "not found";
  }
  
  const docDir = fm.documentsDirectory();
  const iCloudDocDir = fmiCloud.documentsDirectory();
  const bgIMGiCloudDocPath = fmiCloud.joinPath(iCloudDocDir, imageName);
  const bgIMGiCloudWPPath = fmiCloud.joinPath(iCloudDocDir+"/wallpaper", imageName);
  const bgIMGWPCachePath = fm.joinPath(docDir+"/saudumm-widget-news-data/wallpaper-cache", imageName);
  
  if (optBlur == "true" && fm.fileExists(bgIMGWPCachePath+"-blur")) {
    return await fm.readImage(bgIMGWPCachePath+"-blur");
  } else {
    if (optBlur == "true") {
      if (fmiCloud.fileExists(bgIMGiCloudDocPath)) {
        if (fmiCloud.isFileStoredIniCloud(bgIMGiCloudDocPath)) {fmiCloud.downloadFileFromiCloud(bgIMGiCloudDocPath);}
        let imgToBlur = await fmiCloud.readImage(bgIMGiCloudDocPath);
        imgToBlur = await resizeImage(imgToBlur, 300)
        imgToBlur = await blurImage(imgToBlur);
        await fm.writeImage(bgIMGWPCachePath+"-blur", imgToBlur);
        return imgToBlur;
      } else if (fmiCloud.fileExists(bgIMGiCloudWPPath)) {
        if (fmiCloud.isFileStoredIniCloud(bgIMGiCloudWPPath)) {fmiCloud.downloadFileFromiCloud(bgIMGiCloudWPPath);}
        let imgToBlur = await fmiCloud.readImage(bgIMGiCloudWPPath);
        imgToBlur = await resizeImage(imgToBlur, 300)
        imgToBlur = await blurImage(imgToBlur);
        await fm.writeImage(bgIMGWPCachePath+"-blur", imgToBlur);
        return imgToBlur;
      } else {
        return "not found";
      }
    } else {
      if (fmiCloud.fileExists(bgIMGiCloudDocPath)) {
        return await fmiCloud.readImage(bgIMGiCloudDocPath);
      } else if (fmiCloud.fileExists(bgIMGiCloudWPPath)) {
        return await fmiCloud.readImage(bgIMGiCloudWPPath);
      } else {
        return "not found";
      }
    }
  }
}

// check if all folders are available and create them if needed
// parameter: none
// return: nothing
function checkFileDirs() {
  // Create new FileManager and set data dir
  const fm = FileManager.local();
  const docDir = fm.documentsDirectory();
  const cacheDir = docDir+"/saudumm-widget-news-data/image-cache";
  const cacheDirWP = docDir+"/saudumm-widget-news-data/wallpaper-cache";
  
  if (!fm.fileExists(cacheDir)) {fm.createDirectory(cacheDir, true);}
  if (!fm.fileExists(cacheDirWP)) {fm.createDirectory(cacheDirWP, true);}
  
  return;
}

// cleanup post image files
// parameter: array with image filenames that are needed at the moment
// return: nothing
function cleanUpImages(aFileNames) {
  const fm = FileManager.local();
  const docDir = fm.documentsDirectory();
  const cacheDir = docDir+"/saudumm-widget-news-data/image-cache";
  
  const aFiles = fm.listContents(cacheDir);
  
  const site_id = SITE_NAME.replace(/[^a-zA-Z1-9]+/g, "").toLowerCase();
  
  let aFilesSite = new Array();
  
  for (i = 0; i < aFiles.length; i++) {
    if (aFiles[i].substring(0, site_id.length) === site_id) {aFilesSite.push(aFiles[i]);}
  }
  
  for (i = 0; i < aFilesSite.length; i++) {
    if (!aFileNames.includes(aFilesSite[i])) {
      let path = fm.joinPath(cacheDir, aFilesSite[i]);
      fm.remove(path);
    }
  }
  return;
}

// blurs an image
// parameter: image
// return: blurry image (well, it's better than nothing)
async function blurImage(img) {
  /*
   A big THANK YOU to Mario Klingemann for the Blur Code and Max Zeryck for the WebView Code
   code taken and modified from: https://github.com/mzeryck/Widget-Blur
   Follow @mzeryck on Twitter: https://twitter.com/mzeryck
  */
  
  // defines the blur strength in relation to the image resolution
  const blurStrength = Math.floor((img.size.height*img.size.width)/18000);
  if (blurStrength == 0) {blurStrength = 1;}
  
  const js = `
    /*
     StackBlur - a fast almost Gaussian Blur For Canvas
     Version:   0.5
     Author:    Mario Klingemann
     Contact:   mario@quasimondo.com
     Website:   http://quasimondo.com/StackBlurForCanvas/StackBlurDemo.html
     Twitter:   @quasimondo
     In case you find this class useful - especially in commercial projects -
     I am not totally unhappy for a small donation to my PayPal account
     mario@quasimondo.de
     Or support me on flattr:
     https://flattr.com/thing/72791/StackBlur-a-fast-almost-Gaussian-Blur-Effect-for-CanvasJavascript
     Copyright (c) 2010 Mario Klingemann
     Permission is hereby granted, free of charge, to any person
     obtaining a copy of this software and associated documentation
     files (the "Software"), to deal in the Software without
     restriction, including without limitation the rights to use,
     copy, modify, merge, publish, distribute, sublicense, and/or sell
     copies of the Software, and to permit persons to whom the
     Software is furnished to do so, subject to the following
     conditions:
     The above copyright notice and this permission notice shall be
     included in all copies or substantial portions of the Software.
     THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
     EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
     OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
     NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
     HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
     WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
     FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
     OTHER DEALINGS IN THE SOFTWARE.
    */
    var mul_table = [512,512,456,512,328,456,335,512,405,328,271,456,388,335,292,512,
                     454,405,364,328,298,271,496,456,420,388,360,335,312,292,273,512,
                     482,454,428,405,383,364,345,328,312,298,284,271,259,496,475,456,
                     437,420,404,388,374,360,347,335,323,312,302,292,282,273,265,512,
                     497,482,468,454,441,428,417,405,394,383,373,364,354,345,337,328,
                     320,312,305,298,291,284,278,271,265,259,507,496,485,475,465,456,
                     446,437,428,420,412,404,396,388,381,374,367,360,354,347,341,335,
                     329,323,318,312,307,302,297,292,287,282,278,273,269,265,261,512,
                     505,497,489,482,475,468,461,454,447,441,435,428,422,417,411,405,
                     399,394,389,383,378,373,368,364,359,354,350,345,341,337,332,328,
                     324,320,316,312,309,305,301,298,294,291,287,284,281,278,274,271,
                     268,265,262,259,257,507,501,496,491,485,480,475,470,465,460,456,
                     451,446,442,437,433,428,424,420,416,412,408,404,400,396,392,388,
                     385,381,377,374,370,367,363,360,357,354,350,347,344,341,338,335,
                     332,329,326,323,320,318,315,312,310,307,304,302,299,297,294,292,
                     289,287,285,282,280,278,275,273,271,269,267,265,263,261,259];
    
    var shg_table = [ 9, 11, 12, 13, 13, 14, 14, 15, 15, 15, 15, 16, 16, 16, 16, 17,
                     17, 17, 17, 17, 17, 17, 18, 18, 18, 18, 18, 18, 18, 18, 18, 19,
                     19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 20, 20, 20,
                     20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 21,
                     21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21,
                     21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 22, 22, 22, 22, 22, 22,
                     22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22,
                     22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 23,
                     23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,
                     23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,
                     23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,
                     23, 23, 23, 23, 23, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24,
                     24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24,
                     24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24,
                     24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24,
                     24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24 ];
    
    function stackBlurCanvasRGB(id, top_x, top_y, width, height, radius) {
      if (isNaN(radius) || radius < 1) {return;}
      radius |= 0;
      
      var canvas  = document.getElementById(id);
      var context = canvas.getContext("2d");
      var imageData;
      
      try {
        imageData = context.getImageData(top_x, top_y, width, height);
      } catch(e) {
        alert("Cannot access image");
        throw new Error("unable to access image data: " + e);
      }
      
      var pixels = imageData.data;
      
      var x, y, i, p, yp, yi, yw, r_sum, g_sum, b_sum,
      r_out_sum, g_out_sum, b_out_sum,
      r_in_sum, g_in_sum, b_in_sum,
      pr, pg, pb, rbs;
      
      var div = radius + radius + 1;
      var w4 = width << 2;
      var widthMinus1  = width - 1;
      var heightMinus1 = height - 1;
      var radiusPlus1  = radius + 1;
      var sumFactor = radiusPlus1 * (radiusPlus1 + 1) / 2;
      
      var stackStart = new BlurStack();
      var stack = stackStart;
      for (i = 1; i < div; i++) {
        stack = stack.next = new BlurStack();
        if (i == radiusPlus1) var stackEnd = stack;
      }
      stack.next = stackStart;
      var stackIn = null;
      var stackOut = null;
      
      yw = yi = 0;
      
      var mul_sum = mul_table[radius];
      var shg_sum = shg_table[radius];
      
      for (y = 0; y < height; y++) {
        r_in_sum = g_in_sum = b_in_sum = r_sum = g_sum = b_sum = 0;
        
        r_out_sum = radiusPlus1 * (pr = pixels[yi]);
        g_out_sum = radiusPlus1 * (pg = pixels[yi+1]);
        b_out_sum = radiusPlus1 * (pb = pixels[yi+2]);
        
        r_sum += sumFactor * pr;
        g_sum += sumFactor * pg;
        b_sum += sumFactor * pb;
        
        stack = stackStart;
        
        for (i = 0; i < radiusPlus1; i++) {
          stack.r = pr;
          stack.g = pg;
          stack.b = pb;
          stack = stack.next;
        }
        
        for (i = 1; i < radiusPlus1; i++) {
          p = yi + ((widthMinus1 < i ? widthMinus1 : i) << 2);
          r_sum += (stack.r = (pr = pixels[p])) * (rbs = radiusPlus1 - i);
          g_sum += (stack.g = (pg = pixels[p+1])) * rbs;
          b_sum += (stack.b = (pb = pixels[p+2])) * rbs;
          
          r_in_sum += pr;
          g_in_sum += pg;
          b_in_sum += pb;
          
          stack = stack.next;
        }
        
        
        stackIn = stackStart;
        stackOut = stackEnd;
        for (x = 0; x < width; x++) {
          pixels[yi]   = (r_sum * mul_sum) >> shg_sum;
          pixels[yi+1] = (g_sum * mul_sum) >> shg_sum;
          pixels[yi+2] = (b_sum * mul_sum) >> shg_sum;
          
          r_sum -= r_out_sum;
          g_sum -= g_out_sum;
          b_sum -= b_out_sum;
          
          r_out_sum -= stackIn.r;
          g_out_sum -= stackIn.g;
          b_out_sum -= stackIn.b;
          
          p =  (yw + ((p = x + radius + 1) < widthMinus1 ? p : widthMinus1)) << 2;
          
          r_in_sum += (stackIn.r = pixels[p]);
          g_in_sum += (stackIn.g = pixels[p+1]);
          b_in_sum += (stackIn.b = pixels[p+2]);
          
          r_sum += r_in_sum;
          g_sum += g_in_sum;
          b_sum += b_in_sum;
          
          stackIn = stackIn.next;
          
          r_out_sum += (pr = stackOut.r);
          g_out_sum += (pg = stackOut.g);
          b_out_sum += (pb = stackOut.b);
          
          r_in_sum -= pr;
          g_in_sum -= pg;
          b_in_sum -= pb;
          
          stackOut = stackOut.next;
          yi += 4;
        }
        yw += width;
      }
      
      for (x = 0; x < width; x++) {
        g_in_sum = b_in_sum = r_in_sum = g_sum = b_sum = r_sum = 0;
        
        yi = x << 2;
        r_out_sum = radiusPlus1 * (pr = pixels[yi]);
        g_out_sum = radiusPlus1 * (pg = pixels[yi+1]);
        b_out_sum = radiusPlus1 * (pb = pixels[yi+2]);
        
        r_sum += sumFactor * pr;
        g_sum += sumFactor * pg;
        b_sum += sumFactor * pb;
        
        stack = stackStart;
        
        for (i = 0; i < radiusPlus1; i++) {
          stack.r = pr;
          stack.g = pg;
          stack.b = pb;
          stack = stack.next;
        }
        
        yp = width;
        
        for (i = 1; i <= radius; i++) {
          yi = (yp + x) << 2;
          
          r_sum += (stack.r = (pr = pixels[yi])) * (rbs = radiusPlus1 - i);
          g_sum += (stack.g = (pg = pixels[yi+1])) * rbs;
          b_sum += (stack.b = (pb = pixels[yi+2])) * rbs;
          
          r_in_sum += pr;
          g_in_sum += pg;
          b_in_sum += pb;
          
          stack = stack.next;
          
          if (i < heightMinus1) {yp += width;}
        }
        
        yi = x;
        stackIn = stackStart;
        stackOut = stackEnd;
        for (y = 0; y < height; y++) {
          p = yi << 2;
          pixels[p]   = (r_sum * mul_sum) >> shg_sum;
          pixels[p+1] = (g_sum * mul_sum) >> shg_sum;
          pixels[p+2] = (b_sum * mul_sum) >> shg_sum;
          
          r_sum -= r_out_sum;
          g_sum -= g_out_sum;
          b_sum -= b_out_sum;
          
          r_out_sum -= stackIn.r;
          g_out_sum -= stackIn.g;
          b_out_sum -= stackIn.b;
          
          p = (x + (((p = y + radiusPlus1) < heightMinus1 ? p : heightMinus1) * width)) << 2;
          
          r_sum += (r_in_sum += (stackIn.r = pixels[p]));
          g_sum += (g_in_sum += (stackIn.g = pixels[p+1]));
          b_sum += (b_in_sum += (stackIn.b = pixels[p+2]));
          
          stackIn = stackIn.next;
          
          r_out_sum += (pr = stackOut.r);
          g_out_sum += (pg = stackOut.g);
          b_out_sum += (pb = stackOut.b);
          
          r_in_sum -= pr;
          g_in_sum -= pg;
          b_in_sum -= pb;
          
          stackOut = stackOut.next;
          
          yi += width;
        }
      }
      
      context.putImageData(imageData, top_x, top_y);
    }
    
    function BlurStack() {
      this.r = 0;
      this.g = 0;
      this.b = 0;
      this.a = 0;
      this.next = null;
    }
    
    // Set up the canvas
    const img = document.getElementById("blurImg");
    const canvas = document.getElementById("mainCanvas");
    const w = img.width;
    const h = img.height;
    canvas.style.width  = w + "px";
    canvas.style.height = h + "px";
    canvas.width = w;
    canvas.height = h;
    const context = canvas.getContext("2d");
    context.clearRect(0, 0, w, h);
    context.drawImage(img, 0, 0, w, h);
    
    // Get the image data from the context
    var imageData = context.getImageData(0,0,w,h);
    // Draw over the old image
    context.putImageData(imageData,0,0);
    // Blur the image
    stackBlurCanvasRGB("mainCanvas", 0, 0, w, h, ${blurStrength});
    // Return a base64 representation
    canvas.toDataURL();
  `;
  
  // Convert the images and create the HTML
  let blurImgData = await Data.fromPNG(img).toBase64String();
  let html = `<img id="blurImg" src="data:image/png;base64,${blurImgData}" /><canvas id="mainCanvas" />`;
  
  // Make the web view and get its return value
  let view = new WebView();
  await view.loadHTML(html);
  let returnValue = await view.evaluateJavaScript(js);
  
  // Remove the data type from the string and convert to data
  let imageDataString = await returnValue.slice(22);
  let imageData = await Data.fromBase64String(imageDataString);
  
  // Convert to image before returning
  let imageFromData = await Image.fromData(imageData);
  return imageFromData;
}

// resize the background image
// parameter: image, max short side pixels the image should be resized to
// return: resized image (duh)
async function resizeImage(img, maxShortSide) {
  let imgHeight = await img.size.height;
  let imgWidth = await img.size.width;
  let imgShortSide = await Math.min(imgHeight, imgWidth);
  let resizeFactor = await Math.round(imgShortSide/maxShortSide);

  const js = `
    // Set up the canvas
    const img = document.getElementById("resImg");
    const canvas = document.getElementById("mainCanvas");
    const w = img.width;
    const h = img.height;
    const maxW = Math.round(w / ${resizeFactor});
    const maxH = Math.round(h / ${resizeFactor});
    canvas.style.width  = w + "px";
    canvas.style.height = h + "px";
    canvas.width = maxW;
    canvas.height = maxH;
    const context = canvas.getContext("2d");
    context.clearRect(0, 0, w, h);
    context.drawImage(img, 0, 0, maxW, maxH);
    
    // Get the image data from the context
    var imageData = context.getImageData(0,0,w,h);
    // Draw over the old image
    context.putImageData(imageData,0,0);
    // Return a base64 representation
    canvas.toDataURL();
  `;
  
  // Convert the images and create the HTML
  let resImgData = await Data.fromPNG(img).toBase64String();
  let html = `<img id="resImg" src="data:image/png;base64,${resImgData}" /><canvas id="mainCanvas" />`;
  
  // Make the web view and get its return value
  let view = new WebView();
  await view.loadHTML(html);
  let returnValue = await view.evaluateJavaScript(js);
  
  // Remove the data type from the string and convert to data
  let imageDataString = await returnValue.slice(22);
  let imageData = await Data.fromBase64String(imageDataString);
  
  // Convert to image before returning
  let imageFromData = await Image.fromData(imageData);
  
  return imageFromData;
}

// crops an image to a square
// parameter: image
// return: square image
async function cropImageToSquare(img) {
  const imgHeight = await img.size.height;
  const imgWidth = await img.size.width;
  
  let imgShortSide = await Math.min(imgHeight, imgWidth);
  let imgLongSide = await Math.max(imgHeight, imgWidth);
  
  if (imgShortSide != imgLongSide) {
    let imgCropTotal = await (imgLongSide - imgShortSide);
    let imgCropSide = await Math.floor(imgCropTotal / 2);

    let rect;
    switch (imgShortSide) {
      case imgHeight:
        rect = new Rect(imgCropSide, 0, imgShortSide, imgShortSide);
        break;
      case imgWidth:
        rect = new Rect(0, imgCropSide, imgShortSide, imgShortSide);
        break;
    }
    
    let draw = new DrawContext();
    draw.size = new Size(rect.width, rect.height);
    
    draw.drawImageAtPoint(img, new Point(-rect.x, -rect.y));
    img = draw.getImage();
  }
  return img;
}
