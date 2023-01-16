// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: teal; icon-glyph: magic;
//get parameters from input via edit widget
let params = null;
if (args.widgetParameter != null) {
  params = args.widgetParameter.split(",");
} else {
  params = ["piet", "light"];
}
console.log(params);

//creating widget
const widget = new ListWidget();

//fileManager to make widget work offline
let fm = FileManager.iCloud();
let persistFolder = "literalWidgetCache";

//get data(title,author,cover) from api
const userInformation = await userData(params[0]);
const result = await getData(userInformation);
let coverUrl = "";
try {
  console.log("1");
  coverUrl = result.data.booksByReadingStateAndProfile[0]["cover"];
  console.log(coverUrl);
} catch (e) {}

function showError() {
  const noBook = widget.addText("You're not reading anything");
  noBook.font = Font.systemFont(12);
  widget.addSpacer();
  noBook.centerAlignText();
  if (params[1] === "dark") {
    widget.backgroundColor = Color.black();
    noBook.textColor = Color.white();
  } else {
    widget.backgroundColor = Color.white();
    noBook.textColor = Color.black();
  }
}
//get literal logo as placeholder in case a book has no cover
let img;

try {
  img = await new Request(
    "https://pbs.twimg.com/profile_images/1371430883576717313/LyhsMxnf_400x400.jpg"
  ).loadImage();
  const coverRequest = new Request(coverUrl);
  console.log("test" + coverUrl);
  const coverImg = await coverRequest.loadImage();
  writeDataToFile(params[0], userInformation, result, coverImg);
  console.log(result);

  //add cover to widget
  const cover = widget.addImage(coverImg);
  cover.centerAlignImage();
  widget.addSpacer();
} catch (e) {
  //add placeholder as cover to widget
  console.log(e);
  console.log(img);
  if (img !== undefined) {
    writeDataToFile(params[0], userInformation, result, img);
  }
  console.log(e);
  console.log(img);
  //const coverPlaceholder = widget.addImage(img);
  //coverPlaceholder.centerAlignImage();
  //widget.addSpacer();
  console.log(params[0]);
  const coverCache = loadImageFromFile(params[0]);
  coverX = widget.addImage(coverCache);
  coverX.centerAlignImage();
  widget.addSpacer();
}

let titleText;
let authorText;

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

  titleText.font = Font.boldSystemFont(12);
  authorText.font = Font.systemFont(11);

  //set darkmode/lightmode based on user parameter input
  if (params[1] === "dark") {
    widget.backgroundColor = Color.black();
    titleText.textColor = Color.white();
    authorText.textColor = Color.white();
  } else {
    widget.backgroundColor = Color.white();
    titleText.textColor = Color.black();
    authorText.textColor = Color.black();
  }
} catch (e) {
  showError();
}

function writeDataToFile(user, userInformation, result, coverImg) {
  let dir = fm.documentsDirectory();
  var path = fm.joinPath(dir, persistFolder + "/");
  var pathImage = fm.joinPath(dir, persistFolder + "/");
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

function loadDataFromFile(user) {
  let dir = fm.documentsDirectory();
  var path = fm.joinPath(dir, persistFolder + "/" + user + ".json");
  if (!fm.fileExists(path)) {
    console.log("No file found");
  } else {
    var jsonString = fm.readString(path);
    return JSON.parse(jsonString);
  }
}

function loadImageFromFile(user) {
  let dir = fm.documentsDirectory();
  var pathImage = fm.joinPath(
    dir,
    persistFolder + "/" + user + "Image" + ".json"
  );
  if (!fm.fileExists(pathImage)) {
    console.log("No file found");
  } else {
    var image = fm.readImage(pathImage);
    return image;
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
    console.log(result);
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
