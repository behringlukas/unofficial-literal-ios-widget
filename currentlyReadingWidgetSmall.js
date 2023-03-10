// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: teal; icon-glyph: magic;

let params = null; //parameters from input via edit widget
let fm = FileManager.iCloud(); //fileManager to make widget work offline
let persistFolder = "literalWidgetCache"; //foldername to save cached data
let coverUrl = ""; //URL for the cover
let img; //image for placeholder
let titleText; //book title
let authorText; //author name
const fontColorDarkmode = new Color("#FFFFFF"); //font color for darkmode
const fontColorLightmode = new Color("#000000"); //font color for lightmode
const backgroundColorDarkmode = new Color("#000000"); //background color for darkmode
const backgroundColorLightmode = new Color("#FFFFFF"); //background color for lightmode

//creating widget
const widget = new ListWidget();

//check input parameters or use placeholder user
if (args.widgetParameter != null) {
  params = args.widgetParameter.split(",");
} else {
  params = ["piet", "light"];
}

//get user data, book data and url of cover from api
const userInformation = await userData(params[0]);
const result = await getData(userInformation);
try {
  coverUrl = result.data.booksByReadingStateAndProfile[0]["cover"];
} catch (e) {}

//add cover of book if online, cached cover if offline or placeholder if no currently reading book
//add it to widget
try {
  img = await new Request(
    "https://pbs.twimg.com/profile_images/1371430883576717313/LyhsMxnf_400x400.jpg"
  ).loadImage();
  const coverRequest = new Request(coverUrl);
  const coverImg = await coverRequest.loadImage();
  writeDataToFile(params[0], userInformation, result, coverImg);
  widget.addImage(coverImg).centerAlignImage();
} catch (e) {
  if (img !== undefined) {
    writeDataToFile(params[0], userInformation, result, img);
  }
  const coverCache = loadImageFromFile(params[0]);
  widget.addImage(coverCache).centerAlignImage();
}

//add spacing between book cover and book information
widget.addSpacer();

//add title and author to widget
try {
  const title = result.data.booksByReadingStateAndProfile[0]["title"];
  const titleText = widget.addText(title);
  titleText.centerAlignText();
  const author =
    result.data.booksByReadingStateAndProfile[0].authors[0]["name"];
  const authorText = widget.addText(author);
  authorText.centerAlignText();

  titleText.font = Font.boldSystemFont(12);
  authorText.font = Font.systemFont(11);

  //set darkmode/lightmode based on user parameter input
  if (params[1] === "dark") {
    widget.backgroundColor = backgroundColorDarkmode;
    titleText.textColor = fontColorDarkmode;
    authorText.textColor = fontColorDarkmode;
  } else {
    widget.backgroundColor = backgroundColorLightmode;
    titleText.textColor = fontColorLightmode;
    authorText.textColor = fontColorLightmode;
  }
} catch (e) {
  showNoReadingMessage();
}

//write last retrieved data (also placeholder image) into iCloud file as cache
//separate files for data and loaded png image
function writeDataToFile(user, userInformation, result, coverImg) {
  let dir = fm.documentsDirectory();
  let path = fm.joinPath(dir, persistFolder + "/");
  let pathImage = fm.joinPath(dir, persistFolder + "/");
  if (!fm.fileExists(path)) {
    fm.createDirectory(path, false);
  } else if (!fm.fileExists(pathImage)) {
    fm.createDirectory(pathImage, false);
  }
  path += user + ".json";
  pathImage += user + "Image" + ".json";
  fm.writeString(path, JSON.stringify([userInformation, result]));
  fm.writeImage(pathImage, coverImg);
}

//load data from cache (iCloud folder)
function loadDataFromFile(user) {
  let dir = fm.documentsDirectory();
  let path = fm.joinPath(dir, persistFolder + "/" + user + ".json");
  if (!fm.fileExists(path)) {
    console.log("No file found");
  } else {
    let jsonString = fm.readString(path);
    return JSON.parse(jsonString);
  }
}

//load image from cache (iCloud folder)
function loadImageFromFile(user) {
  let dir = fm.documentsDirectory();
  let pathImage = fm.joinPath(
    dir,
    persistFolder + "/" + user + "Image" + ".json"
  );
  if (!fm.fileExists(pathImage)) {
    console.log("No file found");
  } else {
    let image = fm.readImage(pathImage);
    return image;
  }
}

//show message if there is no currently reading book
function showNoReadingMessage() {
  const noBook = widget.addText("You're not reading anything at the moment");
  noBook.font = Font.systemFont(12);
  widget.addSpacer();
  noBook.centerAlignText();

  if (params[1] === "dark") {
    widget.backgroundColor = backgroundColorDarkmode;
    noBook.textColor = fontColorDarkmode;
  } else {
    widget.backgroundColor = backgroundColorLightmode;
    noBook.textColor = fontColorLightmode;
  }
}

//api call to get profileId from handle
async function userData(userHandle) {
  const api = "https://literal.club/graphql/";

  const query = `query getProfileParts($handle: String!)
  				{
					profile(where: {handle: $handle})
					{
						id
					}
    			}`;

  console.log(userHandle);
  const body = {
    query: query,
    variables: {
      handle: `${userHandle}`,
    },
  };

  const headers = {
    "content-type": "application/json",
  };

  try {
    const req = new Request(api);
    req.headers = headers;
    req.body = JSON.stringify(body);
    req.method = "post";
    const result = await req.loadJSON();
    const profileId = await result.data.profile["id"];
    return profileId;
  } catch (e) {
    const userHandleFromFile = loadDataFromFile(params[0]);
    return userHandleFromFile[0];
  }
}

//api call to get book data from previously retrieved profileId
async function getData(profileId) {
  const api = "https://literal.club/graphql/";
  const query = `query booksByReadingStateAndProfile(
 	$limit: Int!
  	$offset: Int!
   	$readingStatus: ReadingStatus!
   	$profileId: String!) 
	{
        booksByReadingStateAndProfile(
            limit: $limit,
            offset: $offset,
            readingStatus: $readingStatus,
            profileId: $profileId)
      	{
    		id    
			title
        	cover
        	authors{
        		name 
        	}
	  	}
    }`;

  const body = {
    query: query,
    variables: {
      limit: 1,
      offset: 0,
      profileId: `${profileId}`,
      readingStatus: "IS_READING",
    },
  };

  const headers = {
    "content-type": "application/json",
  };

  try {
    const req = new Request(api);
    req.headers = headers;
    req.body = JSON.stringify(body);
    req.method = "post";
    const result = await req.loadJSON();
    return result;
  } catch (e) {
    const dataFromFile = loadDataFromFile(params[0]);
    return dataFromFile[1];
  }
}

//set output of this widget
Script.setWidget(widget);
Script.complete();

//preview widget in Scriptable (only for testing purposes)
widget.presentSmall();
