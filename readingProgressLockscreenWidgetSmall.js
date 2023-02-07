// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: teal; icon-glyph: magic;

let userMail = "PUT YOUR MAIL ADRESSE INSIDE THESE QUOTATIONS";
let password = "PUT YOUR PASSWORD INSIDE THESE QUOTATIONS";
let user = "PUT YOUR USERHANDLE IN HERE";

let fm = FileManager.iCloud(); //fileManager to make widget work offline
let persistFolder = "literalWidgetCache"; //foldername to save cached data
let userId; //id of user
let token; //token for authentication
let book; //book data
let result; //reading stats
let tokenResult; //user data
let currentBook; //currently reading book
let totalPages; //total pages of currently reading book
let currentPage; //current reading page of currently reading book
let progressPercentage; //progress in percentage
let pagesLeft; //amount of pages left until finished
const fontColor = new Color("#FFFFFF"); //font color
const backgroundColor = new Color("#000000"); //background color

//creating widget
const widget = new ListWidget();
const stack = widget.addStack();
stack.size = new Size(60, 60);
stack.setPadding(0, 18, 0, 12);
stack.layoutVertically();
stack.backgroundColor = backgroundColor;

//get bearer token for user from api
try {
  tokenResult = await getToken(userMail, password);
  token = tokenResult.data.login["token"];
  userId = tokenResult.data.login.profile["id"];
} catch (e) {
  token = tokenResult;
}

//get data from api and calculate progress percentage and page progress
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

//caching the book data and reading stats
writeDataToFile(user, token, result, book);

//if there is no book/no currently or total page amount display 0 and all instead of NaN
try {
  const title = book.data.booksByReadingStateAndProfile[0]["title"];
  if ((totalPages || currentPage) === undefined) {
    progressPercentage = 0;
    pagesLeft = "all";
  }

  //if there are only a few pages pagesLeftNumber display 99% instead of rounding up to 100%
  if (progressPercentage === 100 && pagesLeft != 0) {
    progressPercentage = 99;
  }

  //add percentage, pages left number and label to the stack
  const percentageProgress = stack.addText(progressPercentage.toString() + "%");
  stack.addSpacer(5);
  const pagesLeftNumber = stack.addText(pagesLeft.toString());
  const pagesLeftLabel = stack.addText("pages left");

  //set font size, color and alignment
  percentageProgress.font = Font.boldSystemFont(10);
  pagesLeftNumber.font = Font.boldSystemFont(10);
  pagesLeftLabel.font = Font.boldSystemFont(5);
  percentageProgress.centerAlignText();
  pagesLeftNumber.centerAlignText();
  pagesLeftLabel.centerAlignText();
  percentageProgress.textColor = fontColor;
  pagesLeftNumber.textColor = fontColor;
  pagesLeftLabel.textColor = fontColor;
} catch (e) {
  showMessage();
}

//write last retrieved data into iCloud file as cache
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
  const noBook = stack.addText("Read a book!");
  noBook.font = Font.systemFont(10);
  stack.addSpacer();
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
