import OAuth from '../../src/utils/oauth.js';

let oauth;

function mockFetchResponse(dataObj) {
  const expectedResult = {
    status: 200,
    ok: true,
    json: async () => dataObj,
  };

  return expectedResult;
}

describe('OAuth', () => {
  beforeEach(() => {
    oauth = new OAuth();

    fetch.mockClear();
  });

  describe('getOAuth', () => {
    it('should get the OAuth token', async () => {
      const oauthObj = await oauth.getOAuth();

      expect(oauthObj).toBeDefined();
    });
  });

  describe('getAuthToken', () => {
    it('should get the OAuth token', async () => {
      const token = await oauth.getAuthToken();

      expect(token).toBeDefined();
      expect(token).toBe('mock-token');
    });
  });

  describe('getSheets', () => {
    it('should get the list of sheets', async () => {
      const data = {
        files: [
          {
            name: 'Test Sheet',
            id: 'test-id',
          },
        ],
      };
      fetch.mockResolvedValue(mockFetchResponse(data));

      const sheets = await oauth.getSheets();

      expect(sheets).toBeDefined();
      expect(sheets).toEqual(
          data.files.map((file) => ({
            name: file.name,
            id: file.id,
          })),
      );
    });
  });

  describe('getSheetNames', () => {
    it('should get the list of sheet names', async () => {
      const expectedResult = {
        sheets: [
          {
            properties: {
              title: 'test-tab',
            },
          },
        ],
      };
      fetch.mockResolvedValue(mockFetchResponse(expectedResult));

      const sheetNames = await oauth.getSheetNames('test-id');

      expect(sheetNames).toBeDefined();
      expect(sheetNames).toEqual(
          expectedResult.sheets.map((sheet) => sheet.properties.title),
      );
    });
  });

  describe('getCellValue', () => {
    it('should get a value from a sheet', async () => {
      const expectedResult = {
        values: ['test-value'],
      };
      fetch.mockResolvedValue(mockFetchResponse(expectedResult));

      const sheetValues = await oauth.getCellValue('test-id');

      expect(sheetValues).toBeDefined();
      expect(sheetValues).toEqual(expectedResult);
    });
  });

  describe('appendValues', () => {
    it('should append values to a sheet', async () => {
      const expectedResult = {
        status: 200,
      };
      fetch.mockResolvedValue(expectedResult);

      const values = await oauth.appendValues('test-id', 'test-tab', {});

      expect(values).toBeDefined();
      expect(values).toEqual(expectedResult);
    });
  });
});
