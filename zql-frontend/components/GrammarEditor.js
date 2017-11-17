//Assumptions
// - user will not enter something like: patient - [a-zA-Z] asdf
// - user will enter the key before a value
// - primary key can only be a variable and a single variable

import React, { Component } from 'react';
import { connect } from 'react-redux'
import { fromJS, List, Map } from 'immutable';
import './GrammarEditor.scss'

import { changeInputFields, changeRules, changeVariables, fetchGrammar, submitGrammar } from '../state/grammar';

const InputFieldTypeEnum = {
  VAR: 'variable',
  LHS: 'rule',
}

const emptyRow = {key: "", oneOrMore: false, isPrimary: false, value: [[""]]};

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
  addOr(ruleIndex, e) {
    let numVals = this.props.inputFields.get(ruleIndex).get('value').size;
    let newInputFields = this.props.inputFields.setIn([ruleIndex, "value", numVals], fromJS([""]));
    this.props.changeInputFields(newInputFields);
  }

  // add new input fields for a new row
  addRow() {
    let listSize = this.props.inputFields.size;
    let newInputFields = this.props.inputFields.set(listSize, fromJS(emptyRow));
    this.props.changeInputFields(newInputFields);
  }

  // if more than one value or rhs is an lhs rule then or value is not a valid regex then lhs is rule else variable
  getType(row) {
    let type = InputFieldTypeEnum.VAR;

    if (row.get('value').get(0).last() == "") {
      row = row.setIn(['value', 0], row.get('value').get(0).delete(1));
    }

    if (row.get('value').size > 1 || row.get('value').get(0).size > 1) return InputFieldTypeEnum.LHS;

    let value = row.get('value').get(0).get(0);

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
    //remove all empty values
    this.props.inputFields.map((row) => {
      let type = this.getType(row);
      let numTokensInLastRow = row.get('value').last().size;
      let newValues = row.get('value');

      if (row.get('value').last().last() == "") {
        newValues = row.setIn(['value', row.get('value').size - 1], row.get('value').last().pop()).get('value');
      }
      submissionGrammar = submissionGrammar.set(row.get('key'), fromJS({ type: type, oneOrMore: row.get('oneOrMore'), row.get('isPrimary'), value: newValues }))
    });
    return submissionGrammar;
  }

  // send the grammar to the backend
  changeGrammar() {
    let dataToSubmit = this.getSubmissionGrammar();
    dataToSubmit = fromJS({grammar: dataToSubmit});
    this.props.submitGrammar(dataToSubmit.toJS(), this.props.id);
  }

  detectKeyPress(index, valIndex, e) {
      if (e.key == 'Enter') {
        this.inputEnter(index, valIndex, e);
        e.preventDefault();
      } else if (e.key == '|') {
        e.preventDefault();
        this.addOr(index, e);
      }
  }

  getValueOfVariable(variable) {
    let rule = this.props.inputFields.find((row) => {
      return row.get('key') == variable;
    });

    return rule.get('value').first().first();
  }

  // change input as user types in an input field
  inputFieldChange(index, keyOrValue, valIndex, e) {
    let newInputFields;

    if (keyOrValue == "key") {
      let oldKey = this.props.inputFields.get(index).get('key');

      // remove old value from rules and insert new value
      if (this.props.rules.includes(oldKey)) {
        let newRulesSet = this.props.rules.delete(oldKey);
        newRulesSet = newRulesSet.add(e.target.value);
        this.props.changeRules(newRulesSet); 
      }

      // remove old value from variables and insert new value
      if (this.props.variables.includes(oldKey)) {
        let newVariablesSet = this.props.variables.delete(oldKey);
        newVariablesSet = newVariablesSet.add(e.target.value);
        this.props.changeVariables(newVariablesSet); 
      }
      
      newInputFields = this.props.inputFields.setIn([index, "key"], e.target.value);
    } else {
      let valSize = this.props.inputFields.get(index).get('value').get(valIndex).size;
      newInputFields = this.props.inputFields.setIn([index, "value", valIndex, valSize - 1], e.target.value);
    }

    this.props.changeInputFields(newInputFields);
  }

  inputEnter(ruleIndex, valIndex, e) {
    let valSize = this.props.inputFields.get(ruleIndex).get('value').get(valIndex).size;

    let newInputFields = this.props.inputFields.setIn([ruleIndex, "value", valIndex, valSize], "");
    let newVariablesSet = this.props.variables;
    let newRulesSet = this.props.rules;
    // if first val and isRegex add to list of variables
    if (this.getType(newInputFields.get(ruleIndex)) == InputFieldTypeEnum.VAR) {
      newVariablesSet = this.props.variables.add(newInputFields.get(ruleIndex).get('key'));
    } else {
      let keyVal = newInputFields.get(ruleIndex).get('key');

      // if key was variable, it is now a rule.
      if (this.props.variables.includes(keyVal)) {
        newVariablesSet = this.props.variables.delete(keyVal);
      }

      newRulesSet = this.props.rules.add(keyVal);
    }

    // probably a better way to do this but too tired
    let newKey = newInputFields.get(ruleIndex).get('key');
    newInputFields.map((row) => {
      if (this.props.variables.includes(row.get('key')) && this.getValueOfVariable(row.get('key')) == newKey && row.get('key') != newKey) {
        newVariablesSet = newVariablesSet.delete(row.get('key'));
        newRulesSet = newRulesSet.add(row.get('key'));
      }
    });
    
    this.props.changeRules(newRulesSet);
    this.props.changeInputFields(newInputFields);
    this.props.changeVariables(newVariablesSet);
  }

  // change multiplicity of a rule
  oneOrMore(index, e) {
    let newInputFields = this.props.inputFields.setIn([index, "oneOrMore"], e.target.checked);
    this.props.changeInputFields(newInputFields);
  }

  // make this key primary
  makePrimary(index, e) {
    let newInputFields = this.props.inputFields.setIn([index, "isPrimary"], e.target.checked);
    this.props.changeInputFields(newInputFields);
  }

  // remove the last rule
  removeRow(removeIndex) {
    let newInputFields = this.props.inputFields.delete(removeIndex);
    this.props.changeInputFields(newInputFields);
  }

  // remove a word from rhs
  removeWord(ruleIndex, valIndex, wordIndex) {
    let newValueRow = this.props.inputFields.get(ruleIndex).get('value').get(valIndex).delete(wordIndex);
    let newInputFields = this.props.inputFields.setIn([ruleIndex, 'value', valIndex], newValueRow);

    // bug when you have an or and you remove most recent or'd values
    if (newValueRow.size == 0 || (newValueRow.size == 1 && newValueRow.get(0) == "")) {
      newValueRow = this.props.inputFields.get(ruleIndex).get('value').delete(valIndex);
      if (newValueRow.size == 0 && this.props.inputFields.get(ruleIndex).get('value').size == 1) {
        newValueRow = newValueRow.push("");
        newInputFields = this.props.inputFields.setIn([ruleIndex, 'value', valIndex], newValueRow);
      } else {
        newInputFields = this.props.inputFields.setIn([ruleIndex, 'value'], newValueRow);
      }
    }

    // if regex removed from variable, remove variable from list of variables
    let keyOfRemovedWord = this.props.inputFields.get(ruleIndex).get('key')
    if (this.props.variables.includes(keyOfRemovedWord)) {
      let newVariablesSet = this.props.variables.delete(keyOfRemovedWord);
      this.props.changeVariables(newVariablesSet);
    } else {
      let newRulesSet = this.props.rules.delete(keyOfRemovedWord);
      this.props.changeRules(newRulesSet);
    }

    this.props.changeInputFields(newInputFields);
  }

  renderLhs() {
    return (
      <div className="Grammar-editor-type-group">
        <div className='Grammar-editor-title-div'><span className='Grammar-editor-title-span'>Rule names:</span><span>Rule definition:</span></div>
        {this.props.inputFields.valueSeq().map((row, index) => { // map through list of lhs rules
          let numVals = row.get('value').size;
          let mappedValues = row.get('value').map((value, valIndex) => { // map through list of rhs values
            let val = value;
            if (valIndex == numVals - 1) 
              val = value.slice(0, value.size - 1);
            return (
              <span key={valIndex}>
                {val.map((token, tokenIndex) => {
                  return (
                    <span className="Grammar-editor-entered-word" key={tokenIndex}>{token}<span className='Grammar-editor-remove-word' onClick={this.removeWord.bind(this, index, valIndex, tokenIndex)}> x </span></span>
                  );
                })}
                {valIndex < numVals - 1 
                  ? <span className="Grammar-editor-entered-or"> OR </span>
                  : null
                }
              </span>
            );
          });
          let val = row.get('value').last().last();
          return (
            <div className="Grammar-editor-row" key={index}>
              <input className='Grammar-editor-input-key' value={row.get('key')} onChange={this.inputFieldChange.bind(this, index, "key", -1)} />
              {mappedValues}
              <input className='Grammar-editor-input-value' value={val} onKeyPress={this.detectKeyPress.bind(this, index, numVals - 1)} onChange={this.inputFieldChange.bind(this, index, "value", numVals - 1)} />
              <input type="checkbox" onChange={this.oneOrMore.bind(this, index)} />
              <input type="checkbox" onChange={this.makePrimary.bind(this, index)} />
              <button className="Grammar-editor-remove-row-button" onClick={this.removeRow.bind(this, index)}> Remove row </button>
            </div>
          );
        })}
        <div><button className="Grammar-editor-add-row-button" onClick={this.addRow.bind(this)}> Add a row </button></div>
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
  changeRules,
  changeVariables,
  fetchGrammar,
  submitGrammar,
})(GrammarEditor);

//TODO
//5. If delete a variable regex - delete from variables array
