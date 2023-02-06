// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: teal; icon-glyph: magic;

let params = null; //parameters from input via edit widget
let fm = FileManager.iCloud(); //fileManager to make widget work offline
let persistFolder = "literalWidgetCache"; //foldername to save cached data
let coverUrlBook = ""; //URL for the cover
let img; //image for placeholder
let titleText; //book title
let authorText; //author name
let coverImgBook1; //cover image book one
let coverImgBook2; //cover image book two
let coverImgBook3; //cover image book three
let coverRequestBook1; //cover image request book one
let coverRequestBook2; //cover image request book two
let coverRequestBook3; //cover image request book three
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
  coverUrlBook1 = result.data.booksByReadingStateAndProfile[0]["cover"];
  coverUrlBook2 = result.data.booksByReadingStateAndProfile[1]["cover"];
  coverUrlBook3 = result.data.booksByReadingStateAndProfile[2]["cover"];
} catch (e) {}

//create main container for content
const main = widget.addStack();
main.setPadding(5, 5, 5, 5);
main.layoutHorizontally();

//create single containers for each book inside main container
const stackB1 = main.addStack();
const stackB2 = main.addStack();
const stackB3 = main.addStack();
stackB1.layoutVertically();
stackB2.layoutVertically();
stackB3.layoutVertically();
stackB1.setPadding(0, 15, 0, 15);
stackB2.setPadding(0, 0, 0, 15);
stackB3.setPadding(0, 0, 0, 15);

//create container for cover inside book container (B1-3)
const cover1 = stackB1.addStack();
const cover2 = stackB2.addStack();
const cover3 = stackB3.addStack();

//create container for book information inside book container (B1-3)
const bookInfo1 = stackB1.addStack();
bookInfo1.setPadding;
const bookInfo2 = stackB2.addStack();
const bookInfo3 = stackB3.addStack();
bookInfo1.layoutVertically();
bookInfo2.layoutVertically();
bookInfo3.layoutVertically();

//add cover of book if online, cached cover if offline or placeholder if no currently reading book
//add it to widget
try {
  img = await new Request(
    "https://pbs.twimg.com/profile_images/1371430883576717313/LyhsMxnf_400x400.jpg"
  ).loadImage();
  coverRequestBook1 = new Request(coverUrlBook1);
  coverRequestBook2 = new Request(coverUrlBook2);
  coverRequestBook3 = new Request(coverUrlBook3);
  coverImgBook1 = await coverRequestBook1.loadImage();
  coverImgBook2 = await coverRequestBook2.loadImage();
  coverImgBook3 = await coverRequestBook3.loadImage();

  //cache all data
  writeDataToFile(
    params[0],
    userInformation,
    result,
    img,
    coverImgBook1,
    coverImgBook2,
    coverImgBook3
  );

  //add spacing
  cover1.addImage(coverImgBook1);
  cover1.addSpacer();
  cover2.addImage(coverImgBook2);
  cover2.addSpacer();
  cover3.addImage(coverImgBook3);
  cover3.addSpacer();
} catch (e) {
  if (img !== undefined) {
    writeDataToFile(params[0], userInformation, result, img);
  }

  const coverCache1 = loadImageFromFile1(params[0]);
  const coverCache2 = loadImageFromFile2(params[0]);
  const coverCache3 = loadImageFromFile3(params[0]);
  const coverCachePlaceholder = loadImageFromFile4(params[0]);

  if (
    typeof coverUrlBook1 === "undefined" ||
    typeof coverUrlBook2 === "undefined" ||
    typeof coverUrlBook3 === "undefined"
  ) {
    widget.addImage(coverCachePlaceholder).centerAlignImage();
    widget.addSpacer();
  } else {
    if (coverUrlBook1 === "") {
      cover1.addImage(coverCachePlaceholder);
      cover1.addSpacer();
    } else {
      try {
        coverImgBook1 = await coverRequestBook1.loadImage();
        cover1.addImage(coverImgBook1);
        cover1.addSpacer();
      } catch (e) {
        cover1.addImage(coverCache1);
        cover1.addSpacer();
      }
    }
    if (coverUrlBook2 === "") {
      cover2.addImage(coverCachePlaceholder);
      cover2.addSpacer();
    } else {
      try {
        coverImgBook2 = await coverRequestBook2.loadImage();
        cover2.addImage(coverImgBook2);
        cover2.addSpacer();
      } catch (e) {
        cover2.addImage(coverCache2);
        cover2.addSpacer();
      }
    }
    if (coverUrlBook3 === "") {
      cover3.addImage(coverCachePlaceholder);
      cover3.addSpacer();
    } else {
      try {
        coverImgBook3 = await coverRequestBook3.loadImage();
        cover3.addImage(coverImgBook3);
        cover3.addSpacer();
      } catch (e) {
        cover3.addImage(coverCache3);
        cover3.addSpacer();
      }
    }
    writeDataToFile(
      params[0],
      userInformation,
      result,
      img,
      coverImgBook1,
      coverImgBook2,
      coverImgBook3
    );
  }
}

