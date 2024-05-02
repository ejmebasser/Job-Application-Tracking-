/**
 * OAuth class to handle Google OAuth2.0
 
 */
export default class OAuth {
  /**
   * Constructor for OAuth class
   */
  constructor() {
    this.getOAuth();
    this.searchFile = this.getSheets.bind(this);
  }

  /**
   * We cannot use async/await in the constructor, so we use this function to ensure that the OAuth object is available and has been authorized.
   * We also set the authToken property.
   *
   * I really don't like this. It seems like a poor singleton attempt.
   * There is probably a better way to handle this.
   *
   * @return {OAuth} The OAuth object.
   */
  async getOAuth() {
    this.authToken = await this.getAuthToken();
    return this;
  }

  /**
   * Function to get the authToken from chrome.identity.
   *
   * @return {string} The OAuth token.
   */
  getAuthToken() {
    return new Promise((resolve, reject) => {
      chrome.identity.getAuthToken({ interactive: true }, function (token) {
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError.message);
          reject(chrome.runtime.lastError.message);
        } else {
          resolve(token);
        }
      });
    });
  }
}
