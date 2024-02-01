# Job-Application-Tracking-
Scrape your Job Posting Data into a Google Sheet

## Linking to a Google Sheet
Within Google Sheets, you will need to:
1. click Extensions
2. click App Scripts
3. Do some voodoo I haven't looked at yet
4. change the links in the top of popup.js to match the links to your sheets
   
### Future QOL changes
This can be done by importing the Google API's:

```<script src="https://apis.google.com/js/api.js"></script>```

And then using implicit authentication to verify the user and create the app script.

However, this also requires creating and saving an API key to access the API.