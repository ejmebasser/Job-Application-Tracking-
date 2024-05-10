import OAuth from './oauth';

export default class User extends OAuth {
  constructor() {
    super();
  }

  /**
   * Get the email of the authenticated user.
   *
   * @return {string} The email of the authenticated user.
   */
  async getUserEmail() {
    // we should have this information already since we are using chrome.identity
    const currentUser = chrome.identity.getProfileUserInfo();
    // console.log(currentUser);
    return currentUser.email;

    // const userInfoUrl = 'https://www.googleapis.com/oauth2/v2/userinfo';
    // try {
    //   const response = await fetch(userInfoUrl, {
    //     headers: {
    //       Authorization: 'Bearer ' + this.authToken,
    //     },
    //   });
    //   if (!response.ok) {
    //     throw new Error('Failed to fetch user info');
    //   }
    //   const userInfo = await response.json();
    //   return userInfo.email; // This assumes you want to use the email as the username
    // } catch (error) {
    //   console.error('Error fetching user info:', error);
    //   throw error;
    // }
  }

  /**
   * Get the unique identifier of the authenticated user.
   *
   * @return {string} The unique identifier of the authenticated user.
   */
  async getInfo() {
    const currentUser = chrome.identity.getProfileUserInfo();
    return currentUser.info;
  }
}
