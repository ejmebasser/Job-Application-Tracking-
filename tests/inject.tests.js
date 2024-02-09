const {
  formatCurrentDateTime,
  getURL,
  getText,
  parseUrl,
} = require('./inject');

/**
 * These were all auto generated using GitHub Copilot.
 *
 * Please note that the tests are not complete and need to be updated.
 *
 * Please annotate the tests when a test has been verified.
 */
describe('inject.js tests', () => {
  test('formatCurrentDateTime function', () => {
    const result = formatCurrentDateTime();
    expect(typeof result).toBe('string');
    expect(result).toMatch(/\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2}/);
  });

  test('getURL function', () => {
    document.body.innerHTML =
      '<a id="testLink" href="https://example.com">Test Link</a>';

    // mock no id match and return current URL
    const url = getURL('#testLink');
    expect(url).toBe('https://example.com');
  });

  test('getText function', () => {
    document.body.innerHTML = '<p id="testText">Test Text</p>';

    // test no id match and return empty string
    const text = getText('#testText');
    expect(text).toBe('Test Text');
  });

  test('parseUrl function', () => {
    // Mock getText and getURL
    getText.mockImplementation((selector) => {
      return selector === '.job-details-jobs-unified-top-card__job-title'
        ? 'Software Engineer'
        : 'Company Inc.';
    });
    getURL.mockImplementation(
      () => 'https://www.linkedin.com/jobs/view/1234567890'
    );
    const url = 'https://www.linkedin.com/jobs/view/1234567890';
    const result = parseUrl(url);
    expect(result).toEqual({
      jobTitle: 'Software Engineer',
      company: 'Company Inc.',
      source: 'LinkedIn',
      applicationDateTime: expect.any(String), // This will be the current date/time
      url: 'https://www.linkedin.com/jobs/view/1234567890',
    });
  });

  // Testing sendFormDataOnEasyApply would be more complex due to its interactions with the DOM and the chrome API
});