//add title and author to widget
try {
  const titleBook1 = result.data.booksByReadingStateAndProfile[0]["title"];
  bookInfo1.addSpacer();
  const titleBook2 = result.data.booksByReadingStateAndProfile[1]["title"];
  bookInfo2.addSpacer();
  const titleBook3 = result.data.booksByReadingStateAndProfile[2]["title"];
  bookInfo3.addSpacer();

  const titleText1 = bookInfo1.addText(titleBook1);
  const titleText2 = bookInfo2.addText(titleBook2);
  const titleText3 = bookInfo3.addText(titleBook3);

  const author1 =
    result.data.booksByReadingStateAndProfile[0].authors[0]["name"];
  const author2 =
    result.data.booksByReadingStateAndProfile[1].authors[0]["name"];
  const author3 =
    result.data.booksByReadingStateAndProfile[2].authors[0]["name"];

  const authorText1 = bookInfo1.addText(author1);
  const authorText2 = bookInfo2.addText(author2);
  const authorText3 = bookInfo3.addText(author3);

  titleText1.font = Font.boldSystemFont(12);
  titleText2.font = Font.boldSystemFont(12);
  titleText3.font = Font.boldSystemFont(12);

  authorText1.font = Font.systemFont(11);
  authorText2.font = Font.systemFont(11);
  authorText3.font = Font.systemFont(11);

  //set darkmode/lightmode based on user parameter input
  if (params[1] === "dark") {
    widget.backgroundColor = backgroundColorDarkmode;
    titleText1.textColor = fontColorDarkmode;
    authorText1.textColor = fontColorDarkmode;
    titleText2.textColor = fontColorDarkmode;
    authorText2.textColor = fontColorDarkmode;
    titleText3.textColor = fontColorDarkmode;
    authorText3.textColor = fontColorDarkmode;
  } else {
    widget.backgroundColor = backgroundColorLightmode;
    titleText1.textColor = fontColorLightmode;
    authorText1.textColor = fontColorLightmode;
    titleText2.textColor = fontColorLightmode;
    authorText2.textColor = fontColorLightmode;
    titleText3.textColor = fontColorLightmode;
    authorText3.textColor = fontColorLightmode;
  }
} catch (e) {
  showNoReadingMessage();
}

