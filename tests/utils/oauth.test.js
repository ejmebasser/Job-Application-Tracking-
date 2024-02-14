import OAuth from '../../src/utils/oauth.js';
import axios from 'axios';

let oauth;
jest.mock('axios');

describe('OAuth', () => {
  beforeEach(() => {
    oauth = new OAuth();
  });

  afterEach(() => {
    axios.post.mockClear();
    axios.get.mockClear();
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
      const expectedResult = {
        files: [
          {
            name: 'Test Sheet',
            id: 'test-id',
          },
        ],
      };
      axios.get.mockResolvedValue({ data: expectedResult });

      const sheets = await oauth.getSheets();

      expect(sheets).toBeDefined();
      expect(sheets).toEqual(
        expectedResult.files.map((file) => ({
          name: file.name,
          id: file.id,
        }))
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
      axios.get.mockResolvedValue({ data: expectedResult });

      const sheetNames = await oauth.getSheetNames('test-id');

      expect(sheetNames).toBeDefined();
      expect(sheetNames).toEqual(
        expectedResult.sheets.map((sheet) => sheet.properties.title)
      );
    });
  });

  describe('getSheetValues', () => {
    it('should get the values from a sheet', async () => {
      const expectedResult = {
        values: ['test-value'],
      };
      axios.get.mockResolvedValue({ data: expectedResult });

      const sheetValues = await oauth.getSheetValues('test-id', 'test-tab');

      expect(sheetValues).toBeDefined();
      expect(sheetValues).toEqual(expectedResult);
    });
  });

  describe('appendValues', () => {
    it('should append values to a sheet', async () => {
      const expectedResult = {
        status: 200,
      };
      axios.post.mockResolvedValue(expectedResult);

      const values = await oauth.appendValues('test-id', 'test-tab', {});

      expect(values).toBeDefined();
      expect(values).toEqual(expectedResult);
    });
  });
});
