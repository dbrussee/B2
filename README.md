# B Library

Current Version: 2.0<br>
Author: Dan Brussee<br>
Last Updated: 8/10/2018<br>

#### General Description
The **B** Library was created to collect a growing list of small utilities as well as some larger functionality into a collection of easier-to-implement code. By putting most of the code into a common domain, this lessens the likelihood of trampling on other code. In addition, it should help keep the code features seperated from each other to make maintenance less of a chore.

**Important**: The B library makes use of the [jQuery](http://jquery.org) library as well, so most of the features will not work without that library being loaded.

### Features
1. Dialog Boxes
    + [`say()`](##say) - Replaces the Javascript alert() box.
    + [`ask()`](##ask) - Replaces the Javascript confirm() box.
    + [`askValue()`](##askValue) - Replaces the Javascript prompt() box.
    + [`choose()`](##choose) - More flexible Javascript confirm() replacement.
    + [`openDialog()`](##say) - Generic modal dialogs
2. Formatting
    + [`format.COLOR`](##B.format.COLOR) - Adding standard colors to HTML text
    + [`format.`*general*](##B.format.) - General formatting of values for display or storage.
3. [Validation](##Validation)
4. [Cookies, Local storage](##Cookies)
5. [Forms](##Forms)



# Dialogs

**Note:** All dialogs are "modal" unless otherwise indicated. "Modal" in this situation means that the dialog will block access for the user to any content in the window other than the dialog itself, so the user must interact with the dialog by closing it before they can interact with any other content. Other javascript code may still make changes to the content that exists "below" the dialog while it is displayed.


## `say`
The B library `say` method is NOT defined inside the B library domain. This was done because it was meant to be used frequently, so it made sense to make the actual method simple to implement.

General Syntax:<br>
`say(msg, [title], [callback], [height], [width])`

This will generate a "modal" dialog with the message supplied and the other parameters applied. There will be an "Information" icon at the upper left and the message will wrap around that image. A single button will be provided that - when clicked, will close the dialog. 

*All but the first parameter are optional. However, if you wish to supply values skipping others, you would pass `null` as the parameters you do not want to supply values for.*

`title` - If not supplied, or supplied as null or empty string (""), the value "System Message" will be used as the title. Note: This can be set on a page-by-page defaults using `B.settings.say.defaultTitle = 'My title message'`,

`callback` - If provided, once the user clicks on the Ok button, that method will be called with no parameters.

`height` and `width` - If provided, these will overwrite the default values of 300px and 200px respectively.


Examples:
```javascript
say('Howdy');
say('Howdy', 'Message from Woody');
say('Howdy', 'Click Ok to see what Buzz says all the time.', function() {
    say('To infinity... and beyond!');
});

```

Variations:

`sayPlain(...)` - No icon is included in the body of the dialog.

`sayWarn(...)` - A warning icon is included in the body of the dialog.

`sayError(...)` - An error icon is included in the body of the dialog.

`sayFix(fixlist, [msg], [title], [height], [width])`

The `sayFix()` variation is a bit different. In place of the normal "information" icon, a "gear" icon is displayed.

`fixlist` - This parameter should be provided as a string with 'newline' `\n` characters separating the messages. These will be translated to an unordered list and presented to the user to explain what may need fixing on a form, etc. If a newline character exists as the first character, it will NOT create an empty list item. 

`msg` - By default, the text "Correct the following items and try again:" is displayed before the unordered list of items. If you supply this parameter, it will replace that text with this message.

`title`, `height`, `width` all work the same as the other `say` versions.

Notice that there is no `callback` parameter. No callback is allowed.

Example:
```javascript
var msg = "";
if (fname == "") msg += "\nFirst name is required";
if (lname == "") msg += "\nLast name is required");
if (msg != "") {
    sayFix(msg);
}
```

---

## `ask`
The B library `ask` method is NOT defined inside the B library domain. This was done because it was meant to be used frequently, so it made sense to make the actual method simple to implement.

General Syntax:<br>
`ask(msg, [title], [callback], [height], [width])`

This will generate a "modal" dialog with the message supplied and the other parameters applied. There will be an "Information" icon at the upper left and the message will wrap around that image. Two buttons will be provided marked "Yes" and "No". 

The same parameters are available as with `say`, but since the main purpose of `ask` is to respond to a user's choice, the callback is typically supplied. In this case, the callback is provided with a parameter to indicate which button the user clicked.

`callback` - If provided, once the user clicks on either the "Yes" or "No" button, that method will be called with a single parameter. The value of the parameter will be either "YES" (uppercase) or "NO" (uppercase) depending on which button was clicked.

Variations:

`askPlain(...)` - No icon is included in the body of the dialog.

`askWarn(...)` - A warning icon is included in the body of the dialog.

`askError(...)` - An error icon is included in the body of the dialog.

`askC(...)` - Same as `ask()` but adds a "Cancel" button. A third possible response will be avaialable in the callback with the value "CANCEL".

`askCPlain(...)` - Same as `askPlain()` but adds a "Cancel" button. A third possible response will be avaialable in the callback with the value "CANCEL".

`askCWarn(...)` - Same as `askWarn()` but adds a "Cancel" button. A third possible response will be avaialable in the callback with the value "CANCEL".

`askCError(...)` - Same as `askError()` but adds a "Cancel" button. A third possible response will be avaialable in the callback with the value "CANCEL".


Example:
```javascript
ask("Do you agree to the license agreement?", "License",
    function(response) {
        if (response == "YES") {
            say("Cool... let's go!");
        } else {
            say("Sorry, maybe later.");
        }
    }
)
```

---

## `askValue`
The B library `askValue` method is NOT defined inside the B library domain. This was done because it was meant to be used frequently, so it made sense to make the actual method simple to implement.

General Syntax:<br>
`askValue(msg, prompt, [value], [title], [callback], [height], [width])`

This will generate a "modal" dialog with the message supplied and the other parameters applied. There will be an "Information" icon at the upper left and the message will wrap around that image. Two buttons will be provided marked "Ok" and "Cancel". 

`msg` - The message will display above the prompt for a value.

`prompt` - This value will display to the left of a textbox. It will display in a bold format with a space between the prompt and the textbox.

`value` - This value (if provided) will be the default value in the textbox when the dialog is displayed. If the user does not change it, this will be the value used in the callback.

`callback` - The callback will be executed when the user clicks on either the Ok button or the Cancel button. If the Ok button is clicked, the parameter to the callback will be the value in the textbox. If the Cancel button is clicked, the parameter to the callback will be `null`.

Variations:

`askValuePlain(...)` - No icon is included in the body of the dialog.

`askValueWarn(...)` - A warning icon is included in the body of the dialog.

`askValueError(...)` - An error icon is included in the body of the dialog.


Example:
```javascript
var msg = "We need to know how old you are for legal reasons.";
askValue(msg, "Birthdate:", "1/1/1980", "Legalese",
    function(response) {
        if (response == null) {
            sayError("Sorry. You must answer this.");
        } else {
            var age = calculateAge(response);
            say("Thanks. It looks like you are " + age + " years old.");
        }
    }
)
```

---

## `choose`
The B library `choose` method is NOT defined inside the B library domain. This was done because it was meant to be used frequently, so it made sense to make the actual method simple to implement.

General Syntax:<br>
`choose(msg, title, options, [callback], [height], [width])`

This will generate a "modal" dialog with the message supplied and the other parameters applied. There will be an "Information" icon at the upper left and the message will wrap around that image. 

The main difference between `say` and `choose` is that a list of buttons will be available with defined text on each. The callback will be invoked with the number of the button clicked as the parameter. The number returned starts with 1 for the first option, 2 for the second, etc.

`title` - This value is required, but may be supplied as either `null` or an empty string to use the default title.

`options` - This required parameter is a comma-seperated list of text values. Each value will be the text on a button.

All other parameters are the same as for the `say` method.

Variations:

`choosePlain(...)` - No icon is included in the body of the dialog.

`chooseWarn(...)` - A warning icon is included in the body of the dialog.

`chooseError(...)` - An error icon is included in the body of the dialog.


Example:
```javascript
var msg = "We need to know your gender for legal reasons.";
askValue(msg, "Legalese 2", "Male,Female,Not Answered"
    function(response) {
        if (response == 1) {
            say("Very well, sir... let's continue.");
        } else if (response == 2) {
            say("Thank you, maam... let's continue.");
        } else {
            say("Ok, let's continue.");
        }
    }
)
```

## `openDialog`
The B library `openDialog` method is NOT defined inside the B library domain. This was done because it was meant to be used frequently, so it made sense to make the actual method simple to implement.

General Syntax:<br>
`openDialog(id)`

This will generate a "modal" dialog using either a form or div that has been defined with the class '`BDialog`'. The contents and characteristics of the dialog are fully contained in the form or div. Dialog buttons will be created for any button contained within the form or div with a class '`BDialogButton`'

Any div or form tag with class `BDialog` will be hidden until the `openDialog` is called with it's id. When `openDialog` is called, it will create a jQuery dialog modal dialog with the size characteristics provided, using the title and will add buttons that are defined with the `BDialogButton` class references.

Dialog windows opened with `openDialog` are displayed in a stack. Each dialog opened before a previous one is closed will appear to overlay the prior ones. 

Example:
```javascript
openDialog("A");
openDialog("B");
openDialog("C");
```
In this example, you would have 3 dialogs stacked on top of each other with A being on the bottom, B on top of that and C at the very top and able to be interacted with.

Your code is responsible for closing a dialog opened with `openDialog`. You can close a dialog in either of 2 ways:

* `closeDialog(id)` - This will close the dialog that was opened with that id value. This will remove the dialog from the screen and from the stack, so dialogs that were "above" the one just removed will still appear "above" the ones that were "below" the one removed. In the example above, if you used `closeDialog("B");`, you would end up with 2 dialogs in the stack with A at the bottom and C on top. B would be completely removed from the stack and from the screen.
* `popDialog()` - This will remove the top-most dialog in the stack. Since it is most common to close a dialog when finished with it, this method is commonly used to close dialogs - especially when attached to the click event of a button in the dialog itself.

The general purpose `say`, `ask`, and `choose` dialogs are implemented in the same mannor as `openDialog` but cannot be stacked. Only one of them can be displayed at a time. Also, closing of those are handled automatically.

Example:
```javascript
openDialog("dlgTest");
```

```html
<div class='BDialog' 
    id='dlgTest' 
    style='height:300px; width:480px;' 
    title='Test Dialog'>

    <p>So this is a general purpose dialog.</p>
    <img src='lookatme.jpg'>

    <button class='BDialogButton' onclick='popDialog()'>Close me</button>
</div>
```

## Freeze / Thaw

It is common while doing asynchronous operations that you wish to block the user from interacting with the screen contents. While you cannot stop them from leaving the actual browser page (back button, etc) or even closing the browser, it is common to put up a "please wait" type message until the asynchronous operation is complete. The `freeze` method and it's companion `thaw` handle this.

`freeze(text, title)`<br>
This method displays a modal dialog with no way for the user to close it. No buttons are displayed. While the user can move the dialog around on the screen, there is no way for them to get access to any of the content.

The normal icon presented in a `say()` dialog (or other similar dialogs) is replaced with a "spinner" animated icon. In addition, a timer shows how many seconds have elapsed since the freeze started.

`updateFreezeText(msg)` - Updates the freeze dialog with new text without closing and re-opening the dialog.

`thaw()` - This closes the freeze dialog.

## Handling simultaneous freeze calls ##

While not common, it is possible that you want to have 2 parallel asynchronous operations both freezing the screen. When either one completes, the screen should remain frozen till the other one completes, but you are not sure which will complete first. The freeze and thaw methods can handle that for you.

Freeze dialogs can have multiple levels. Instead of stacking freeze dialogs, the message showing in the one freeze dialog is updated with the 2nd message. Additional text is displayed stating how many "other" processes are running. In this manner, the "last freeze" message is applied on the screen, but when thaws are applied, they can be unstacked as needed. In order to allow for this, you as a coder must know this will happen and track what is going on.

When a freeze method is called, it will always return a level value code. If you wish to control the order of thaw, keep that value. Then when the reason for that freeze is done, pass that value as a parameter to the thaw method.

Example 1:
```javascript
var layer1 = freeze("Start the first process");
var layer2 = freeze("Start the second process");
// At this time, the text for the 2nd process displays along with an indicator that another process is running too.
// Let us assume that process 1 finishes before process 2.
thaw(layer1);
// At this time, the text for the 2nd process still displays, but the indicator for the other process disappears.
thaw(layer2);
// Since this was the last freeze remaining, the freeze dialog disappears from the screen.
```
Example 2:
```javascript
var layer1 = freeze("Start the first process");
var layer2 = freeze("Start the second process");
// At this time, the text for the 2nd process displays along with an indicator that another process is running too.
// This time, let us assume that process 2 finishes before process 1.
thaw(layer2);
// At this time, the text for the 1st process displays. In addition, the indicator for the other process also disappears
thaw(layer1);
// Since this was the last freeze remaining, the freeze dialog disappears from the screen.
```

## TBD: B.freezeThings();
## TBD: B.thawThings();

---


# Formatting

In general there is a B library feature that starts with `B.format.`. After that, additional items will allow different types and levels of formatting.

## `B.format.COLOR`

In general, any HTML can be colored by surrounding the value in a span with colors applied to it. This code allows you to do this is a rather simple way.

`B.format.COLOR(text, color, [bgcolor])`

`text` - While typically this is just some simple text, it could be any HTML content that would surrounded by the span.

`color` - The main color of the text. This could be any value that could be used in a `style='color:value'` type statement.

`bgcolor` - If provided, a background color for the text. 

Variations:<br>
`B.format.RED(text, [bgcolor]);`<br>
`B.format.GREEN(text, [bgcolor]);`<br>
`B.format.YELLOW(text, [bgcolor]);`<br>
`B.format.BROWN(text, [bgcolor]);`<br>
`B.format.BLUE(text, [bgcolor]);`<br>
`B.format.BLACK(text, [bgcolor]);`<br>

Example:
```javascript
B.format.COLOR("Sample", "pink", "lightcyan");
B.format.RED("Sample");
B.format.YELLOW("Sample", "red");
```

## `B.format.`

`B.format.DECIMALPLACES(amount, places)`<br>
Takes an amount and rounds the value to the number of decimal places and then formats it in that style. This will also add commas where appropriate - For example (1234567,2) would result in 1,234,567.00.

`B.format.DOLLARS(amount, places)`<br>
Basically the same as DECIMALPLACES, but includes a dollar sign in front. The default number of places is 0. Example: (12345.929,2) would result in $12,345.93.

`B.format.LEFTPAD(val, chr, places)`<br>
Adds chr to the left of val until the length is places. If val is already = or > than places, this has no effect.

`B.format.LEFTZEROPAD(val, places)`<br>
Special case of LEFTPAD forcing use of '0' as the padding character.

`B.format.TRIM(val)`<br>
Just trims the value

`B.format.UTRIM(val)`<br>
`B.format.UPTRIM(val)`<br>
Trims, then converts to uppercase. These are just synonyms of each other. They both work the exact same way and use the same code to do it.

`B.format.SECONDSTILL(tilltime)`<br>
Calculates the difference in time between 'now' and tilltime. Displays the result in m:ss format. Seconds will always be 2 digits and the minutes may be more than 59. For example if it is exactly 2 hours before tilltime, it would return 120:00.

`B.format.ELAPSE(timeA, timeB)`<br>
Shows the time between timeA and timeB in 'days h:mm:ss' format.

`B.format.TEMPLATE(text, matchsets...)`<br>
This will replace values in the text parameter identified with double braces with key/value pairs from the matchsets. Multiple match sets can be provided. Not all values in the matchsets must be used, but they will all be tested to see if they appear in the text, so performance may be affected by long matchsets. If a double-brace values appears in text but has no matchset key... it will remain in the result text.

Example:
```javascript
var initial = "Hello, my name is {{NAME}}. I am {{AGE}} years old.";
var set1 = { FNAME:'Dan', LNAME:'Brussee', NAME:'Dan Brussee' };
var set2 = { ID:12345, AGE:54 }
var result = B.format.TEMPLATE(initial, set1, set2);

// "Hello, my name is Dan Brussee. I am 54 years old."
```

### Date formatting

A general purpose method is provided to take a date and find all relevant parts of it to be used in other calucations and formatting needs.

`B.getDateParts(date)`<br>
This function will return a collection of date information:
```javascript
var stuff = B.getDateParts(new Date());
// Assuming the date is 8/9/2017 at 3:09:28am, stuff looks like:
{
    M: 8, MM; '08', MMM: 'Aug', MMMM: 'August',
    D: 9, DD: '09', DOW: 4, DDDD: 'Thursday', DDD: 'Thu',
    YYYY: 2017,
    H: 3, HH: '03',
    ap: "a", AP: "A",
    NN: '09'
    SS: '28',
    sss: '523' // Milliseconds (always < 1000)
}
```
|`B.format.xxx(d)`  | Result                   |
| ----------------  | ------------------------ |
|`HHNNSS`           | 03:09:28                 |
|`HHNNSSsss`        | 03:09:28.523             |
|`HNNSS`            | 3:09:28a                 |
|`HNNSSsss`         | 3:09:28.523a             |
|`HHNN`             | 03:09                    |
|`HNN`              | 3:09a                    |
|`YYYYMMDD`         | 20170809                 |
|`MMDDYYYY`         | 08/09/2017               |
|`MDYYYY`, `DATE`   | 8/9/2017                 |
|`MYYYY`            | 8/2017                   |
|`MMYYYY`           | 08/2017                  |
|`MMDDYYYYHHNNSS`   | 08/09/2017 03:09:28      |
|`MDYYYYHHNNSS`     | 8/9/2017 03:09:28        |
|`MDYYYYHNNSS`, `TS`| 8/9/2017 3:09:28a        |
|`MDYYYYHNN`        | 8/9/2017 3:09a           |
|`MDYYYYHNNSSsss`   | 8/9/2017 3:09:28.523a    |
|`MMDDYYYYHHNN`     | 08/09/2017 03:09         |
|`MDYYYYHHNN`       | 8/9/2017 03:09           |

### Miscellaneous String Manipulations

`B.keepChars(text, charsToKeep, andSpaces)`<br>
Returns text with all characters that are NOT in the charsToKeep parameter removed. If `andSpaces` is left off, spaces are NOT included unless included in the charsToKeep parameter. There are a few special case values for charsToKeep:

Example:
```javascript
B.keepChars('Sample 12345.6', '2lepm'); // 'mple2' Space removed too!
B.keepChars('Sample 12345.6', '#'); // '12345.6' (or "." as 2nd parameter)
B.keepChars('Sample 12345.6', 'A'); // 'S'
B.keepChars('Sample 12345.6', 'a'); // 'ample'
B.keepChars('Sample 12345.6', 'Aa'); // 'Sample'
B.keepChars('Sample 12345.6', '#', true); // ' 12345.6' (includes space)
```

`B.stripChars(text, charsToStrip, ignoreCase)`<br>
Returns text with all characters that are in the charsToStrip removed. If `ignoreCase` is true, characters are stripped irregardless of upper/lower case match. If `ignoreCase` is not included, it assumed to be false.

Example:
```javascript
B.stripChars('Sample 12345.6', '2lepms'); // 'Sa 1345.6'
B.stripChars('Sample 12345.6', '2lepms', true); // 'a 1345.6'
```

## Validation

`B.whichOneOf(text, values...)`<br>
Returns an integer value indicating which of a list of items the text is a match for. The values can be individual strings or comma seperated strings, or arrays of values to compare against. If no match is found, returns -1. If an item is represented multiple times in the values... this will return the first reference found. Matches are always case-insensitive.

Example:
```javascript
B.whichOneOf("Dan", "John,Paul,George,Ringo"); // -1
B.whichOneOf("Dan", ["John", "Paul", "George", "Ringo"], "DAN"); // 4
```

`B.isOneOf(text, values...)`<br>
Uses the `B.whichOneOf(text, values)` and returns true if the result >= 0 or false if it is less than 0.

Example:
```javascript
B.isOneOf("Dan", "John,Paul,George,Ringo"); // false
B.isOneOf("Dan", ["John", "Paul", "George", "Ringo"], "DAN"); // true
```

`B.isNotOneOf(text, values...)`<br>
Uses the `B.whichOneOf(text, values)` and returns false if the result >= 0 or true if it is less than 0. The same can be found with `!B.isOneOf(text, values...)`.

Example:
```javascript
B.isNotOneOf("Dan", "John,Paul,George,Ringo"); // true
B.isNotOneOf("Dan", ["John", "Paul", "George", "Ringo"], "DAN"); // false
```

## `B.is.xxxx()` functions

`B.is.IE()` - Returns true if the window.navigator.userAgent contains either 'MSIE ' or '.NET CLR '. This is a general-purpose test for the browser being Microsoft Internet Explorer.

`B.is.ALLDIGITS(val)` - Returns true if the only characters in the value passed are 0,1,2,3,4,5,6,7,8 or 9. Spaces, decimal points and any other characters are not allowed.

`B.is.ZIPCODE(val)` - Returns true if the values is either in a ##### or #####-#### format.

`B.is.DATE(val, min, max)` - Tests for the value being a date. Also, if passed as a parameter, tests that the date is equal or greater than the `min` value. Also, if passed as a parameter, tests that the date is less than or equal to the `max` value.

`B.is.EMAIL(val)` - Tests if the value appears to be a valid email using a generally accepted regular expression.

`B.is.NUMBER(val, min, max)` - Tests for the value being a numeric value (integer or floating point). Also, if passed as a parameter, tests that the value is equal or greater than the `min` value. Also, if passed as a parameter, tests that the value is less than or equal to the `max` value.

`B.is.INTEGER(val, min, max)` - Tests for the value being an integer. Also, if passed as a parameter, tests that the value is equal or greater than the `min` value. Also, if passed as a parameter, tests that the value is less than or equal to the `max` value.

`B.is.CHANGED(objA, objB)` - Iterates through both objects to determine if keys and values (and sub-object keys, values, etc) are a match. Order of keys is not considered, just existance and value matching.

`B.is.LASTDAYOFMONTH(date)` - Returns true if the data is valid and if it is the last day of a month. This is useful to determine if a user entered a date that is expected as an expiration of a last day of month value.

`B.is.ONEOF()` - Passes all values to the `B.isOneOf()` method.

`B.is.NOTONEOF()` - Passes all values to the `B.isNotOneOf()` method.

---

## Cookies

`B.cookie.SAVE(key, value)` - Saves a cookie key, value pair

`B.cookie.READ(key)` - Reads a cookie value given the key

`B.cookie.DELETE(key)` - Deletes a cookie given the key

`B.store.set(key, value)` - Saves data in local storage based on key, value pair. Fallback to Cookie if local storage is not supported.

`B.store.get(key)` - Reads a local storage value given the key. If local storage is not suppored, attempts to read from a cookie.

`B.store.del(key)` - Deletes a local storage item based on the key. If local storage is not supported, it attempt to delete a cookie.

---

## Forms

While not all that difficult to deal with, there is a wide level of confusing syntax and object properties and methods used to successfully work with HTML forms. The B library has a collection of methods that should help make this a lot less painful.

`B.Form`<br>
At the root of working with forms is the `B.Form` object. When you insantiate an instance of a B.Form object, it encapsulates a few simple methods that get to the information you typically want quickly and easily.

Javascript:
```javascript
var frm = new B.Form('myform');
```
HTML:
```html
<form id='myform'>
    First Name: <input name='fname'><br>
    Last Name: <input name='lname'><br>
    Gender: <label><input type='radio' name='gen' value='M'>Male</label>
            <label><input type='radio' name='gen' value='F'>Female</label>
            <label><input type='radio' name='gen' value='X' selected>NA</label><br>
    Region: <select name='reg'>
                <option value='N' selected>North</option>
                <option value='S'>South</option>
                <option value='E'>East</option>
                <option value='W'>West</option>
            </select><br>
    Programmer: <input type='checkbox' name='prog'>
</form>
```

`frm.get(fieldName)` - Returns the value of the form element. This will return the value from text fields, the selected value from a select list and the value of the selected radio button in a radio button set. If no item is selected in a radio button set or select list, it will return the value `null`. For checkbox elements, the return value will be a boolean indicating if the checkbox is checked or not.

`frm.get()` - If get is used with no fieldName parameter, it will return a Javascript object with key value pairs for all form elements. For example, in the example, this would return:<br>
`{ fname:'', lname:'', gen:'X', reg:'N', prog:false }`

`frm.set(fld, val...)` - Sets the form value for one or more fields in the form.

`frm.reset()` - resets the form using normal Javascript.

`frm.submit()` - submits the form.

`frm.freeze()` - Sets all elements of the form to disabled. It keeps the prior state of each of the elements so that when a subsequent thaw is called on the form, those elements that were already disabled remain so after being thawed.

`frm.thaw()` - Returns the disabled state of all elements to the state they were in prior to a freeze.

`frm.focus(fieldName)` - sets focus to the element.

`frm.setReadonly(fieldName, bool)` - Sets a field read-only based on the boolean parameter.

`frm.isDirty()` - Returns a boolean indicating if the values in the form are different than what was present when it was originally "loaded". Note that this does NOT track changes of values - it just determines if the values have changed since loading. For example, if you were to change the value of a textbox from "Dan" to "Joe", the form would be considered "Dirty". However, if you changed it back to "Dan"... it would then be "Clean".

The "Clean" state of values is determined the first time a form is loaded. At any time, this can be compared using the isDirty() method. If you wish to make the current state of the form the "Clean" state, use the `frm.setClean()` method. All subsequent checks of isDirty will use this new state for the comparison.

`frm.getDisplay(fieldName)` - When referring to radio button or select options, you may want to know the display text associated with the currently selected value. To do this, use the getDisplay() method. 

* For radio buttons and checkboxes, it will attempt to find a surrounding \<label\> tag and return the label text. If a label is not found, it will just return the field name.
* For select elements, it will return the innerText of the option that is currently selected.
* For all other element types, it will just return the field name, so this is not all that helpful.


Example:
```javascript
var frm = new B.Form('myform');
frm.set("fname","Dan", "prog",true);
frm.submit();
say("You are in the " + frm.getDisplay("reg") + " region.");
// This would show they are in the North region.
```

### Field "enhancements" ###

If you add certain data elements to fields, they will be enhanced using the B.Form. Note that you must make at least one reference to the form before these enhancements will be made active.

`<input name='test' data-validation='!'>` - Exclamation Mark<br>
This will add a grey "bullet" to the right of the textbox indicating it is a REQUIRED field. It is still up to you to verify that the field has a value.

`<input name='test' data-validation='*'>` - Asterisk<br>
This will add a yellow "bullet" to the right of the textbox indicating it is a KEY field. It is still up to you to verify that the field has a value.

`<input name='test' data-validation='U'>` - Captial letter U<br>
This will add a filter to the textbox such that letters will be displayed in Uppercase. While this does not actually change the value of the textbox, if you use the `frm.get()` feature, it will convert the value returned to uppercase.

You can combine !, * and U data-validation items. For example, to make a field Required and forced uppercase, use `data-validation='!U'`.

