import React, { Component } from 'react';
import { connect } from 'react-redux'
import { convertToRaw, Editor } from 'draft-js';
import 'draft-js/dist/Draft.css';

import './TextInput.css';
import { fetchAnnotation, setEditorState } from './reducer';

class TextInput extends Component {

  handleChange = (editorState) => {
    const oldContent = this.props.editorState.getCurrentContent();
    const newContent = editorState.getCurrentContent();
    if (oldContent !== newContent) {
      // content changed, need to refetch annotations
      // TODO: only fetch annotations for block that changed
      this.props.fetchAnnotation(newContent.getPlainText(' '));
    }
    this.props.setEditorState(editorState);
  };

  logState = () => {
    const content = this.props.editorState.getCurrentContent();
    console.log(convertToRaw(content));
  };

  focus = () => this.refs.editor.focus();

  render() {
    return (
      <div className="textInput">
        <div className="editorContainer" onClick={this.focus}>
          <Editor
            editorState={this.props.editorState}
            onChange={this.handleChange}
            placeholder="Enter some text..."
            ref="editor"
          />
        </div>
        <input
          onClick={this.logState}
          className="logStateButton"
          type="button"
          value="Log State"
        />
      </div>
    );
  }
}

export default connect(state => state, {fetchAnnotation, setEditorState})(TextInput);
