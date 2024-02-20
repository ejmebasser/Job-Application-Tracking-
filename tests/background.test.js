import * as Background from '../src/background';

/**
 * Tests for the background script
 */
describe('background.js', () => {
  describe('injectScript function', () => {
    it('should inject a script to a tab', () => {
      const target = {
        files: ['dist/inject.bundle.js'],
        target: { tabId: 1 },
      };
      Background.injectScript(tabId);

      expect(chrome.scripting.executeScript).toHaveBeenCalledWith(tabId);
    });
  });

  describe('onClicked addListener', () => {
    it('should open up the popup when clicked', () => {
      const tab = { id: 1 };
      chrome.action.onClicked.addListener(tab);

      expect(chrome.tabs.openPopup).toHaveBeenCalled();
    });
  });

  describe('onUpdated addListener', () => {
    it('should call the inject function when the changeInfo.url changes', () => {
      const spy = jest.spyOn(Background, 'injectScript');

      const tabId = 1;
      const changeInfo = { url: 'https://example.com' };
      const tab = { id: 1 };
      chrome.tabs.onUpdated.addListener(tabId, changeInfo, tab);

      expect(chrome.tabs.onUpdated.addListener).toBeDefined();
      expect(spy).toHaveBeenCalled();
    });

    it('should get the autoSave value from memory on changeInfo.status === "complete"', () => {
      const tabId = 1;
      const changeInfo = { status: 'complete' };
      const tab = { id: 1 };
      chrome.tabs.onUpdated.addListener(tabId, changeInfo, tab);

      expect(result).toBeDefined();
    });

    it('should send a message to the tab if autoSave is true', () => {
      const tabId = 1;
      const result = chrome.tabs.sendMessage(tabId, {
        action: 'autoSave',
        autoSave: true,
      });

      expect(result).toBeDefined();
    });
  });

  describe('onMessage addListener', () => {
    it('should add a listener for the "saveJob" action', () => {
      const message = { action: 'saveJob' };
      const sender = {};
      const sendResponse = () => {};
      const result = chrome.runtime.onMessage.addListener(
        message,
        sender,
        sendResponse
      );

      expect(result).toBeDefined();
    });

    it('should initialize the OAuth object', async () => {
      const result = await initializeOauth();

      expect(result).toBeDefined();
    });
  });

  describe('initializeOauth function', () => {
    it('should initialize the OAuth object', async () => {
      const result = await initializeOauth();

      expect(result).toBeDefined();
    });
  });
});
