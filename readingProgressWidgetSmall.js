// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: teal; icon-glyph: magic;
//creating widget
const widget = new ListWidget();
const darkmode = false;

//user credentials
let userMail = "PUT YOUR MAIL ADRESSE INSIDE THESE QUOTATIONS";
let password = "PUT YOUR PASSWORD INSIDE THESE QUOTATIONS";

//get bearer token for user from api
const tokenResult = await getToken(userMail, password);
const token = tokenResult.data.login["token"];
const userId = tokenResult.data.login.profile["id"];

//get data from api
const book = await getCurrentlyReading(userId);
const currentBook = book.data.booksByReadingStateAndProfile[0]["id"];
const result = await getData(userId, currentBook, token);
console.log(result);
const coverUrl = result.data.booksByReadingStateAndProfile[0]["cover"];
const coverRequest = new Request(coverUrl);
const totalPages = result.data.readingProgresses[0]["capacity"];
const currentPage = result.data.readingProgresses[0]["progress"]; //
const progressPercentage = Math.round((currentPage / totalPages) * 100);
const pagesLeft = totalPages - currentPage;

const main = widget.addStack();
const st1 = main.addStack();
const st2 = main.addStack();

//add content and set layout
if (coverUrl !== "") {
  const coverImg = await coverRequest.loadImage();
  const cover = st1.addImage(coverImg);
  cover.centerAlignImage();
  const coverPlaceholder = st2.addText(pagesLeft.toString() + " pages left");
  coverPlaceholder.textColor = Color.black();
  widget.addSpacer();
} else {
  const coverPlaceholder = st1.addText(pagesLeft.toString() + " pages left");
  coverPlaceholder.textColor = Color.black();
  widget.addSpacer();
}
const title = widget.addText(
  result.data.booksByReadingStateAndProfile[0]["title"]
);
title.centerAlignText();
0;
const author = widget.addText(
  result.data.booksByReadingStateAndProfile[0].authors[0]["name"]
);
author.centerAlignText();

//set background and text styles
widget.backgroundColor = Color.white();
title.font = Font.boldSystemFont(15);
title.textColor = Color.black();
author.font = Font.systemFont(11);
author.textColor = Color.black();

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
    console.log("Ohje");
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
  } catch (e) {}
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
  const req = new Request(api);
  req.headers = headers;
  req.body = JSON.stringify(body);
  req.method = "post";
  const result = await req.loadJSON();
  return result;
}

//set output of this widget
Script.setWidget(widget);
Script.complete();

//preview widget in Scriptable
widget.presentSmall();
