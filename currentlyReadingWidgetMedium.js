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

//creating widget
const widget = new ListWidget();

//check input parameters or use placeholder user
if (args.widgetParameter != null) {
  params = args.widgetParameter.split(",");
} else {
  params = ["piet", "light"];
}

//get data(title,author,cover) from api
const userInformation = await userData(params[0]);
const result = await getData(userInformation);
console.log(result);
try {
  coverUrl = result.data.booksByReadingStateAndProfile[0]["cover"];
  coverUrl1 = result.data.booksByReadingStateAndProfile[1]["cover"];
  coverUrl2 = result.data.booksByReadingStateAndProfile[2]["cover"];
} catch (e) {}

const main = widget.addStack();
main.layoutHorizontally();
const stack = main.addStack();
stack.layoutVertically();
const stack1 = main.addStack();
stack1.layoutVertically();
const stack2 = main.addStack();
stack2.layoutVertically();

//add cover of book if online, cached cover if offline or placeholder if no currently reading book
//add it to widget
try {
  img = await new Request(
    "https://pbs.twimg.com/profile_images/1371430883576717313/LyhsMxnf_400x400.jpg"
  ).loadImage();
  const coverRequest = new Request(coverUrl);
  const coverRequest1 = new Request(coverUrl1);
  const coverRequest2 = new Request(coverUrl2);
  const coverImg = await coverRequest.loadImage();
  const coverImg1 = await coverRequest1.loadImage();
  const coverImg2 = await coverRequest2.loadImage();
  writeDataToFile(
    params[0],
    userInformation,
    result,
    coverImg,
    coverImg1,
    coverImg2
  );
  const cover = stack.addImage(coverImg);
  const cover1 = stack1.addImage(coverImg1);
  const cover2 = stack2.addImage(coverImg2);
  cover.centerAlignImage();
  cover1.centerAlignImage();
  cover2.centerAlignImage();
  widget.addSpacer();
} catch (e) {
  if (img !== undefined) {
    writeDataToFile(params[0], userInformation, result, img);
  }
  const coverCache = loadImageFromFile(params[0]);
  coverFromCache = widget.addImage(coverCache);
  coverFromCache.centerAlignImage();
  widget.addSpacer();
}

//add title and author to widget
try {
  const title = result.data.booksByReadingStateAndProfile[0]["title"];
  const title1 = result.data.booksByReadingStateAndProfile[1]["title"];
  const title2 = result.data.booksByReadingStateAndProfile[2]["title"];

  const titleText = stack.addText(title);
  const titleText1 = stack1.addText(title1);
  const titleText2 = stack2.addText(title2);

  titleText.centerAlignText();
  titleText1.centerAlignText();
  titleText2.centerAlignText();

  const author =
    result.data.booksByReadingStateAndProfile[0].authors[0]["name"];
  const author1 =
    result.data.booksByReadingStateAndProfile[0].authors[1]["name"];
  const author2 =
    result.data.booksByReadingStateAndProfile[0].authors[2]["name"];

  const authorText = stack.addText(author);
  const authorText1 = stack1.addText(author1);
  const authorText2 = stack2.addText(author2);

  authorText.centerAlignText();
  authorText1.centerAlignText();
  authorText2.centerAlignText();

  titleText.font = Font.boldSystemFont(12);
  authorText.font = Font.systemFont(11);
  titleText1.font = Font.boldSystemFont(12);
  authorText1.font = Font.systemFont(11);
  titleText2.font = Font.boldSystemFont(12);
  authorText2.font = Font.systemFont(11);

  //set darkmode/lightmode based on user parameter input
  if (params[1] === "dark") {
    widget.backgroundColor = Color.black();
    titleText.textColor = Color.white();
    authorText.textColor = Color.white();
    titleText1.textColor = Color.white();
    authorText1.textColor = Color.white();
    titleText2.textColor = Color.white();
    authorText2.textColor = Color.white();
  } else {
    widget.backgroundColor = Color.white();
    titleText.textColor = Color.black();
    authorText.textColor = Color.black();
    titleText1.textColor = Color.black();
    authorText1.textColor = Color.black();
    titleText2.textColor = Color.black();
    authorText2.textColor = Color.black();
  }
} catch (e) {
  showMessage();
}

//write last retrieved data (also placeholder image) into iCloud file as cache
//separate files for data and loaded png image
function writeDataToFile(
  user,
  userInformation,
  result,
  coverImg,
  coverImg1,
  coverImg2
) {
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
  fm.writeImage(pathImage, coverImg, coverImg1, coverImg2);
}

//load data from cache (iCloud folder)
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

//load image from cache (iCloud folder)
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

//show message if there is no currently reading book
function showMessage() {
  const noBook = widget.addText("You're not reading anything at the moment");
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
      limit: 3,
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
widget.presentMedium();