//write last retrieved data (also placeholder image) into iCloud file as cache
//separate files for data and loaded png image
function writeDataToFile(
  user,
  userInformation,
  result,
  img,
  coverImg1,
  coverImg2,
  coverImg3
) {
  let dir = fm.documentsDirectory();
  let path = fm.joinPath(dir, persistFolder + "/");
  let pathImage1 = fm.joinPath(dir, persistFolder + "/");
  let pathImage2 = fm.joinPath(dir, persistFolder + "/");
  let pathImage3 = fm.joinPath(dir, persistFolder + "/");
  let pathImagePlaceholder = fm.joinPath(dir, persistFolder + "/");
  if (!fm.fileExists(path)) {
    fm.createDirectory(path, false);
  } else if (!fm.fileExists(pathImage1)) {
    fm.createDirectory(pathImage1, false);
  } else if (!fm.fileExists(pathImage2)) {
    fm.createDirectory(pathImage2, false);
  } else if (!fm.fileExists(pathImage3)) {
    fm.createDirectory(pathImage3, false);
  } else if (!fm.fileExists(pathImagePlaceholder)) {
    fm.createDirectory(pathImagePlaceholder, false);
  }
  path += user + "medium" + ".json";
  pathImage1 += user + "medium" + "Image1" + ".json";
  pathImage2 += user + "medium" + "Image2" + ".json";
  pathImage3 += user + "medium" + "Image3" + ".json";
  pathImagePlaceholder += user + "medium" + "ImagePlaceholder" + ".json";
  fm.writeString(path, JSON.stringify([userInformation, result]));
  try {
    fm.writeImage(pathImage1, coverImg1);
    console.log(1);
  } catch (e) {}
  try {
    fm.writeImage(pathImage2, coverImg2);
    console.log(2);
  } catch (e) {
    console.log(e);
  }
  try {
    fm.writeImage(pathImage3, coverImg3);
    console.log(3);
  } catch (e) {
    console.log(e);
  }
  try {
    fm.writeImage(pathImagePlaceholder, img);
    console.log(4);
  } catch (e) {}
}

//load data from cache (iCloud folder)
function loadDataFromFile(user) {
  let dir = fm.documentsDirectory();
  let path = fm.joinPath(dir, persistFolder + "/" + user + "medium" + ".json");
  if (!fm.fileExists(path)) {
    console.log("No file found");
  } else {
    let jsonString = fm.readString(path);
    return JSON.parse(jsonString);
  }
}

//load image from book1 from cache (iCloud folder)
function loadImageFromFile1(user) {
  let dir = fm.documentsDirectory();
  let pathImage1 = fm.joinPath(
    dir,
    persistFolder + "/" + user + "medium" + "Image1" + ".json"
  );
  if (!fm.fileExists(pathImage1)) {
    console.log("No file found");
  } else {
    let image = fm.readImage(pathImage1);
    return image;
  }
}

//load image from book2 from cache (iCloud folder)
function loadImageFromFile2(user) {
  let dir = fm.documentsDirectory();
  let pathImage2 = fm.joinPath(
    dir,
    persistFolder + "/" + user + "medium" + "Image2" + ".json"
  );
  if (!fm.fileExists(pathImage2)) {
    console.log("No file found");
  } else {
    let image = fm.readImage(pathImage2);
    return image;
  }
}

//load image from book3 from cache (iCloud folder)
function loadImageFromFile3(user) {
  let dir = fm.documentsDirectory();
  let pathImage3 = fm.joinPath(
    dir,
    persistFolder + "/" + user + "medium" + "Image3" + ".json"
  );
  if (!fm.fileExists(pathImage3)) {
    console.log("No file found");
  } else {
    let image = fm.readImage(pathImage3);
    return image;
  }
}

//load image from placeholder from cache (iCloud folder)
function loadImageFromFile4(user) {
  let dir = fm.documentsDirectory();
  let pathImagePlaceholder = fm.joinPath(
    dir,
    persistFolder + "/" + user + "medium" + "ImagePlaceholder" + ".json"
  );
  if (!fm.fileExists(pathImagePlaceholder)) {
    console.log("No file found");
  } else {
    let image = fm.readImage(pathImagePlaceholder);
    return image;
  }
}

//show message if there is no currently reading book
function showNoReadingMessage() {
  widget.addSpacer();
  const noBook = widget.addText(
    "You need to read at least 3 books to display them here."
  );
  widget.addSpacer();
  noBook.font = Font.boldSystemFont(12);
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
