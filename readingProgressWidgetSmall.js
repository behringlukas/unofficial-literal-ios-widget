// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: teal; icon-glyph: magic;

let userMail = "PUT YOUR MAIL ADRESSE INSIDE THESE QUOTATIONS";
let password = "PUT YOUR PASSWORD INSIDE THESE QUOTATIONS";
let user = "PUT YOUR USERHANDLE IN HERE";
const darkmode = false; //change to true for darkmode, false for lightmode

let fm = FileManager.iCloud(); //fileManager to make widget work offline
let persistFolder = "literalWidgetCache"; //foldername to save cached data
let coverUrl = ""; //URL for the cover
let img; //image for placeholder
let userId; //id of user
let token; //token for authentication
let book; //book data
let result; //reading stats
let tokenResult; //user data
let currentBook; //currently reading book
let totalPages; //total pages of currently reading book
let currentPage; //current reading page of currently reading book
let progressPercentage; //progress in percentage
let pagespagesLeftNumber; //amount of pages pagesLeftNumber until finished
const statsBackgroundColorLightmode = new Color("#DBDBDB"); //background color for books stats
const statsBackgroundColorDarkmode = new Color("#404040");
const fontColorDarkmode = new Color("#FFFFFF"); //font color for darkmode
const fontColorLightmode = new Color("#000000"); //font color for lightmode
const backgroundColorDarkmode = new Color("#000000"); //background color for darkmode
const backgroundColorLightmode = new Color("#FFFFFF"); //background color for lightmode

//creating widget
const widget = new ListWidget();

//get bearer token for user from api
try {
  tokenResult = await getToken(userMail, password);
  token = tokenResult.data.login["token"];
  userId = tokenResult.data.login.profile["id"];
} catch (e) {
  token = tokenResult;
}

//mainTop layout for widget
const mainTop = widget.addStack();
const mainBottom = widget.addStack();
const stackCover = mainTop.addStack();
const stackInfo = mainTop.addStack();
const stackProgressPercentage = stackInfo.addStack();
stackInfo.addSpacer(11);
const stackPagesProgressContainer = stackInfo.addStack();
const stackProgressPages = stackPagesProgressContainer.addStack();
const stackProgressPagesLeftLabel = stackPagesProgressContainer.addStack();

//padding of stacks
stackCover.size = new Size(60, 70);
mainTop.setPadding(10, 0, 0, 0);
mainBottom.setPadding(0, 0, 10, 0);
stackInfo.setPadding(1, 1, 1, 1);
stackProgressPercentage.setPadding(5, 0, 5, 0);
stackPagesProgressContainer.setPadding(5, 0, 5, 0);

//background color and border radius of stats stacks
stackProgressPercentage.cornerRadius = 5;
stackPagesProgressContainer.cornerRadius = 5;

//layout direction of stacks
mainBottom.layoutVertically();
stackInfo.layoutVertically();
stackProgressPercentage.layoutHorizontally();
stackPagesProgressContainer.layoutVertically();
stackProgressPages.layoutHorizontally();
stackProgressPagesLeftLabel.layoutHorizontally();

//get data from api and calculate progress percentage and page progress
try {
  book = await getCurrentlyReading(userId);
  currentBook = book.data.booksByReadingStateAndProfile[0]["id"];

  result = await getData(user, currentBook, token);
  totalPages = result.data.readingProgresses[0]["capacity"];
  currentPage = result.data.readingProgresses[0]["progress"];

  progressPercentage = Math.round((currentPage / totalPages) * 100);
  pagespagesLeftNumber = totalPages - currentPage;
} catch (e) {
  result = await getData(user, currentBook, token);
  currentBook = result[0];
  totalPages = result[1];
  currentPage = result[2];

  progressPercentage = Math.round((currentPage / totalPages) * 100);
  pagespagesLeftNumber = totalPages - currentPage;
}

//get coverUrl
try {
  coverUrl = book.data.booksByReadingStateAndProfile[0]["cover"];
} catch (e) {}

