import React, { Component } from 'react';
import { connect } from 'react-redux'
import { fromJS, List, Map } from 'immutable';
import './GrammarEditor.scss'

import { changeInputFields, fetchGrammar, submitGrammar } from '../state/grammar';

let InputFieldTypeEnum = {
  VARIABLE: 'vars',
  ENUM: 'enums',
  LHS: 'lhs',
}

class GrammarEditor extends Component {
  componentDidMount() {
    this.props.fetchGrammar();
  }

  addOr(type, index) {
    let numVals = this.props.inputFields.get(type).get(index).get("value").size;
    let newInputFields = this.props.inputFields.setIn([type, index, "value", numVals], "");
    this.props.changeInputFields(newInputFields);
  }

  addRow(type) {
    let listSize = this.props.inputFields.get(type).size;
    let newInputFields = this.props.inputFields.setIn([type, listSize], fromJS({"key": "", "value": [""]}));
    this.props.changeInputFields(newInputFields);
  }

  changeGrammar() {
    //check if all values are non empty
    // let isEmpty = false;
    // let blankInputs = this.props.inputFields.map((type) =>{
    //   return type.map((row) => {
    //     return row.get('value').map((value) => {
    //       if (value == "" || row.get('key') == "") 
    //         isEmpty = true;
    //     });
    //   });
    // });
    // if (isEmpty) {
    //   this.setState({
    //     hasError: true,
    //   });
    // } else {
    //   console.log('grammar submitted');
    // }
    this.props.submitGrammar(this.props.inputFields);
  }

  inputFieldChange(index, type, keyOrValue, valIndex, e) {
    let newInputFields;
    if (keyOrValue == "key") {
      newInputFields = this.props.inputFields.setIn([type, index, "key"], e.target.value);
    } else {
      newInputFields = this.props.inputFields.setIn([type, index, "value", valIndex], e.target.value);
    }
    this.props.changeInputFields(newInputFields);
  }

  oneOrMore(type, index, e) {
    let newInputFields = this.props.inputFields.setIn([type, index, "oneOrMore"], e.target.checked);
    this.props.changeInputFields(newInputFields);
  }

  removeOr(type, index, valIndex) {
    let newValueRow = this.props.inputFields.get(type).get(index).get("value").delete(valIndex);
    let newInputFields = this.props.inputFields.setIn([type, index, "value"], newValueRow);
    this.props.changeInputFields(newInputFields);
  }

  renderEnums() {
    return (
      <div className="Grammar-editor-type-group">
        <div><span className='Grammar-editor-title-span'>Enum names:</span><span className='Grammar-editor-title-span'>Values:</span><span>One or more:</span></div>
        {this.props.inputFields.get('enums').map((row, index) => {
          let mappedValues = row.get('value').map((val, valIndex) => {
            return (
              <span>
                <input className='Grammar-editor-input-value' value={val} onChange={this.inputFieldChange.bind(this, index, InputFieldTypeEnum.ENUM, "value", valIndex)} />
                <button className='Grammar-editor-add-or' onClick={this.addOr.bind(this, InputFieldTypeEnum.ENUM, index)}> OR </button>
                {row.get('value').size > 1
                  ? <button className='Grammar-editor-remove-or' onClick={this.removeOr.bind(this, InputFieldTypeEnum.ENUM, index, valIndex)}> X </button>
                  : null
                }
              </span>
            );
          });
          return (
            <div>
              <input className='Grammar-editor-input-key' value={row.get('key')} onChange={this.inputFieldChange.bind(this, index, InputFieldTypeEnum.ENUM, "key", -1)} />
              {mappedValues}
              <input type="checkbox" onChange={this.oneOrMore.bind(this, InputFieldTypeEnum.ENUM, index)} />
            </div>
          );
        })}
        <div><button className="Grammar-editor-add-row-button" onClick={this.addRow.bind(this, InputFieldTypeEnum.ENUM)}> Add a row </button></div>
      </div>
    );
  }

  renderLhs() {
    return (
      <div className="Grammar-editor-type-group">
        <div><span className='Grammar-editor-title-span'>Rule names:</span><span>Rule definition:</span></div>
        {this.props.inputFields.get('lhs').map((row, index) => {
          let mappedValues = row.get('value').map((val, valIndex) => {
            return (
              <span>
              <input className='Grammar-editor-input-value' value={val} onChange={this.inputFieldChange.bind(this, index, InputFieldTypeEnum.LHS, "value", valIndex)} />
              <button className='Grammar-editor-add-or' onClick={this.addOr.bind(this, InputFieldTypeEnum.LHS, index)}> OR </button>
              {row.get('value').size > 1
                ? <button className='Grammar-editor-remove-or' onClick={this.removeOr.bind(this, InputFieldTypeEnum.LHS, index, valIndex)}> X </button>
                : null
              }
              </span>
            );
          });
          return (
            <div>
              <input className='Grammar-editor-input-key' value={row.get('key')} onChange={this.inputFieldChange.bind(this, index, InputFieldTypeEnum.LHS, "key", -1)} />
              {mappedValues}
            </div>
          );
        })}
        <div><button className="Grammar-editor-add-row-button" onClick={this.addRow.bind(this, InputFieldTypeEnum.LHS)}> Add a row </button></div>
      </div>
    );
  }

  renderVars() {
    return (
      <div className="Grammar-editor-type-group">
        <div><span className='Grammar-editor-title-span'>Variable names:</span><span className='Grammar-editor-title-span'>Regex:</span><span>One or more:</span></div>
        {this.props.inputFields.get('vars').map((row, index) => {
          return (
            <div>
              <input className='Grammar-editor-input-key' value={row.get('key')} onChange={this.inputFieldChange.bind(this, index, InputFieldTypeEnum.VARIABLE, "key", -1)} />
              <input className='Grammar-editor-input-value' value={row.get('value').get(0)} onChange={this.inputFieldChange.bind(this, index, InputFieldTypeEnum.VARIABLE, "value", 0)} />
              <input type="checkbox" onChange={this.oneOrMore.bind(this, InputFieldTypeEnum.VARIABLE, index)} />
            </div>
          );
        })}
        <div><button className="Grammar-editor-add-row-button" onClick={this.addRow.bind(this, InputFieldTypeEnum.VARIABLE)}> Add a row </button></div>
      </div>
    );
  }

  render() {
    return (
      <div className="Grammar-editor">
        {this.renderVars()}
        {this.renderEnums()}
        {this.renderLhs()}
        <button className="Grammar-editor-submit-button" onClick={this.changeGrammar.bind(this)}>Change Grammar</button>
        {this.props.hasError
          ? <div>Erroneous input</div>
          : null
        }
      </div>
    );
  }
}

export default connect(({grammarReducer}) => grammarReducer, {
  changeInputFields,
  fetchGrammar,
  submitGrammar,
})(GrammarEditor);

//TODO
//4. Escape strings
//5. Send request
//6. Preload grammar with current grammar
