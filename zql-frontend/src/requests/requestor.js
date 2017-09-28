class Requestor {

  constructor(serverUrl) {
    this.serverUrl = serverUrl;
  }

  get(endpoint, params) {
    const fetchParams = {
      method: 'GET',
      headers: new Headers({
        'Content-Type': 'text/plain',
      }),
      mode: 'cors',
    };

    return fetch(this.serverUrl + endpoint, fetchParams).then((response) => response.json());
  }

  post(endpoint, params) {
    const fetchParams = {
      method: 'POST',
    };
    return fetch(this.serverUrl + endpoint, fetchParams).then((response) => response.json());
  }
};

module.exports = Requestor;
