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