//add cover of book if online, cached cover if offline or placeholder if no currently reading book
//add it to widget
try {
  img = await new Request(
    "https://pbs.twimg.com/profile_images/1371430883576717313/LyhsMxnf_400x400.jpg"
  ).loadImage();
  const coverRequest = new Request(coverUrl);
  const coverImg = await coverRequest.loadImage();
  writeDataToFile(user, token, result, book, coverImg);
  stackCover.addImage(coverImg);
} catch (e) {
  if (img !== undefined) {
    writeDataToFile(user, token, result, book, img);
  }
  const coverCache = loadImageFromFile(user);
  stackCover.addImage(coverCache);
}

//if there is no book/no currently or total page amount display 0 and all instead of NaN
if ((totalPages || currentPage) === undefined) {
  progressPercentage = 0;
  pagespagesLeftNumber = "all";
}

//if there are only a few pages pagesLeftNumber display 99% instead of rounding up to 100%
if (progressPercentage === 100 && pagespagesLeftNumber != 0) {
  progressPercentage = 99;
}

//add spacing
stackCover.addSpacer();
stackInfo.addSpacer();
stackProgressPercentage.addSpacer();

//add percentage, pages left number and label to the stacks
const percentageProgress = stackProgressPercentage.addText(
  progressPercentage.toString() + "%"
);
stackProgressPages.addSpacer();
const pagesLeftNumber = stackProgressPages.addText(
  pagespagesLeftNumber.toString()
);
stackProgressPages.addSpacer();
stackProgressPagesLeftLabel.addSpacer();
const pagesLeftLabel = stackProgressPagesLeftLabel.addText("pages left");

//add spacing
stackProgressPagesLeftLabel.addSpacer();
stackProgressPercentage.addSpacer();

//center align cover and pages left number
percentageProgress.centerAlignText();
pagesLeftNumber.centerAlignText();

//set color of text and stacks
if (darkmode === false) {
  stackProgressPercentage.backgroundColor = statsBackgroundColorLightmode;
  stackPagesProgressContainer.backgroundColor = statsBackgroundColorLightmode;
  percentageProgress.textColor = fontColorLightmode;
  pagesLeftNumber.textColor = fontColorLightmode;
  pagesLeftLabel.textColor = fontColorLightmode;
} else {
  stackProgressPercentage.backgroundColor = statsBackgroundColorDarkmode;
  stackPagesProgressContainer.backgroundColor = statsBackgroundColorDarkmode;
  percentageProgress.textColor = fontColorDarkmode;
  pagesLeftNumber.textColor = fontColorDarkmode;
  pagesLeftLabel.textColor = fontColorDarkmode;
}

//font size and weight
percentageProgress.font = Font.boldSystemFont(13);
pagesLeftNumber.font = Font.boldSystemFont(12);
pagesLeftLabel.font = Font.systemFont(8);

//add title and author to stack
//if no currently reading book, then display message
try {
  const title = mainBottom.addText(
    book.data.booksByReadingStateAndProfile[0]["title"]
  );

  const author = mainBottom.addText(
    book.data.booksByReadingStateAndProfile[0].authors[0]["name"]
  );

  title.font = Font.boldSystemFont(12);
  author.font = Font.systemFont(11);

  //set background and text styles
  if (darkmode === false) {
    widget.backgroundColor = backgroundColorLightmode;
    title.textColor = fontColorLightmode;
    author.textColor = fontColorLightmode;
  } else {
    widget.backgroundColor = backgroundColorDarkmode;
    title.textColor = fontColorDarkmode;
    author.textColor = fontColorDarkmode;
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
  let path = fm.joinPath(
    dir,
    persistFolder + "/" + user + "readingProgress" + ".json"
  );
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
    persistFolder + "/" + user + "ImageReadingProgress" + ".json"
  );
  if (!fm.fileExists(pathImage)) {
    console.log("No file found");
  } else {
    let image = fm.readImage(pathImage);
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
