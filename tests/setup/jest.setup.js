// Mock axios
global.mockAxios = function (result) {
  const mockAxios = jest.genMockFromModule('axios');
  mockAxios.post.mockImplementation(() => Promise.resolve({ data: result }));
  global.axios = mockAxios;
};
