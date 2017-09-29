import React, { Component } from 'react';
import { connect } from 'react-redux'

import './TextInput.css';
import { fetchAnnotation, updateSentenceText } from './reducer';


class TextInput extends Component {

  handleChange = event => {
    console.log(`input changed to '${event.target.value}'`);
    this.props.updateSentenceText(event.target.value);
    this.props.fetchAnnotation(this.props.sentence);
  };

  handleClick = () => {
    console.log(this.state.sentence);
  };

  getText() {
    return this.props.sentence.words.map(word => word.text).join(' ');
  }

	render() {

    console.log(this.props);
    // TODO: Make textbox and button pretty
    return (
      <div>
        <textarea
          className="TextInput"
          type="text"
          onChange={this.handleChange}
        />
        <button onClick={this.handleClick}>Submit</button>
        <div>{this.getText()}</div>
      </div>
    );
	}
}

export default connect(state => state, {fetchAnnotation, updateSentenceText})(TextInput);
