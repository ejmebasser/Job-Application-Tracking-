/**
 * OAuth class to handle Google OAuth2.0
 
 */
export default class OAuth {
  authToken = null;

  /**
   * Constructor for OAuth class
   */
  constructor() {
    this.initializeOAuth();
  }

  /**
   * We cannot use async/await in the constructor, so we use this function to ensure that the OAuth object is available and has been authorized.
   * We also set the authToken property.
   *
   * @return {string} The token string.
   */
  async setAuthToken() {
    const token = await this.getAuthToken();
    this.authToken = token;
    return token;
  }

  /**
   * We cannot use async/await in the constructor, so we use this function to ensure that the OAuth object is available and has been authorized.
   * We also set the authToken property if it is not already set.
   *
   * @return {OAuth} The OAuth object.
   */
  async initializeOAuth() {
    if (!this.authToken) {
      await this.setAuthToken();
    }

    return this;
  }

  /**
   * Function to get the authToken from chrome.identity.
   *
   * @return {Promise<string>} The OAuth token.
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
