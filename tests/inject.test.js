import * as injectModule from '../src/inject';

/**
 * These were all auto generated using GitHub Copilot.
 *
 * Please note that the tests are not complete and need to be updated.
 *
 * Please annotate the tests when a test has been verified.
 */
describe('inject.js', () => {
  describe('formatCurrentDateTime function', () => {
    it('should return a string formatted as MM/DD/YYYY HH:MM:SS', () => {
      const result = injectModule.formatCurrentDateTime();

      expect(typeof result).toBe('string');
      expect(result).toMatch(/\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2}/);
    });
  });

  describe('getURL function', () => {
    it('should return the URL of the current job', () => {
      document.body.innerHTML =
        '<a id="testLink" href="https://example.com">Test Link</a>';

      const url = injectModule.getURL('#testLink');

      // I'm not sure why link.href ends with a slash, but it does
      expect(url).toBe('https://example.com/');
    });
  });

  describe('getText function', () => {
    it('should return the text from within a selected element', () => {
      document.body.innerHTML = '<p id="testText">Test Text</p>';

      const text = injectModule.getText('#testText');

      expect(text).toBe('Test Text');
    });
  });

  describe('parseUrl function', () => {
    it('should parse the URL of the current job application page', () => {
      document.body.innerHTML = `
      <div class="jobs-search-results-list__list-item--active"><a href="https://www.linkedin.com/jobs/view/1234567890">Link</a></div>
      <h1 class="job-details-jobs-unified-top-card__job-title">Software Engineer</h1>
      <div class="job-details-jobs-unified-top-card__primary-description-without-tagline"><a href="https://www.linkedin.com/company/company-inc">Company Inc.</a></div>`;

      const url = 'https://www.linkedin.com/jobs/view/1234567890';

      const result = injectModule.parseUrl(url);

      expect(result).toEqual({
        jobTitle: 'Software Engineer',
        company: 'Company Inc.',
        source: 'LinkedIn',
        applicationDateTime: expect.any(String), // This will be the current date/time
        url: 'https://www.linkedin.com/jobs/view/1234567890',
      });
    });
  });

  // These tests are not complete.
  describe('sendFormData function', () => {
    beforeEach(() => {
      document.body.innerHTML = `
      <div class="jobs-s-apply"><button id="applyButton">Apply</button></div>`;
    });

    it('should attach the MutationObserver to the apply button', async () => {
      const mutationObserver = jest.spyOn(window, 'MutationObserver');
      window.MutationObserver.mockImplementation(() => ({observe: () => {}}));

      await injectModule.sendFormDataOnEasyApply();

      const applyDiv = document.querySelector('.jobs-s-apply');

      expect(applyDiv).toBeDefined();
      expect(mutationObserver).toHaveBeenCalled();
    });
  });

  describe('saveJob function', () => {
    it('should send a message to the background script to save the job', () => {
      const formData = {
        jobTitle: 'Software Engineer',
        company: 'Company Inc.',
        source: 'LinkedIn',
        applicationDateTime: '12/31/2022 23:59:59',
        url: 'https://www.linkedin.com/jobs/view/1234567890',
      };

      injectModule.saveJob(formData);

      expect(chrome.runtime.sendMessage).toHaveBeenCalled();
    });
  });
});
