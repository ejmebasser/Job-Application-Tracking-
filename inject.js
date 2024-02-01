chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === 'loadData') {
    const pageUrl = window.location.href;

    const pageMap = parseUrl(pageUrl);
    // Store data in Chrome's local storage and send response
    chrome.storage.local.set(pageMap, function () {
      sendResponse(pageMap);
    });

    return true; // Indicates that the response is asynchronous
  }
});

function formatCurrentDateTime() {
  const now = new Date();
  const date = now.toLocaleDateString('en-US', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  const time = now.toLocaleTimeString('en-GB');
  return `${date} ${time}`;
}

function getURL(selector) {
  const link = document.querySelector(selector);
  return link ? link.href : window.location.href;
}

function getText(selector) {
  return document.querySelector(selector)?.textContent.trim() || '';
}

function parseUrl(url) {
  const urlMap = {
    'www.linkedin.com': {
      jobTitle: '.job-details-jobs-unified-top-card__job-title',
      company:
        '.job-details-jobs-unified-top-card__primary-description-without-tagline a',
      unknownInput: 'LinkedIn',
      url: getURL('.jobs-search-results-list__list-item--active a'),
    },
    'www.indeed.com': {
      jobTitle: '.jobsearch-JobInfoHeader-title',
      company: '[data-testid="inlineHeader-companyName"]',
      unknownInput: 'Indeed',
      url: getURL('.vjs-highlight .jobTitle a'),
    },
    'www.glassdoor.com': {
      jobTitle: '.JobDetails_jobTitle__Rw_gn',
      company: '.EmployerProfile_employerName__Xemli',
      unknownInput: 'GlassDoor',
      url: getURL('.JobCard_selected__q_cLS .JobCard_trackingLink__zUSOo a'),
    },
  };

  const storage = {
    jobTitle: '',
    company: '',
    unknownInput: '',
    applicationDateTime: formatCurrentDateTime(),
    url: 'N/A',
    updateElement: '',
  };

  console.log(url);
  for (const [key, element] of Object.entries(urlMap)) {
    const urlRegex = new RegExp(key);
    if (urlRegex.test(url)) {
      storage.jobTitle = getText(element.jobTitle);
      storage.company = getText(element.company);
      storage.unknownInput = element.unknownInput;
      storage.applicationDateTime = formatCurrentDateTime();
      storage.url = element.url;
    }
  }
  console.log(storage);

  return storage;
}
