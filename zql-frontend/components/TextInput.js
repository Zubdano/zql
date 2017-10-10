import React, { Component } from 'react';
import { connect } from 'react-redux'
import { convertToRaw, EditorState } from 'draft-js';
import Editor from 'draft-js-plugins-editor';
import { List, fromJS } from 'immutable';
import 'draft-js/dist/Draft.css';

import createIssueSuggestionPlugin, { defaultSuggestionsFilter } from '../plugin';
import './TextInput.scss';
import {
  fetchAnnotation,
  fetchKeywords,
  setEditorState,
} from '../reducer';

const issueSuggestionPlugin = createIssueSuggestionPlugin();
const { CompletionSuggestions } = issueSuggestionPlugin;
const plugins = [issueSuggestionPlugin];

const suggestions = fromJS([
  {
    id: 1,
    subject: 'New Cool Feature',
  },
  {
    id: 2,
    subject: 'Bug',
  },
  {
    id: 3,
    subject: 'Improve Documentation',
  },
]);

class TextInput extends Component {
  constructor(props) {
    super(props);

    this.state = {
      editorState: EditorState.createEmpty(),
      suggestions: List(),
    };
  }

  componentDidMount() {
    this.props.fetchKeywords();
  }

  handleChange = (editorState) => {
    this.setState({editorState});

    const oldContent = this.props.editorState.getCurrentContent();
    const newContent = editorState.getCurrentContent();
    if (oldContent !== newContent) {
      // content changed, need to refetch annotations
      // TODO: only fetch annotations for block that changed
      this.props.fetchAnnotation(newContent.getPlainText(' '));
    }
    this.props.setEditorState(editorState);
  };

  handleSearchChange = ({ value }) => {
    const searchValue = value.substring(1, value.length);
    this.setState({
      suggestions: defaultSuggestionsFilter(searchValue, suggestions),
    });
  };

  logState = () => {
    const content = this.props.editorState.getCurrentContent();
    console.log(convertToRaw(content));
  };

  focus = () => this.refs.editor.focus();

  render() {
    return (
      <div className='textInput'>
        <div className='editor' onClick={this.focus} >
          <Editor
            editorState={this.state.editorState}
            onChange={this.handleChange}
            plugins={plugins}
            spellCheck
            stripPastedStyles
            placeholder='Enter some text, with a # to see the issue autocompletion'
            ref='editor'
          />
          <CompletionSuggestions
            onSearchChange={this.handleSearchChange}
            suggestions={this.state.suggestions}
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

export default connect(state => state, {
  fetchAnnotation,
  fetchKeywords,
  setEditorState,
})(TextInput);
