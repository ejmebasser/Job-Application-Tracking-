/**
 * Function to handle the linkSheet button click event.
 */
export function updateSheet() {
  const sheetElement = document.querySelector('#sheet');
  if (sheetElement.firstChild) {
    sheetElement.removeChild(sheetElement.firstChild);
  }

  const sheetInput = document.createElement('input');
  sheetInput.type = 'text';
  sheetInput.id = 'sheetUrl';
  sheetInput.placeholder = 'Enter Google Sheet URL';
  sheetInput.onkeydown = function (event) {
    if (event.key === 'Enter') {
      sheetURL = sheetInput.value;
      saveSheet();
    }
  };
  sheetElement.appendChild(sheetInput);

  toggleCogFunction(true);
}

/**
 * Function to handle the saveSheet button click event.
 */
export function saveSheet() {
  const sheetElement = document.querySelector('#sheet');
  const sheetURL = sheetElement.querySelector('input').value;
  console.log(sheetURL);

  if (sheetElement.firstChild) {
    sheetElement.removeChild(sheetElement.firstChild);
  }
  if (!sheetURL) {
    const textElement = document.createElement('span');
    textElement.textContent = 'No Google Sheet URL provided';
    sheetElement.appendChild(textElement);
  } else {
    createSheetLink(sheetURL);

    chrome.runtime.sendMessage({ action: 'loadSheet', sheetURL: sheetURL });
  }

  toggleCogFunction(false);
}

export function createSheetLink(sheetURL) {
  const sheetElement = document.querySelector('#sheet');

  const link = document.createElement('a');
  link.text = 'Open Google Sheet';
  link.href = sheetURL;
  link.target = '_blank';
  sheetElement.appendChild(link);
}

export function toggleCogFunction(save = false) {
  const clickFunction = save ? saveSheet : updateSheet;
  const oldFunction = save ? updateSheet : saveSheet;

  const cog = document.querySelector('#linkSheet');
  cog.removeEventListener('click', oldFunction);
  cog.addEventListener('click', clickFunction);
}
