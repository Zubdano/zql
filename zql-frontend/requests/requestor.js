import fetch from 'isomorphic-fetch';

class Requestor {

  constructor(serverUrl) {
    this.serverUrl = serverUrl;
  }

  get(endpoint) {
    const fetchParams = {
      method: 'GET',
      headers: new Headers({
        'Content-Type': 'text/plain',
      }),
    };
    return fetch(this.serverUrl + endpoint, fetchParams).then((response) => response.json());
  }

  post(endpoint, data) {
    const fetchParams = {
      method: 'POST',
      body: JSON.stringify(data),
      headers: new Headers({
        'Content-Type': 'application/json',
      }),
    };
    return fetch(this.serverUrl + endpoint, fetchParams).then((response) => response.json());
  }
};

export default Requestor;
