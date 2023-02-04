// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: teal; icon-glyph: magic;

let fm = FileManager.iCloud(); //fileManager to make widget work offline
let persistFolder = "literalWidgetCache"; //foldername to save cached data
let coverUrl = ""; //URL for the cover
let img; //image for placeholder
let userId;
let token;
let book;
let result;
let tokenResult;
let currentBook;
let totalPages;
let currentPage;
let progressPercentage;
let pagesLeft;

//creating widget
const widget = new ListWidget();
const darkmode = false;

//user credentials
let userMail = "PUT YOUR MAIL ADRESSE INSIDE THESE QUOTATIONS";
let password = "PUT YOUR PASSWORD INSIDE THESE QUOTATIONS";
let user = "PUT YOUR USERHANDLE IN HERE";

//get bearer token for user from api
try {
  tokenResult = await getToken(userMail, password);
  token = tokenResult.data.login["token"];
  userId = tokenResult.data.login.profile["id"];
} catch (e) {
  token = tokenResult;
}

const main = widget.addStack();
const st1 = main.addStack();
const st2 = main.addStack();
const st21 = st2.addStack();
st2.addSpacer(11);
const st22 = st2.addStack();
const st23 = st22.addStack();
const st24 = st22.addStack();

st2.layoutVertically();
st21.setPadding(5, 0, 5, 0);
st21.backgroundColor = new Color("#dbdbdb");
st22.setPadding(5, 0, 5, 0);
st22.backgroundColor = new Color("#dbdbdb");
st2.setPadding(1, 1, 1, 1);
st21.cornerRadius = 5;
st22.cornerRadius = 5;
st21.layoutHorizontally();
st22.layoutVertically();
st23.layoutHorizontally();
st24.layoutHorizontally();

//get data from api
try {
  book = await getCurrentlyReading(userId);
  currentBook = book.data.booksByReadingStateAndProfile[0]["id"];
  result = await getData(user, currentBook, token);
  totalPages = result.data.readingProgresses[0]["capacity"];
  currentPage = result.data.readingProgresses[0]["progress"]; //
  progressPercentage = Math.round((currentPage / totalPages) * 100);
  pagesLeft = totalPages - currentPage;
} catch (e) {
  result = await getData(user, currentBook, token);
  currentBook = result[0];
  totalPages = result[1];
  currentPage = result[2];
  progressPercentage = Math.round((currentPage / totalPages) * 100);
  pagesLeft = totalPages - currentPage;
}

try {
  coverUrl = book.data.booksByReadingStateAndProfile[0]["cover"];
} catch (e) {}

try {
  img = await new Request(
    "https://pbs.twimg.com/profile_images/1371430883576717313/LyhsMxnf_400x400.jpg"
  ).loadImage();
  const coverRequest = new Request(coverUrl);
  const coverImg = await coverRequest.loadImage();
  writeDataToFile(user, token, result, book, coverImg);
  const cover = st1.addImage(coverImg);
} catch (e) {
  if (img !== undefined) {
    writeDataToFile(user, token, result, book, img);
  }
  const coverCache = loadImageFromFile(user);
  coverFromCache = st1.addImage(coverCache);
}

if ((totalPages || currentPage) === undefined) {
  progressPercentage = 0;
  pagesLeft = "all";
}
if (progressPercentage === 100 && pagesLeft != 0) {
  progressPercentage = 99;
}
st1.addSpacer();
st2.addSpacer();
st21.addSpacer();
const coverPlaceholder = st21.addText(progressPercentage.toString() + "%");
st23.addSpacer();
const left = st23.addText(pagesLeft.toString());
st23.addSpacer();
st24.addSpacer();
const left2 = st24.addText("pages left");
st24.addSpacer();
left.font = Font.boldSystemFont(12);
left2.font = Font.systemFont(8);
coverPlaceholder.textColor = Color.black();
coverPlaceholder.centerAlignText();
left.textColor = Color.black();
left2.textColor = Color.black();
coverPlaceholder.font = Font.boldSystemFont(13);
left.centerAlignText();
st21.addSpacer();
widget.addSpacer();

