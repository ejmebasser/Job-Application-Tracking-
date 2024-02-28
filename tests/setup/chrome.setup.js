// Mock chrome API
global.chrome = {
  action: {
    onClicked: {
      addListener: jest.fn((listener) => {
        return listener;
      }),
    },
  },
  identity: {
    getAuthToken: jest.fn(async (options, callback) => {
      Promise.resolve(callback('mock-token'));
    }),
  },

  runtime: {
    lastError: null,
    onMessage: {
      addListener: jest.fn((listener) => {
        return listener;
      }),
    },
    sendMessage: jest.fn().mockImplementation((message, callback) => {
      callback();
    }),
  },
  scripting: {
    executeScript: jest.fn((tabId) => {}),
  },
  storage: {
    local: {
      get: jest.fn().mockImplementation((keys, callback) => {
        const store = {
          sheetId: 'test-sheet-id',
          sheetName: 'test-sheet-name',
          consent: true,
        };

        const result = keys.map((key) => store[key]);
        return result;
      }),
      set: jest.fn((items, callback) => callback()),
    },
  },
  tabs: {
    query: jest.fn(),
    sendMessage: jest.fn().mockImplementation((tabId, message) => {}),
    onUpdated: {
      addListener: jest.fn((listener) => {
        return listener;
      }),
    },
    openPopup: jest.fn(),
  },
};
