import { jobs_v3p1beta1 } from 'googleapis';
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

  // We can't test sendFormData because it's an async function that relies on the DOM mutating
});
