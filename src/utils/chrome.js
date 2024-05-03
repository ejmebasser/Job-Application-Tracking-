/**
 * Gets the current tab ID.
 *
 * @return {number} The current tab ID.
 */
export async function getCurrentTabId() {
  let [response] = await chrome.tabs.query({
    active: true,
    lastFocusedWindow: true,
  });
  // console.log('response:', response);
  return 'id' in response ? response.id : -1;
}

/**
 * Get a value from chrome.storage.sync.
 *
 * @param {string} key The key of the information in sync storage to get the value of
 * @return {Promise} The value of the key
 */
export function getChromeStorageData(key) {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get(key, (result) => {
      if (chrome.runtime.lastError) {
        return reject(chrome.runtime.lastError);
      }
      resolve(result[key]);
    });
  });
}

/**
 * Get the value of userInfo from sync storage
 *
 * @return The userInfo value
 */
export async function requestUserInfo() {
  try {
    const userInfo = await getChromeStorageData('userInfo');
    if (userInfo) {
      console.log('User info retrieved:', userInfo);
      return userInfo; // Use or return userInfo as needed
    } else {
      throw new Error('No user info found.');
    }
  } catch (error) {
    console.error(error);
    // Handle error or absence of userInfo as needed
  }
}
