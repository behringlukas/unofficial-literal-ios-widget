// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: teal; icon-glyph: magic;

let fm = FileManager.iCloud(); //fileManager to make widget work offline
let persistFolder = "literalWidgetCache"; //foldername to save cached data
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

writeDataToFile(user, token, result, book);

try {
  const title = book.data.booksByReadingStateAndProfile[0]["title"];
  if ((totalPages || currentPage) === undefined) {
    progressPercentage = 0;
    pagesLeft = "all";
  }
  if (progressPercentage === 100 && pagesLeft != 0) {
    progressPercentage = 99;
  }
  const coverPlaceholder = widget.addText(progressPercentage.toString() + "%");
  widget.addSpacer(10);
  const left = widget.addText(pagesLeft.toString());
  const left2 = widget.addText("pages left");
  coverPlaceholder.font = Font.boldSystemFont(12);
  left.font = Font.boldSystemFont(12);
  left2.font = Font.boldSystemFont(6);
  coverPlaceholder.centerAlignText();
  left.centerAlignText();
  left2.centerAlignText();
} catch (e) {
  showMessage();
}

//write last retrieved data (also placeholder image) into iCloud file as cache
//separate files for data and loaded png image
function writeDataToFile(user, token, result, currentBook) {
  let dir = fm.documentsDirectory();
  let path = fm.joinPath(dir, persistFolder + "/");
  if (!fm.fileExists(path)) {
    fm.createDirectory(path, false);
  }
  path += user + "readingProgressLockscreen" + ".json";
  fm.writeString(path, JSON.stringify([user, token, result, currentBook]));
}

//load data from cache (iCloud folder)
function loadDataFromFile(user) {
  let dir = fm.documentsDirectory();
  var path = fm.joinPath(
    dir,
    persistFolder + "/" + user + "readingProgressLockscreen" + ".json"
  );
  if (!fm.fileExists(path)) {
    console.log("No file found1");
  } else {
    var jsonString = fm.readString(path);
    return JSON.parse(jsonString);
  }
}

//show message if there is no currently reading book
function showMessage() {
  const noBook = widget.addText("Read a book!");
  noBook.font = Font.systemFont(10);
  widget.addSpacer();
  noBook.centerAlignText();
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
widget.presentAccessoryCircular();
