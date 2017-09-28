import Requestor from './requests/requestor';
import React, { Component } from 'react';

class HttpButton extends Component {
  onClick() {
    const req = new Requestor('http://localhost:5000')
    req.get('/').then((data) => console.log(data));
  }

  render() {
    return (
      <button onClick={this.onClick}>
        Hi
      </button>
    );
  }
};

export default HttpButton;
