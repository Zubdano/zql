import { BASE_URL } from './constants';
import Requestor from './requestor';

const LOGIN_ROUTE = '/login';

const Permissions = {
  // Enum for permission
  EDITOR: 0,   // Can edit grammars
  WRITER: 1,   // Can write and submit sentences
  READER: 2,   // Can read their own sentences
}

// Class to handle authenticating the user
class Auth {
  login(username, password, callback) {
    if (localStorage.currentUser) {
      if (callback) callback(true);
      return;
    }
    const data = { username, password };
    new Requestor(BASE_URL).post(LOGIN_ROUTE, data)
      .then(json => {
        localStorage.currentUser = JSON.stringify(json);
        if (callback) callback(true);
      }).catch(error => {
        // Purposefully show same error for any status code
        if (callback) callback(false);
      });
  }

  logout(callback) {
    delete localStorage.currentUser;
    if (callback) callback(true);
  }

  get currentUser() {
    const currentUser = localStorage.currentUser;
    return !!currentUser ? JSON.parse(currentUser) : null;
  }

  get loggedIn() {
    return !!localStorage.currentUser;
  }
}

// Auth singleton
const auth = new Auth();

export {
  auth,
  Permissions,
};
