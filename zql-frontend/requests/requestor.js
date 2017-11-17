import fetch from 'isomorphic-fetch';

import { auth } from './auth';

class Requestor {

  constructor(serverUrl) {
    this.serverUrl = serverUrl;
  }

  _makeRequest(route, fetchParams) {
    if (auth.loggedIn) {
      fetchParams.headers.append('Token', auth.currentUser.token);
    }

    return fetch(route, fetchParams).then((response) => {
      if (!response.ok) throw Error(response.json().then().error)
      return response.json();
    });
  }

  get(endpoint) {
    const fetchParams = {
      method: 'GET',
      headers: new Headers({
        'Content-Type': 'text/plain',
      }),
    };

    return this._makeRequest(this.serverUrl + endpoint, fetchParams)
  }

  post(endpoint, data) {
    const fetchParams = {
      method: 'POST',
      body: JSON.stringify(data),
      headers: new Headers({
        'Content-Type': 'application/json',
      }),
    };
    return this._makeRequest(this.serverUrl + endpoint, fetchParams)
  }
};

export default Requestor;
