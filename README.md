# Job Application Trackr
Scrape your Job Posting Data into a Google Sheet

## Building Package
You will need to install webpack to build this application.

Once webpack is installed, you may run ```npx webpack```

Everything is configured to place the files where manifest.json expects them


## Installing Tracker
At this time, you can install the extension by loading the unpacked folder.

There is a possibility that the OAuth portion will not work unless you are added to the testing group.

This group is limited to 100 email addresses, so there is a limit until this application launches.


## Linking to a Google Sheet
Once installed, you will be prompted to log into Google.

After completing OAuth, clicking the icon will open up the popup.

You should find some checkboxes to modify behavior of the extension.

You should also see a list of your Google spreadsheets sorted in reverse chronological order by last modified.

Selecting a sheet will populate the list of "sheets" (otherwise known as the tabs at the bottom of a sheet).

Once both a Google spreadsheet, and it's internal sheet, you should now be able to log data into this sheet.

For complete functionality, we expect cell 'H1' to contain a cumulative count of jobs applied and 'J1' to contain a count of jobs applied to today.

Data will also be entered in this order:
1. Job Title
2. Company
3. Source
4. Date and Time of Application
5. URL of application description


The formula for 'H1' is: ```=countA(A:A)-1```<br>
The formula for 'J1' is: ```=ARRAYFORMULA(SUM(--(TEXT(D:D, "M/d/yyyy") = TEXT(TODAY(), "M/d/yyyy"))))```


## Testing the Tracker
You can either run ```npm jest``` or ```npm test``` to test the application

Not all tests have been completed, as of 2/19/24 only 63% of statements have coverage.
