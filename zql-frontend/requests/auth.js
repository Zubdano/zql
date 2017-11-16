import { BASE_URL } from './constants';
import requestor from './requestor';

// Class to handle authenticating the user
class Auth {
  login(email, pass, callback) {
    if (localStorage.token) {
      if (callback) callback(true);
      return;
    }
    new Requestor()
    apiClient.login(email, pass, data => {
      localStorage.token = data.api_key;
      if (callback) callback(true);
    }, res => {
      // Purposefully show same error for any status code
      if (callback) callback(false);
    });
  }

  logout(callback) {
    delete localStorage.token;
    if (callback) callback(true);
  }

  get token() {
    return localStorage.token;
  }

    get loggedIn() {
      return !!localStorage.token;
    }
}

// Auth singleton
const auth = new Auth();

export default auth;

