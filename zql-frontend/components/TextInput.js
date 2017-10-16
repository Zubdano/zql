import React, { Component } from 'react';
import { connect } from 'react-redux'
import { convertToRaw, EditorState } from 'draft-js';
import Editor from 'draft-js-plugins-editor';
import { List, fromJS } from 'immutable';
import 'draft-js/dist/Draft.css';

import getSearchText from '../plugin/utils/getSearchText';
import './TextInput.scss';
import {
  fetchAnnotation,
  fetchKeywords,
  keywordDecorator,
  setEditorState,
  setSearchValue,
  setSuggestions,
} from '../reducer';

class TextInput extends Component {
  constructor(props) {
    super(props);

    this.state = {
      editorState: props.editorState,
    };
  }

  componentDidMount() {
    this.props.fetchKeywords();
  }

  handleChange = (editorState) => {
    // idk why I need to keep this in state but the plugin uses it for some reason (???)
    this.setState(editorState)

    const oldContent = this.props.editorState.getCurrentContent();
    const newContent = editorState.getCurrentContent();
    if (oldContent !== newContent) {
      // content changed, need to refetch annotations
      // TODO: only fetch annotations for block that changed
      this.props.fetchAnnotation(newContent.getPlainText(' '));

      const currentSelectionState = editorState.getSelection();
      this.props.setSearchValue(getSearchText(editorState, currentSelectionState).word);
    }
    this.props.setEditorState(editorState);
  };

  handleSearchChange = () => {};

  logState = () => {
    const content = this.props.editorState.getCurrentContent();
    console.log(convertToRaw(content));
  };

  focus = () => this.refs.editor.focus();

  render() {
    const { CompletionSuggestions } = this.props.autocompletePlugin;
    const plugins = [this.props.autocompletePlugin];

    return (
      <div className='textInput'>
        <div className='editor' onClick={this.focus} >
          <Editor
            editorState={this.props.editorState}
            onChange={this.handleChange}
            plugins={plugins}
            decorators={[keywordDecorator]}
            spellCheck
            stripPastedStyles
            placeholder='Enter some text, with a # to see the issue autocompletion'
            ref='editor'
          />
          <CompletionSuggestions
            onSearchChange={this.handleSearchChange}
            suggestions={this.props.suggestions}
          />
        </div>
        <div className={`statusText-${this.props.status || 'incomplete'}`}>{this.props.status || 'incomplete'}</div>
        <input
          className="submitButton"
          type="button"
          value="Submit"
          disabled={this.props.status !== 'accept'}
        />
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

export default connect(state => state, {
  fetchAnnotation,
  fetchKeywords,
  setEditorState,
  setSearchValue,
  setSuggestions,
})(TextInput);
