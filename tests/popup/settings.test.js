import Settings from '../../src/popup/settings';
import OAuth from '../../src/utils/oauth';

let settings;
let oauth;

describe('Settings', () => {
  beforeEach(async () => {
    const jobForm = document.createElement('form');
    jobForm.id = 'jobForm';

    const settingsForm = document.createElement('form');
    settingsForm.id = 'settingsForm';
    const autoSave = document.createElement('input');
    autoSave.type = 'checkbox';
    autoSave.name = 'autoSave';
    const sheetId = document.createElement('select');
    sheetId.name = 'sheetId';
    sheetId.options[0] = new Option('test-sheet1', 'test-sheet1');
    sheetId.options[1] = new Option('test-sheet2', 'test-sheet2');
    const sheetName = document.createElement('input');
    sheetName.name = 'sheetName';
    settingsForm.appendChild(autoSave);
    settingsForm.appendChild(sheetId);
    settingsForm.appendChild(sheetName);

    const sheetElement = document.createElement('div');
    sheetElement.appendChild(document.createElement('span'));

    settings = new Settings(jobForm, settingsForm, sheetElement);
    oauth = await settings.getOauth();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getOauth function', () => {
    it('should get the OAuth token', async () => {
      const oauth = await settings.getOauth();

      expect(oauth).toBeDefined();
    });

    it('should return the existing OAuth token', async () => {
      settings.oauth = 'test-token';
      const oauth = await settings.getOauth();

      expect(oauth).toBe('test-token');
    });
  });

  describe('saveSettings function', () => {
    it('should save the settings', () => {
      settings.saveSettings();

      expect(settings.saveSettings).toBeDefined();
    });

    it('should create the URL link to the Google Sheet using the sheetId', () => {
      const createSheetLink = jest.spyOn(settings, 'createSheetLink');

      const sheetId = settings.settingsForm.querySelector(
        'select[name="sheetId"]'
      );
      sheetId.value = 'test-sheet1';
      settings.saveSettings();

      expect(createSheetLink).toHaveBeenCalled();
    });

    it('should store the settings values', () => {
      const storeSettingsValues = jest.spyOn(settings, 'storeSettingsValues');

      settings.saveSettings();

      expect(storeSettingsValues).toHaveBeenCalled();
    });

    it('should send a message to the tab if autoSave is true', () => {
      const sendAutoSaveMessage = jest.spyOn(settings, 'sendAutoSaveMessage');

      const autoSave = settings.settingsForm.querySelector(
        'input[name="autoSave"]'
      );
      autoSave.checked = true;
      settings.saveSettings();

      expect(sendAutoSaveMessage).toHaveBeenCalled();
    });

    it('should toggle the cog function', () => {
      const toggleCogFunction = jest.spyOn(settings.utils, 'toggleCogFunction');

      settings.saveSettings();

      expect(toggleCogFunction).toHaveBeenCalled();
    });
  });

  describe('buildSheetURL function', () => {
    it('should build the URL to the Google Sheet', () => {
      const sheetId = 'test-id';
      const url = settings.buildSheetURL(sheetId);

      expect(url).toBe(
        'https://docs.google.com/spreadsheets/d/test-id/edit#gid=0'
      );
    });
  });

  describe('createSheetLink function', () => {
    it('should create the URL link to the Google Sheet using the sheetId', () => {
      settings.createSheetLink('test-id');
      const expectedUrl =
        'https://docs.google.com/spreadsheets/d/test-id/edit#gid=0';

      expect(settings.sheetElement.innerHTML).toBe(
        `<a href="${expectedUrl}" target="_blank">Open Google Sheet</a>`
      );
    });
  });

  describe('updateSettingsValues function', () => {
    it('should update the values of the settings fields', () => {
      const newSettings = {
        autoSave: true,
        sheetId: 'test-id',
        sheetName: 'test-id2',
      };
      const newValues = settings.updateSettingsValues(newSettings);

      expect(settings.fields).toEqual(newSettings);
      expect(newValues).toEqual(newSettings);
    });

    it('should update the values of the settingsForm', () => {
      const newSettings = {
        autoSave: true,
        sheetName: 'test-id',
        sheetId: 'test-sheet2',
      };
      settings.updateSettingsValues(newSettings);

      const autoSave = settings.settingsForm.querySelector(
        'input[name="autoSave"]'
      );
      const sheetName = settings.settingsForm.querySelector(
        'input[name="sheetName"]'
      );
      const sheetId = settings.settingsForm.querySelector(
        'select[name="sheetId"]'
      );

      expect(autoSave.checked).toBe(true);
      expect(sheetName.value).toBe('test-id');
      expect(sheetId.value).toBe('test-sheet2');
    });
  });

  describe('storeSettingsValues function', () => {
    it('should store the settings values', () => {
      const newSettings = {
        autoSave: true,
        sheetId: 'test-id',
        sheetName: 'test-id2',
      };
      const returnFunc = jest.fn();
      settings.storeSettingsValues(newSettings);

      expect(chrome.storage.local.set).toHaveBeenCalled();
    });
  });

  describe('populateSheetList function', () => {
    const sheetIds = [
      { id: 'test-sheet-id1', name: 'idName1' },
      { id: 'test-sheet-id2', name: 'idName2' },
    ];

    const sheetNames = ['test-sheet1', 'test-sheet2'];
    beforeEach(async () => {
      oauth = await settings.getOauth();

      oauth.getSheets = jest.fn().mockResolvedValue(sheetIds);

      oauth.getSheetNames = jest.fn().mockResolvedValue(sheetNames);
    });

    it('should call the getSheets function', async () => {
      const getSheets = jest.spyOn(oauth, 'getSheets');

      await settings.populateSheetList();

      expect(getSheets).toHaveBeenCalled();
    });

    it('should replace the options in the select element with the new sheet names', async () => {
      await settings.populateSheetList();
      const sheetId = settings.settingsForm.querySelector(
        'select[name="sheetId"]'
      );

      expect(sheetId.innerHTML).toBe(
        '<option value="test-sheet-id1">idName1</option><option value="test-sheet-id2">idName2</option>'
      );
    });
  });

  describe('populateSheetNameList function', () => {
    const sheetNames = ['test-sheet1', 'test-sheet2'];

    beforeEach(async () => {
      oauth = await settings.getOauth();

      oauth.getSheetNames = jest.fn().mockResolvedValue(sheetNames);
    });

    it('should call the getSheetNames function', async () => {
      const getSheetNames = jest.spyOn(oauth, 'getSheetNames');
      const sheetId = 'test-id';

      await settings.populateSheetNameList(sheetId);

      expect(getSheetNames).toHaveBeenCalledWith(sheetId);
    });

    it('should replace the options in the select element with the new sheet names', async () => {
      await settings.populateSheetNameList('test-id');

      const sheetName = settings.settingsForm.querySelector(
        'input[name="sheetName"], select[name="sheetName"]'
      );

      expect(sheetName.innerHTML).toBe(
        `<option value="${sheetNames[0]}">${sheetNames[0]}</option><option value="${sheetNames[1]}">${sheetNames[1]}</option>`
      );
    });
  });

  describe('sendAutoSaveMessage function', () => {
    it('should call the sendMessage function', () => {
      const sendMessage = jest.spyOn(settings.utils, 'sendMessage');

      const autoSave = true;
      settings.sendAutoSaveMessage(autoSave);

      expect(sendMessage).toHaveBeenCalledWith({
        action: 'autoSave',
        autoSave: autoSave,
      });
    });
  });
});
