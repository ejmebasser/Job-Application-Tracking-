import JobForm from '../../src/popup/jobForm.js';

let jobForm;
let jobElement;

describe('JobForm', () => {
  beforeEach(() => {
    jobElement = document.createElement('form');
    jobElement.setAttribute('id', 'jobForm');

    jobForm = new JobForm(jobElement);
  });

  afterEach(() => {
    jobElement.children.foreach((child) => child.remove());
  });

  describe('updateForm function', () => {
    it('should update the form with the data from the website', () => {
      jobElement.innerHTML = `
        <input type="text" name="jobTitle" />
        <input type="text" name="company" />
      `;

      const formData = {
        jobTitle: 'Software Engineer',
        company: 'Company Inc.',
      };

      jobForm.updateForm(formData);

      expect(jobElement.querySelector('input[name="jobTitle"]').value).toBe(
        'Software Engineer'
      );
      expect(jobElement.querySelector('input[name="company"]').value).toBe(
        'Company Inc.'
      );
    });
  });

  describe('formToJson function', () => {
    it('should convert the form to a JSON object', () => {
      jobForm.innerHTML = `
        <input type="text" name="jobTitle" value="Software Engineer" />
        <input type="text" name="company" value="Company Inc." />
        `;

      const formData = jobForm.formToJson();

      expect(formData).toEqual({
        jobTitle: 'Software Engineer',
        company: 'Company Inc.',
      });
    });
  });

  describe('handleSubmit function', () => {
    it('should submit the form data to the Google Sheet', async () => {
      document.body.innerHTML = `
      <form id="testForm">
        <input type="text" name="jobTitle" value="Software Engineer" />
        <input type="text" name="company" value="Company Inc." />
        <button id="saveData">Save</button>
      </form>`;

      const form = document.getElementById('testForm');

      const saveButton = form.querySelector('#saveData');
      const saveButtonSpy = jest.spyOn(saveButton, 'textContent', 'set');

      await jobForm.handleSubmit();

      expect(saveButtonSpy).toHaveBeenCalledWith('Submitting...');
    });
  });

  describe('fetchTotalJobsApplied function', () => {
    it('should fetch the total number of jobs applied', async () => {
      document.body.innerHTML = `
      <div id="totalJobsApplied">0</div>`;

      const totalJobsApplied = document.getElementById('totalJobsApplied');

      const response = {
        status: 200,
        json: async () => {
          return { values: [['1']] };
        },
      };

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
});
