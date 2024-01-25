chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "loadData") {
        var pageUrl = window.location.href;
        var jobTitle, company, unknownInput, applicationDateTime, url;

        function getCurrentDateTimeFormatted() {
            var now = new Date();
            var year = now.getFullYear();
            var month = (now.getMonth() + 1).toString().padStart(2, '0');
            var day = now.getDate().toString().padStart(2, '0');
            var hours = now.getHours().toString().padStart(2, '0');
            var minutes = now.getMinutes().toString().padStart(2, '0');
            var seconds = now.getSeconds().toString().padStart(2, '0');
            return month + '/' + day + '/' + year + ' ' + hours + ':' + minutes + ':' + seconds;
        }

        if (pageUrl.startsWith("https://www.linkedin.com/jobs/view/")) {
            var pageTitle = document.getElementsByTagName("title")[0].innerHTML;
            var titleParts = pageTitle.split("|").map(part => part.trim());
            jobTitle = titleParts[0] || "";
            company = titleParts[1] || "";
            unknownInput = titleParts[2] || "";
            applicationDateTime = getCurrentDateTimeFormatted();
            url = pageUrl;
        } else if (pageUrl.startsWith("https://www.linkedin.com/jobs/collections/") || pageUrl.startsWith("https://www.linkedin.com/jobs/search/")) {
            jobTitle = document.querySelector('.job-details-jobs-unified-top-card__job-title-link')?.textContent.trim() || "";
            var companyElement = document.querySelector('.job-details-jobs-unified-top-card__primary-description-without-tagline');
            if (companyElement) {
                var companyText = companyElement.textContent.split('·')[0].trim();
                company = companyText;
            } else {
                company = "";
            }
            unknownInput = "Unknown";
            applicationDateTime = getCurrentDateTimeFormatted();
            var jobUrlElement = document.querySelector('.job-details-jobs-unified-top-card__job-title a');
            url = jobUrlElement ? 'https://www.linkedin.com' + jobUrlElement.getAttribute('href') : '';
        } else if (pageUrl.startsWith("https://www.indeed.com/?from=gnav-jobsearch--indeedmobile")) {
            // Scraping from Indeed job listing page
            jobTitle = document.querySelector('.jobsearch-JobInfoHeader-title-container .jobsearch-JobInfoHeader-title')?.textContent.trim() || "";
            company = document.querySelector('[data-testid="inlineHeader-companyName"]')?.textContent.trim() || "";
            unknownInput = "Indeed";
            applicationDateTime = getCurrentDateTimeFormatted();
            url = 'N/A';
        }
        else if (pageUrl.startsWith("https://www.indeed.com/jobs")) {
            // Scraping from Indeed jobs  page
            jobTitle = document.querySelector('.jobsearch-JobInfoHeader-title-container .jobsearch-JobInfoHeader-title')?.textContent.trim() || "";
            company = document.querySelector('[data-testid="inlineHeader-companyName"]')?.textContent.trim() || "";
            unknownInput = "Indeed";
            applicationDateTime = getCurrentDateTimeFormatted();
            url = 'N/A';
        }
        else if (pageUrl.startsWith("https://www.indeed.com/viewjob")) {
            // Scraping from Indeed view job listing page
            jobTitle = document.querySelector('.jobsearch-JobInfoHeader-title-container .jobsearch-JobInfoHeader-title')?.textContent.trim() || "";
            company = document.querySelector('[data-testid="inlineHeader-companyName"]')?.textContent.trim() || "";
            unknownInput = "Indeed";
            applicationDateTime = getCurrentDateTimeFormatted();
            url = pageUrl; // Set to the current page URL
        }
        else if (pageUrl.startsWith("https://www.glassdoor.com/Job/")) {
            // Scraping from Glassdoor job page
            jobTitle = document.querySelector('.JobDetails_jobTitle__Rw_gn')?.textContent.trim() || "";
            company = document.querySelector('.EmployerProfile_employerName__Xemli')?.textContent.trim() || "";
            unknownInput = "GlassDoor";
            applicationDateTime = getCurrentDateTimeFormatted();
            url = 'N/A'; // Set to 'N/A' as per your requirement
        }
        else if (pageUrl.startsWith("https://www.glassdoor.com/job-listing/")) {
            // Scraping from Glassdoor job listing page
            jobTitle = document.querySelector('h1.JobDetails_jobTitle__Rw_gn')?.textContent.trim() || "";
            company = document.querySelector('span.EmployerProfile_employerName__Xemli')?.textContent.trim() || "";
            unknownInput = "GlassDoor";
            applicationDateTime = getCurrentDateTimeFormatted();
            url = pageUrl; // Set to the current page URL
        }

        // Store data in Chrome's local storage and send response
        chrome.storage.local.set({ jobTitle, company, unknownInput, applicationDateTime, url }, function() {
            sendResponse({ jobTitle, company, unknownInput, applicationDateTime, url });
        });

        return true; // Indicates that the response is asynchronous
    }
});
