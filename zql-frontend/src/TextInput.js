import React, { Component } from 'react';
import "./TextInput.css";


class TextInput extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: 'Please no cance',
    };
  }

  handleChange = event => {
    this.setState({value: event.target.value});
    console.log(`input changed to '${event.target.value}'`);
  };

  handleClick = () => {
    console.log(`input submitted '${this.state.value}'`);
  };

	render() {
    // TODO: Make textbox and button pretty
    return (
      <div>
        <textarea
          className="TextInput"
          type="text"
          value={this.state.value}
          onChange={this.handleChange}
        />
        <button onClick={this.handleClick}>Submit</button>
      </div>
    );		
	}
}

export default TextInput;
