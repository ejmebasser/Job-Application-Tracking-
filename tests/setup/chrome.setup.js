// Mock chrome API
global.chrome = {
  tabs: {
    query: async () => {
      throw new Error('Not implemented');
    },
    sendMessage: jest.fn().mockImplementation((tabId, message, callback) => {
      callback();
    }),
  },
  runtime: {
    lastError: null,
    onMessageExternal: {
      addListener: jest.fn((listener) => {
        messageListener = listener;
      }),
    },
    sendMessage: jest.fn().mockImplementation((message, callback) => {
      callback();
    }),
  },
  identity: {
    getAuthToken: jest.fn((options, callback) => {
      callback('mock-token');
    }),
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
};
