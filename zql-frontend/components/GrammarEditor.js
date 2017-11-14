/* 
 * This is the grammar editor component. Users define grammars using this component. 
 * Each lhs has an rhs. The properties of the rhs are multiplicity (oneOrMore) and the rules 'value'
 * We allow rhs to be or'd together to form an lhs - this is done through the button that calls addOr
 * Before submitting the grammar, we convert to a form that is best for the backend to use.
 * This involves finding which lhs rules are variables and which are not - done by checking which values
 * are arrays of length 1 AND consist of a valid regex
*/

import React, { Component } from 'react';
import { connect } from 'react-redux'
import { fromJS, List, Map } from 'immutable';
import './GrammarEditor.scss'

import { changeInputFields, fetchGrammar, submitGrammar } from '../state/grammar';

const InputFieldTypeEnum = {
  VAR: 'variable',
  LHS: 'rule',
}

const emptyRow = {key: "", oneOrMore: false, value: [""]};

class GrammarEditor extends Component {
  // fetch initial grammar / use default value if none exists
  componentDidMount() {
    this.props.fetchGrammar();
    if (this.props.inputFields.size == 0) {
      let newInputFields = this.props.inputFields.set(0, fromJS(emptyRow));
      this.props.changeInputFields(newInputFields);
    }
  }

  // add a new or value to rhs of given lhs index
  addOr(index) {
    let numVals = this.props.inputFields.get(index).get('value').size;
    let newInputFields = this.props.inputFields.setIn([index, 'value', numVals], "");
    this.props.changeInputFields(newInputFields);
  }

  // add new input fields for a new row
  addRow() {
    let listSize = this.props.inputFields.size;
    let newInputFields = this.props.inputFields.set(listSize, fromJS(emptyRow));
    this.props.changeInputFields(newInputFields);
  }

  // check that there are no illicit chars/empty strings on lhs
  isGrammarValid() {
    const illegalChars = /[!@#$%^&*()+\-=\[\]{};':"\\|,.<>\/?]/;
    let invalidRules = this.props.inputFields.filter((rule) => {
      let emptyValue = rule.get('value').filter((val) => {
        return val == '';
      });
      return rule.get('key').match(illegalChars) || rule.get('key') == '' || emptyValue.size > 0;
    });

    if (invalidRules.size > 0) return false;
    return true;
  }

  // if more than one value or rhs is an lhs rule then or value is not a valid regex then lhs is rule else variable
  getType(row) {
    let type = InputFieldTypeEnum.VAR;
    if (row.get('value').size > 1) return InputFieldTypeEnum.LHS;

    let value = row.get('value').get(0);

    let inLHS = this.props.inputFields.filter((rule) => {
      return rule.get('key') == value;
    });

    if (inLHS.size > 0) return InputFieldTypeEnum.LHS;

    try {
      new RegExp(value);
    } catch (e) {
      type = InputFieldTypeEnum.LHS;
    }

    return type;
  }

  getSubmissionGrammar() {
    let submissionGrammar = fromJS({});

    this.props.inputFields.map((row) => {
      let type = this.getType(row);
      submissionGrammar = submissionGrammar.set(row.get('key'), fromJS({ type: type, oneOrMore: row.get('oneOrMore'), value: row.get('value') }))
    });
    return submissionGrammar;
  }

  // send the grammar to the backend
  changeGrammar() {
    if (!this.isGrammarValid()) {
      // change isError state

      return;
    }
    let dataToSubmit = this.getSubmissionGrammar();
    debugger;
    this.props.submitGrammar(this.props.inputFields);
  }

  // change input as user types in an input field
  inputFieldChange(index, keyOrValue, valIndex, e) {
    let newInputFields;
    if (keyOrValue == "key") {
      newInputFields = this.props.inputFields.setIn([index, "key"], e.target.value);
    } else {
      newInputFields = this.props.inputFields.setIn([index, "value", valIndex], e.target.value);
    }
    this.props.changeInputFields(newInputFields);
  }

  // change multiplicity of a rule
  oneOrMore(index, e) {
    let newInputFields = this.props.inputFields.setIn([index, "oneOrMore"], e.target.checked);
    this.props.changeInputFields(newInputFields);
  }

  // remove an or rule from rhs
  removeOr(index, valIndex) {
    let newValueRow = this.props.inputFields.get(index).get('value').delete(valIndex);
    let newInputFields = this.props.inputFields.setIn([index, 'value'], newValueRow);
    this.props.changeInputFields(newInputFields);
  }

  // remove the last rule
  removeRow() {
    let removeIndex = this.props.inputFields.size - 1;
    let newInputFields = this.props.inputFields.delete(removeIndex);
    this.props.changeInputFields(newInputFields);
  }

  renderLhs() {
    return (
      <div className="Grammar-editor-type-group">
        <div><span className='Grammar-editor-title-span'>Rule names:</span><span>Rule definition:</span></div>
        {this.props.inputFields.valueSeq().map((row, index) => { // map through list of lhs rules
          let mappedValues = row.get('value').map((val, valIndex) => { // map through list of rhs values
            return (
              <span key={valIndex}> 
              <input className='Grammar-editor-input-value' value={val} onChange={this.inputFieldChange.bind(this, index, "value", valIndex)} />
              <button className='Grammar-editor-add-or' onClick={this.addOr.bind(this, index)}> OR </button>
              {row.get('value').size > 1
                ? <button className='Grammar-editor-remove-or' onClick={this.removeOr.bind(this, index, valIndex)}> X </button>
                : null
              }
              </span>
            );
          });
          return (
            <div key={index}>
              <input className='Grammar-editor-input-key' value={row.get('key')} onChange={this.inputFieldChange.bind(this, index, "key", -1)} />
                {mappedValues}
              <input type="checkbox" onChange={this.oneOrMore.bind(this, index)} />
            </div>
          );
        })}
        <div><button className="Grammar-editor-add-row-button" onClick={this.addRow.bind(this)}> Add a row </button></div>
        {this.props.inputFields.size > 1
          ? <div><button className="Grammar-editor-remove-row-button" onClick={this.removeRow.bind(this)}> Remove a row </button></div>
          : null
        }
      </div>
    );
  }

  render() {
    return (
      <div className="Grammar-editor">
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
//3. In submit get which are vars and which are not - try catch new regexp
//4. Get which are lhs rules
//5. All else are hardcoded strings
