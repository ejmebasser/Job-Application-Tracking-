import Utils from '../../src/utils/utils.js';

let settingsForm;
let applicationForm;
let utils;

describe('Utils', () => {
  beforeEach(() => {
    settingsForm = document.createElement('form');
    applicationForm = document.createElement('form');
    utils = new Utils(settingsForm, applicationForm);
  });

  describe('toggleCogFunction', () => {
    it('should toggle the display of the settings and job application form', () => {
      settingsForm.style.display = 'block';
      applicationForm.style.display = 'none';

      utils.toggleCogFunction();

      expect(settingsForm.style.display).toBe('none');
      expect(applicationForm.style.display).toBe('block');
    });
  });

  describe('appendMessage', () => {
    it('should append a message to the result div', () => {
      const divId = 'result';
      document.body.innerHTML = `<div id="${divId}"></div>`;
      utils.appendMessage('#' + divId, 'Test message');
      expect(document.getElementById('result').innerHTML).toBe(
        '<p>Test message</p>'
      );
    });
  });

  describe('removeButton', () => {
    it('should remove the submit button from the popup', () => {
      const buttonId = 'saveData';
      document.body.innerHTML = `<button id="${buttonId}"></button>`;
      utils.removeButton('#' + buttonId);
      expect(document.getElementById('saveData')).toBeNull();
    });
  });

  describe('throttle', () => {
    it('should execute the function immediately', () => {
      const mockFn = jest.fn();
      const throttledFn = utils.throttle(mockFn, 1000);

      throttledFn();

      expect(mockFn).toHaveBeenCalled();
    });

    it('should ignore subsequent calls within the delay period', async () => {
      const mockFn = jest.fn();
      const throttledFn = utils.throttle(mockFn, 1000);

      throttledFn();
      throttledFn();

      await new Promise((resolve) => setTimeout(resolve, 1100));

      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should execute the function again after the delay period', async () => {
      const mockFn = jest.fn();
      const throttledFn = utils.throttle(mockFn, 1000);

      throttledFn();

      await new Promise((resolve) => setTimeout(resolve, 1100));

      throttledFn();

      expect(mockFn).toHaveBeenCalledTimes(2);
    });
  });
});
