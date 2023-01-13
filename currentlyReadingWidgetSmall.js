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

//get data(title,author,cover) from api
const userInformation = await userData(params[0]);
const result = await getData(userInformation);
const coverUrl = result.data.booksByReadingStateAndProfile[0]["cover"];
const coverRequest = new Request(coverUrl);
console.log(result);

//get literal logo as placeholder in case a book has no cover
const img = await new Request(
  "https://pbs.twimg.com/profile_images/1371430883576717313/LyhsMxnf_400x400.jpg"
).loadImage();

//add cover or placeholder to widget
if (coverUrl !== "") {
  const coverImg = await coverRequest.loadImage();
  const cover = widget.addImage(coverImg);
  cover.centerAlignImage();
  widget.addSpacer();
} else {
  const coverPlaceholder = widget.addImage(img);
  coverPlaceholder.centerAlignImage();
  widget.addSpacer();
}

//add title and author to widget
const title = widget.addText(
  result.data.booksByReadingStateAndProfile[0]["title"]
);
title.centerAlignText();
const author = widget.addText(
  result.data.booksByReadingStateAndProfile[0].authors[0]["name"]
);
author.centerAlignText();

//set font weight
title.font = Font.boldSystemFont(12);
author.font = Font.systemFont(11);

//set darkmode/lightmode based on user parameter input
if (params[1] === "dark") {
  widget.backgroundColor = Color.black();
  title.textColor = Color.white();
  author.textColor = Color.white();
} else {
  widget.backgroundColor = Color.white();
  title.textColor = Color.black();
  author.textColor = Color.black();
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

  const req = new Request(api);
  req.headers = headers;
  req.body = JSON.stringify(body);
  req.method = "post";
  const result = await req.loadJSON();
  const profileId = await result.data.profile["id"];
  return profileId;
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

  const req = new Request(api);
  req.headers = headers;
  req.body = JSON.stringify(body);
  req.method = "post";
  const result = await req.loadJSON();
  console.log(result);
  return result;
}

//set output of this widget
Script.setWidget(widget);
Script.complete();

//preview widget in Scriptable (only for testing purposes)
widget.presentSmall();
