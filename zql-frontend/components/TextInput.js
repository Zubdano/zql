import React, { Component } from 'react';
import { connect } from 'react-redux'
import { convertToRaw, ContentState, EditorState, Modifier, SelectionState } from 'draft-js';
import Editor from 'draft-js-plugins-editor';
import { Button } from 'react-materialize';
import { List, fromJS } from 'immutable';
import 'draft-js/dist/Draft.css';

import getSearchText from '../plugin/utils/getSearchText';
import './TextInput.scss';
import {
  clearAll,
  fetchAnnotation,
  fetchKeywords,
  keywordDecorator,
  setEditorState,
  setSearchValue,
  setSuggestions,
} from '../state/textInput';

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

  setEditorState(editorState) {
    // idk why I need to keep this in state but the plugin uses it for some reason (???)
    this.setState(editorState)
    this.props.setEditorState(editorState);
  }

  handleChange = (editorState) => {
    const oldContent = this.props.editorState.getCurrentContent();
    const newContent = editorState.getCurrentContent();
    if (oldContent !== newContent) {
      // content changed, need to refetch annotations
      // TODO: only fetch annotations for block that changed
      this.props.fetchAnnotation(newContent.getPlainText(' '));

      const currentSelectionState = editorState.getSelection();
      this.props.setSearchValue(getSearchText(editorState, currentSelectionState).word);
    }
    this.setEditorState(editorState);
  };

  handleSearchChange = () => {};

  handleSubmitClick = () => {
    const editorState = this.props.editorState;
    const contentState = editorState.getCurrentContent();
    const firstBlock = contentState.getFirstBlock();
    const lastBlock = contentState.getLastBlock();
    const allSelected = new SelectionState({
      anchorKey: firstBlock.getKey(),
      anchorOffset: 0,
      focusKey: lastBlock.getKey(),
      focusOffset: lastBlock.getLength(),
      hasFocus: true,
    });
    const clearContentState = Modifier.removeRange(contentState, allSelected, 'backward');
    const clearEditorState = EditorState.push(editorState, clearContentState, 'remove-range');
    const resetEditorState = EditorState.forceSelection(clearEditorState, clearContentState.getSelectionAfter());
    this.setEditorState(resetEditorState);
    this.props.clearAll();
  }

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
        <Button
          type="button"
          onClick={this.handleSubmitClick}
          disabled={this.props.status !== 'accept'}
        >Submit</Button>
      </div>
    );
  }
}

export default connect(({textInputReducer}) => textInputReducer, {
  clearAll,
  fetchAnnotation,
  fetchKeywords,
  setEditorState,
  setSearchValue,
  setSuggestions,
})(TextInput);
