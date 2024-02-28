import JobForm from '../../src/popup/jobForm.js';

let jobForm;
let jobElement;

function mockFetchResponse(dataObj) {
  const expectedResult = {
    status: 200,
    ok: true,
    json: async () => dataObj,
  };

  return expectedResult;
}

const testData = {
  jobTitle: 'Software Engineer',
  company: 'Company Inc.',
  source: 'LinkedIn',
  applicationDateTime: '2021-01-01 00:00',
  url: 'http://test.url',
};

describe('JobForm', () => {
  beforeEach(() => {
    jobElement = document.createElement('form');
    jobElement.id = 'testForm';
    const jobTitle = document.createElement('input');
    jobTitle.name = 'jobTitle';
    jobTitle.value = testData.jobTitle;
    jobElement.appendChild(jobTitle);
    const company = document.createElement('input');
    company.name = 'company';
    company.value = testData.company;
    jobElement.appendChild(company);
    const source = document.createElement('input');
    source.name = 'source';
    source.value = testData.source;
    jobElement.appendChild(source);
    const date = document.createElement('input');
    date.name = 'applicationDateTime';
    date.value = testData.applicationDateTime;
    jobElement.appendChild(date);
    const url = document.createElement('input');
    url.name = 'url';
    url.value = testData.url;
    jobElement.appendChild(url);
    const saveButton = document.createElement('button');
    saveButton.id = 'saveData';
    jobElement.appendChild(saveButton);

    jobForm = new JobForm(jobElement);

    jobForm.utils.appendMessage = jest.fn();
  });

  describe('getOauth function', () => {
    it('should get the OAuth token', async () => {
      const oauth = await jobForm.getOauth();

      expect(oauth).toBeDefined();
    });

    it('should return the existing OAuth token', async () => {
      jobForm.oauth = 'test-token';
      const oauth = await jobForm.getOauth();

      expect(oauth).toBe('test-token');
    });
  });

  describe('updateForm function', () => {
    it('should update the form with the data from the website', () => {
      const formData = {
        jobTitle: 'New Software Engineer',
        company: 'New Company Inc.',
      };

      jobForm.updateForm(formData);

      expect(jobElement.querySelector('input[name="jobTitle"]').value).toBe(
          formData.jobTitle,
      );
      expect(jobElement.querySelector('input[name="company"]').value).toBe(
          formData.company,
      );
    });
  });

  /**
  describe('handleSubmit function', () => {
    beforeEach(() => {
      jobForm.fetchTotalJobsApplied = jest.fn();
      jobForm.fetchTotalJobsAppliedToday = jest.fn();
    });
    it('should submit the form data to the Google Sheet', async () => {
      fetch.mockResolvedValue(mockFetchResponse(testData));

      const appendValues = jest.spyOn(jobForm.oauth, 'appendValues');

      await jobForm.handleSubmit();

      expect(appendValues).toHaveBeenCalled();
    });

    it('should update the total jobs applied and total jobs applied today', async () => {
      fetch.mockResolvedValue(mockFetchResponse(testData));

      await jobForm.handleSubmit();

      expect(jobForm.fetchTotalJobsApplied).toHaveBeenCalled();
      expect(jobForm.fetchTotalJobsAppliedToday).toHaveBeenCalled();
    });

    it('should display an error message if the submission fails', async () => {
      fetch.mockResolvedValue({
        status: 400,
        statusText: 'Bad Request',
      });

      const consoleError = jest.spyOn(console, 'error');

      await jobForm.handleSubmit();

      expect(consoleError).toHaveBeenCalled();
    });
  });

  describe('fetchTotalJobsApplied function', () => {
    beforeEach(async () => {
      oauth = await jobForm.getOauth();
      oauth.getCellValues = jest.fn().mockResolvedValue({ values: [['1']] });
    });
    it('should fetch the total number of jobs applied', async () => {
      const totalJobsApplied = document.getElementById('totalJobsApplied');

      await jobForm.fetchTotalJobsApplied();

      expect(totalJobsApplied.textContent).toBe('1');
    });
  });

  describe('fetchTotalJobsAppliedToday function', () => {
    it('should fetch the total number of jobs applied today', async () => {
      document.body.innerHTML = `
      <div id="totalJobsAppliedToday">0</div>`;

      const totalJobsAppliedToday = document.getElementById(
        'totalJobsAppliedToday'
      );

      const response = {
        status: 200,
        json: async () => {
          return { values: [['1']] };
        },
      };

      await jobForm.fetchTotalJobsAppliedToday();

      expect(totalJobsAppliedToday.textContent).toBe('1');
    });
  });

  describe('loadData function', () => {
    it('should send the loadData action to chrome.tabs.sendMessage with appropriate data', async () => {
      const tabId = 12345;
      const message = { action: 'loadData' };
      const callback = () => {};

      global.chrome.tabs.sendMessage = jest
        .fn()
        .mockImplementation((tabId, message, callback) => {
          callback();
        });

      await jobForm.loadData(tabId);

      expect(global.chrome.tabs.sendMessage).toHaveBeenCalledWith(
        tabId,
        message,
        callback
      );
    });
  });
  */
});
