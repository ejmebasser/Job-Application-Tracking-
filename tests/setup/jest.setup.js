// Mock axios
global.mockFetch = function (result) {
  const mockFetch = jest
    .fn()
    .mockImplementation(() =>
      Promise.resolve({ ok: true, json: () => Promise.resolve(result) })
    );
  global.fetch = mockFetch;
};
