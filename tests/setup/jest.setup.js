// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({json: () => Promise.resolve({data: 'test'})}),
);
