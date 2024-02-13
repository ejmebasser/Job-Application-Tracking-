window.onload = function () {
  document.querySelector('button').addEventListener('click', function () {
    chrome.identity.getAuthToken({ interactive: true }, function (token) {
      let init = {
        method: 'GET',
        async: true,
        Headers: {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
        },
        contentType: 'json',
      };
    });
  });
};