try {
  const title = widget.addText(
    book.data.booksByReadingStateAndProfile[0]["title"]
  );
  title.centerAlignText();

  const author = widget.addText(
    book.data.booksByReadingStateAndProfile[0].authors[0]["name"]
  );
  author.centerAlignText();

  title.font = Font.boldSystemFont(12);
  author.font = Font.systemFont(11);

  //set background and text styles
  if (darkmode === false) {
    widget.backgroundColor = Color.white();
    title.textColor = Color.black();
    author.textColor = Color.black();
  } else {
    widget.backgroundColor = Color.black();
    title.textColor = Color.white();
    author.textColor = Color.white();
  }
} catch (e) {
  showMessage();
}

//write last retrieved data (also placeholder image) into iCloud file as cache
//separate files for data and loaded png image
function writeDataToFile(user, token, result, currentBook, coverImg) {
  let dir = fm.documentsDirectory();
  let path = fm.joinPath(dir, persistFolder + "/");
  let pathImage = fm.joinPath(dir, persistFolder + "/");
  if (!fm.fileExists(path)) {
    fm.createDirectory(path, false);
  } else if (!fm.fileExists(pathImage)) {
    fm.createDirectory(pathImage, false);
  }
  path += user + "readingProgress" + ".json";
  pathImage += user + "ImageReadingProgress" + ".json";
  fm.writeString(path, JSON.stringify([user, token, result, currentBook]));
  fm.writeImage(pathImage, coverImg);
}

//load data from cache (iCloud folder)
function loadDataFromFile(user) {
  let dir = fm.documentsDirectory();
  var path = fm.joinPath(
    dir,
    persistFolder + "/" + user + "readingProgress" + ".json"
  );
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
    persistFolder + "/" + user + "ImageReadingProgress" + ".json"
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
  if (darkmode === false) {
    widget.backgroundColor = Color.white();
    noBook.textColor = Color.black();
  } else {
    widget.backgroundColor = Color.black();
    noBook.textColor = Color.white();
  }
}

//api call to get bearer token for user
async function getToken(email, password) {
  const api = "https://literal.club/graphql";
  const query = `mutation login(
    $email: String! 
    $password: String!) {
    login(
      email: $email
      password: $password) {
        token
        email
        languages
        profile {
          id
          handle
          name
          image
      }
    }
  }`;

  const body = {
    query: query,
    variables: {
      email: `${email}`,
      password: `${password}`,
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
    const tokenFromFile = loadDataFromFile(user);
    return tokenFromFile[1];
  }
}

//get currently reading
async function getCurrentlyReading(profileId) {
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
    const currentBookFromFile = loadDataFromFile(user);
    return currentBookFromFile[3];
  }
}

//api call
async function getData(profileId, currentBook, token) {
  const api = "https://literal.club/graphql/";
  const query = `query booksByReadingStateAndProfile(
 	   $limit: Int!
  	 $offset: Int!
   	 $readingStatus: ReadingStatus!
   	 $profileId: String!
  	 $bookIds: [String!]! 	   
		) {
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
			readingProgresses(bookIds: $bookIds, active: true){
				bookId
				capacity
				progress
				unit
				completed
			} 
    }`;

  const body = {
    query: query,
    variables: {
      limit: 1,
      offset: 0,
      profileId: `${profileId}`,
      readingStatus: "IS_READING",
      bookIds: `${[currentBook]}`,
    },
  };

  const headers = {
    authorization: "Bearer " + token,
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
    const dataFromFile = loadDataFromFile(user);
    return dataFromFile[2];
  }
}

//set output of this widget
Script.setWidget(widget);
Script.complete();

//preview widget in Scriptable
widget.presentSmall();
