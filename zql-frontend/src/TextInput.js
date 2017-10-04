import React, { Component } from 'react';
import { connect } from 'react-redux'
import { Editor } from 'draft-js';

import './TextInput.css';
import { fetchAnnotation, setEditorState } from './reducer';


class TextInput extends Component {
  handleChange = editorState => {
    this.props.fetchAnnotation(editorState.getCurrentContent().getPlainText(' '));
    this.props.setEditorState(editorState);
  }

	render() {
    return (
      <div>
        <Editor
          editorState={this.props.editorState}
          onChange={this.handleChange}
        />
      </div>
    );
	}
}

export default connect(state => state, {fetchAnnotation, setEditorState})(TextInput);
