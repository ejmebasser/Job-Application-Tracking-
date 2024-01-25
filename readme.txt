
Certainly! Here's a revised version of your README:

README
Overview
This application is designed to streamline your job search process by automating data collection from popular job sites such as LinkedIn, Indeed, and GlassDoor. With this program, the tedious task of manually copying and pasting job posting details into a spreadsheet is eliminated. Instead, the program efficiently scrapes job listings from the sites you visit and populates this data directly into a RESTful Google Sheet.

Features
Automated Data Scraping: Automatically gathers job posting information from LinkedIn, Indeed, and GlassDoor.
Integration with Google Sheets: Seamlessly inputs the scraped data into a Google Sheet, organizing it for easy access and analysis.
User-Friendly Interface: Simple and intuitive to use, requiring minimal setup.
How It Helps
Saves Time: Reduces the repetitive task of manually entering job details, freeing up more time for your job search and application process.
Improves Organization: Keeps all your job search information neatly organized in one place.
Enhances Job Search Efficiency: Streamlines the process of collecting and reviewing job postings, making it easier to find and apply to the right positions.
Enjoy a more efficient job search experience with our user-friendly application!



THe HOW TO USE THE PROGRAM:

Create a New Spreadsheet:

Open Google Sheets and create a new, untitled spreadsheet.
Rename it to a name of your choice, for example, "JobTrackerGoogleSheet".
Set Spreadsheet Sharing Settings:

Click the 'Share' button in the upper right-hand corner.
Set the sharing to "Anyone with the link".
Enter Required Headers:

Enter the following headers exactly as shown in your provided image or list.

A1=jobTitle
B1=company
C1=unknownInput
D1=applicationDateTime
E1=url
F1=
G1=COUNT
H1=
I1=count today
J1=


Add the formula =COUNTA(A:A)-1 in cell H1.
In cell J1, enter the formula =ARRAYFORMULA(SUM(--(TEXT(D:D, "M/d/yyyy") = TEXT(TODAY(), "M/d/yyyy")))).
Access Google Apps Script:

In the Google Sheets toolbar, navigate to Extensions > Apps Script.
Open a New Apps Script Project:

Clicking on Apps Script opens a new window.
Edit Code in Apps Script:

In the code.gs file, paste the provided Apps Script code.
On line 1, replace ENTER GOOGLE SHEET URL OF THE GOOGLE SHEET YOU JUST CREATED with the actual URL of your Google Sheet.
On line 3, replace ENETR SHEET NAME HERE with the name of the sheet in your Google Sheets file (typically "Sheet1").
//CODE BELOW
var wbook = SpreadsheetApp.openByUrl(‘ENTER GOOGLE SHEET URL OF THE GOOGLE SHEET YOU JUST CREATED’); 

var sheet = wbook.getSheetByName(‘ENETR SHEET NAME HERE’ ); 

function doPost(e){

var action = e.parameter.action;

if(action=='addUser'){
  return addUser(e); 
}

}

function addUser(e){
  var user=JSON.parse(e.postData.contents);
  sheet.appendRow([user.jobTitle, user.company,user.unknownInput,user.applicationDateTime,user.url]); 

  return ContentService.createTextOutput("Success").setMimeType("ContentService.MimeType.TEXT")
}

function doGet(e){
var action = e.parameter.action;

if(action=='getUsers'){
  return getUsers(e); 
}
if(action=='getDailyTotal'){
  return getDailyTotal(e); 
}
}

function getUsers(e) {
    try {
        var rows = sheet.getRange("h1").getValues(); 
        var result = JSON.stringify(rows); 
        return ContentService.createTextOutput(result).setMimeType(ContentService.MimeType.JSON);
    } catch (error) {
        console.error('Error in getUsers:', error);
        return ContentService.createTextOutput("Error: " + error.message).setMimeType(ContentService.MimeType.TEXT);
    }
}


function getDailyTotal(e) {
    try {
        var rows = sheet.getRange("J1").getValues(); 
        var result = JSON.stringify(rows); 
        return ContentService.createTextOutput(result).setMimeType(ContentService.MimeType.JSON);
    } catch (error) {
        console.error('Error in getUsers:', error);
        return ContentService.createTextOutput("Error: " + error.message).setMimeType(ContentService.MimeType.TEXT);
    }
}

//END OF CODE


Save and Run the Script:

Click the save icon to save your script.
Run the script by clicking the run icon.
Deploy the Script:

Deploy the script by creating a new deployment.
Describe the deployment, execute it as yourself, and set access to "Anyone".
Grant the necessary permissions when prompted.
Retrieve the Deployment URL:

After deployment, you will receive a URL like https://script.google.com/.../exec. Save this URL.
Update the popup.js File:

In your Visual Studio Code editor, open the popup.js file.
Update the variables on lines 1, 2, and 3 with the URL you just copied.
Load the Extension:

Save your changes in VS Code.
Go to your Chrome browser and load the extension.
You should now see the new icon in the toolbar, indicating that the product is ready to use.