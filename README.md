# Unofficial iOS widgets for Literal.club with Scriptable

**_Please be aware that I'm new to coding and some functions probably could have been implemented cleaner and easier. Feel free to reach out to me, make your own versions (would love if you credit me then) or contribute to this._**

Possible improvements:

- [ ] allow the user to select which book is displayed in the Currently Reading (S) widget.
- [ ] change M widget from static to dynamic. So less than three books can be displayed too.
- [ ] create new widget which displays the amount of pages read in a year so far.

## Table of Contents

- [Table of Contents](#table-of-contents)
- [A. How to get the widgets](#a-how-to-get-the-widgets)
- [B. List of widgets](#b-list-of-widgets)
  - [Ba. Homescreen widgets](#ba-homescreen-widgets)
  - [Bb. Lockscreen widgets](#bb-lockscreen-widgets)
- [C. How to configure and add to homescreen](#c-how-to-configure-and-add-to-homescreen)
  - [Ca. Homescreen widgets](#ca-homescreen-widgets)
  - [Cb. Lockscreen widgets](#cb-lockscreen-widgets)
- [D. Limits and behaviour of the widgets](#d-limits-and-behaviour-of-the-widgets)
- [E. Personal note](#e-personal-note)

---

## A. How to get the widgets

1. Take a look at the [List of widgets](#b-list-of-widgets).
2. Download the [Scriptable app](https://apps.apple.com/no/app/scriptable/id1405459188).
3. Start the app and click on the small add-button in the top right corner.
4. Change the text on the top middle to one of the widgets you wish to use.
5. Click on the ".js"-file for the chosen widget and copy the complete code.
6. Paste the code into the editor in Scriptable that you just created and renamed.
7. Take a look at [How to configure and add to homesceen](#c-how-to-configure-and-add-to-homescreen).
8. Repeat for every widget you want to add. <br>

Please also check the [Limits and behaviour of the widgets](#d-limits-and-behaviour-of-the-widgets), since they can act differently.

## B. List of widgets

- All widgets display the latest data offline, through caching the last state in an iCloud folder. <br>
- Literal doesn't provide a cover for every book, so some books are displayed with an placeholder (Literal logo). <br>

### Ba. Homescreen widgets

- [Currently reading (Size: S)](currentlyReadingWidgetSmall.js)<br>

  > Displays the latest book that was marked as "Reading" in Literal. <br>

- [Currently reading (Size: M)](currentlyReadingWidgetMedium.js)

  > Displays the latest three book that were marked as "Reading" in Literal. <br>

  > If there are less than three books you're reading, this widget will not show any books.

- [Currently reading with page progress (Size: S)](readingProgressWidgetSmall.js)

  > Displays the latest book that was marked as "Reading" in Literal. Additionally the current page progress in percentage and pages left to read are displayed.<br>

### Bb. Lockscreen widgets

- [Page progress of currently reading book (Size: S)](readingProgressLockscreenWidgetSmall.js)

  > Displays the current page progress in percentage and pages left to read of the latest book that was marked as "Reading" in Literal on the lockscreen.<br>

## C. How to configure and add to homescreen

### Ca. Homescreen widgets

For [Currently reading (Size: S)](currentlyReadingWidgetSmall.js) and - [Currently reading (Size: M)](currentlyReadingWidgetMedium.js):

1.  Go to the homescreen and long press on a free space there. A small add-button will appear in the top left corner.
2.  Click the add-button. A selection of widgets will appear. Search for the option "Scriptable" and click on it. Now you have the option to choose between a small and medium sized widget. Select one of the sizes, based on which widget you chose (S or M).
3.  The widget will appear on the homescreen. Click on the widget to edit the configurations of the widget:

> - Script: Select the previously created script with the pasted in code.
> - When Interacting: Select "Open URL"
> - URL: https://literal.club
> - Parameter: username,light
>   <br>

4. For the Parameter you can use your or any other users Literal username. Instead of light (lightmode) you can use dark (darkmode). <br>Please make sure that there is no space between the two parameters and comma! If you don't add any parameters, the user piet (CEO of Literal) and dark are used by default.
5. This is it! You can change the parameters anytime you want with long pressing the widget and selecting "Edit Widget". You add the same widget/script multiple times and just use different parameters without creating a new script in Scriptable.
   <br>

---

For [Currently reading with page progress (Size: S)](readingProgressWidgetSmall.js):

1. Open the script you just created and pasted the code in. On top of the code you'll see the parameters: userMail, password, user and darkmode.
   > - userMail: Add your mail address you are using for Literal.
   > - password: Add your Literal password. (Please be aware that everyone with access to your phone can see your password unprotect when opening the script! Use this widget on your own risk!)
   > - user: Add your username from Literal
   > - darkmode: Change to false for lightmode and true for darkmode
2. Go to the homescreen and long press on a free space there. A small add-button will appear in the top left corner.
3. Click the add-button. A selection of widgets will appear. Search for the option "Scriptable" and click on it. Now you have the option to choose between a small and medium sized widget. Select the small size.
4. The widget will appear on the homescreen. Click on the widget to edit the configurations of the widget:

   > - Script: Select the previously created script with the pasted in code.
   > - When Interacting: Select "Open URL"
   > - URL: https://literal.club

5. This is it! If you want to use the widget multiple times with different content you need to create a new script in Scriptable and change the parameters there.
   <br> 

---

### Cb. Lockscreen widgets

For [Page progress of currently reading book (Size: S)](readingProgressLockscreenWidgetSmall.js):

1. Open the script you just created and pasted the code in. On top of the code you'll see the parameters: userMail, password and user.

   > - userMail: Add your mail address you are using for Literal.
   > - password: Add your Literal password. (Please be aware that everyone with access to your phone can see your password unprotect when opening the script! Use this widget on your own risk!)
   > - user: Add your username from Literal

2. Go to the lockscreen and long press on a free space to customise it.
3. Click on one of the widgets. A selection of widgets will appear. Search for the option "Scriptable" and click on it. Now you have the option to choose between a circular and rectangle sized widget. Select the circular size.
4. Click on the newly created widget to edit the configurations of the widget:

   > - Script: Select the previously created script with the pasted in code.
   > - When Interacting: Select "Open URL"
   > - URL: https://literal.club <br>

## D. Limits and behaviour of the widgets

- At the moment it is only possible to see the latest book that was marked as "Reading".
- The medium sized widget for currently reading displays the latest three books that were marked as "Reading". If you're only reading two books, you're unlucky since this can't be displayed in a widget atm.
- Some books don't have a cover. In this case, Literal seems to generate their own cover, which is not retrievable through the API. For this case I display a placeholder, which is the Literal logo. To use it in the widget it has to be a png. All the icons on Literal are svgs. Since I didn't feel comfortable with uploading an icon that I don't own to any hosting page, to get via an request, I currently retrieve the profile image from Literal's twitter page.
- To get the reading progress of a book/user, a password has to be added to the script. This can be an security risk and should be considered carefully by anyone. (The widgets without the reading progress can be used without any security concerns),
- If a user is not reading anything, the placeholder (Literal logo) and a message are displayed.
- The refresh rate of the widget is determined by the operating system. So a refresh rate between 6-12 minutes can be normal.
- Since the widget is trying to get the data from the API every refresh, caching was needed for every widget. Otherwise an error would've been displayed in the widget. This means json files are saved for every widget + username (since you can have the same widget for different usernames) in the Scriptable folder under "literalWidgetCache".

## E. Personal note

_Why did I create this project?_

- I just love books and love using Literal and how the team develops it.
- I'm currently trying to learn more about coding and development in general. For this I usually need a good reason/use-case to stay motivated, which this project provided me.
- I love using widgets and like how they were integrated into iOS.

_Feel free to connect with me_

- [bento.me/behringlukas](https://bento.me/behringlukas)
- [twitter.com/behringlukas](https://twitter.com/behringlukas)
