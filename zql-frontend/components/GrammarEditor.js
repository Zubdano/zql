//Assumptions
// - user will not enter something like: patient - [a-zA-Z] asdf
// - primary key can only be a variable and a single variable

import React, { Component } from 'react';
import { connect } from 'react-redux'
import { fromJS, List, Map } from 'immutable';
import { Button, Preloader, Input, Table } from 'react-materialize';
import './GrammarEditor.scss'
import classNames from 'classnames';

import {
  changeInputFields,
  changeRules,
  changeVariables,
  changeFocusClass,
  fetchGrammar,
  submitGrammar,
  grammarValidityDisplayed,
} from '../state/grammar';

const InputFieldTypeEnum = {
  VAR: 'variable',
  LHS: 'rule',
  NA: 'none',
}

const NEW_ROW = {key: "", oneOrMore: false, isPrimary: false, join: 'and', value: []};

class GrammarEditor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      numChips: 0,
      isLoading: false,
    };
  }
  // fetch initial grammar / use default value if none exists
  componentDidMount() {
    // load data
    this.setState({isLoading: true});
    this.props.fetchGrammar(() => this.setState({isLoading: false}));
  }

  materialChip(chipsClass, data, variables, rules, inputs) {
    $(chipsClass).material_chip(data);
    this.updateChipsColors(variables, rules, inputs);
  }

  componentDidUpdate() {
    let { numChips } = this.state;
    let focused = -1;

    this.props.inputFields.map((row, ruleIndex) => {
      let chipsClass = '.chips-' + ruleIndex;
      let data = row.get('value').map((token) => {
        return {tag: token};
      });
      data = { data: data.toJS() } 
      // called when adding new row/loading initial data
      if (ruleIndex >= numChips) {
        numChips += 1;
        this.materialChip(chipsClass, data, this.props.variables, this.props.rules, this.props.inputFields);
        $(chipsClass).on('chip.add',
          this.handleChipAdd.bind(this, ruleIndex));
        $(chipsClass).on('chip.delete',
          this.handleChipRemove.bind(this, ruleIndex));
      } else {
        if ($(chipsClass + ' .input').is(":focus")) focused = ruleIndex;
        this.materialChip(chipsClass, data, this.props.variables, this.props.rules, this.props.inputFields);
      }
    }); 

    if (focused >= 0) {
      const chipsClass = '.chips-' + focused + ' .input';
      $(chipsClass).focus();
    }

    if (numChips !== this.state.numChips) {
      this.setState({numChips});
    }

    if (this.props.displayGrammarValidity) {
      let msg =  "Succesfully updated grammar"
      let time = 1500;

      if (this.props.error) {
        msg = "Error: " + this.props.error;
        time = 4000;
      }

      Materialize.toast(msg, time);
      this.props.grammarValidityDisplayed();
    }
  }

  // set colors of all chips
  updateChipsColors(variables, rules, inputs) {
    inputs.map((row, ruleIndex) => {
      row.get('value').map((chip, chipIndex) => {
        $('.chips-' + ruleIndex).children().each((elemIndex, elem) => {
          if ($(elem).is("div")) {
            let type = this.getTypeElem(ruleIndex, elemIndex);
            if (type == InputFieldTypeEnum.VAR)
              $(elem).addClass('Grammar-editor-variable-chip');
            if (type == InputFieldTypeEnum.LHS)
              $(elem).addClass('Grammar-editor-rule-chip');
          }
        });
      });
    });
  }

  handleChipAdd(ruleIndex, e, chip) {
    let newVariablesSet = this.props.variables;
    let newRulesSet = this.props.rules;
    let valSize = this.props.inputFields.get(ruleIndex).get('value').size;
    let newInputFields = this.props.inputFields.setIn([ruleIndex, "value", valSize], chip.tag);
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

    this.updateChipsColors(newVariablesSet, newRulesSet, newInputFields);

    let chipsClass = 'chips-' + ruleIndex;
    $("." + chipsClass + " :input").focus();
    
    this.props.changeRules(newRulesSet);
    this.props.changeInputFields(newInputFields);
    this.props.changeVariables(newVariablesSet);
  }

  handleChipRemove(ruleIndex, e, chip) {
    //find wordIndex
    let wordIndex = this.props.inputFields.get(ruleIndex).get('value').findIndex((token) => {
      return token == chip.tag;
    });

    let newValueRow = this.props.inputFields.get(ruleIndex).get('value').delete(wordIndex);
    let newInputFields = this.props.inputFields.setIn([ruleIndex, 'value'], newValueRow);

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

  // add new input fields for a new row
  addRow() {
    let listSize = this.props.inputFields.size;
    let newInputFields = this.props.inputFields.set(listSize, fromJS(NEW_ROW));
    this.props.changeInputFields(newInputFields);
  }

  // if more than one value or rhs is an lhs rule then or value is not a valid regex then lhs is rule else variable
  getType(row) {
    let type = InputFieldTypeEnum.VAR;

    if (row.get('value').last() == "") {
      row = row.setIn(['value', 0], row.get('value').delete(1));
    }

    if (row.get('value').size > 1 || row.get('value').size > 1) return InputFieldTypeEnum.LHS;

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

  getTypeElem(ruleIndex, valIndex) {
    let elem = this.props.inputFields.getIn([ruleIndex, 'value', valIndex]);
    if (this.props.rules.includes(elem)) 
      return InputFieldTypeEnum.LHS;
    if (this.props.variables.includes(elem))
      return InputFieldTypeEnum.VAR;

    return InputFieldTypeEnum.NA;
  }

  getSubmissionGrammar() {
    let submissionGrammar = fromJS({});
    //remove all empty values
    this.props.inputFields.map((row) => {
      let type = this.getType(row);
      let numTokensInLastRow = row.get('value').last().size;
      let newValues = row.get('value');

      if (row.get('value').last() == "") {
        newValues = row.setIn(['value', row.get('value').size - 1], row.get('value').pop()).get('value');
      }
      submissionGrammar = submissionGrammar.set(row.get('key'), fromJS({
        type: type,
        oneOrMore: row.get('oneOrMore'),
        isPrimary: row.get('isPrimary'),
        join: row.get('join'),
        value: newValues,
      }));
    });
    return submissionGrammar;
  }

  // send the grammar to the backend
  changeGrammar() {
    let dataToSubmit = this.getSubmissionGrammar();
    dataToSubmit = fromJS({grammar: dataToSubmit});
    this.props.submitGrammar(dataToSubmit.toJS(), this.props.id);
  }

  getValueOfVariable(variable) {
    let rule = this.props.inputFields.find((row) => {
      return row.get('key') == variable;
    });

    return rule.get('value').first();
  }

  // change input as user types in an input field
  inputFieldChange(index, keyOrValue, e) {
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
      let valSize = this.props.inputFields.get(index).get('value').size;
      newInputFields = this.props.inputFields.setIn([index, 'value', valSize - 1], e.target.value);
    }

    this.props.changeInputFields(newInputFields);
  }

  // remove the last rule
  removeRow(removeIndex) {
    let newInputFields = this.props.inputFields.delete(removeIndex);
    let type = this.getType(this.props.inputFields.get(removeIndex));
    let oldKey = this.props.inputFields.get(removeIndex).get('key');

    if (type == InputFieldTypeEnum.VAR) {
      let newVariablesSet = this.props.variables.delete(oldKey);
      this.props.changeVariables(newVariablesSet); 
    } else if (type == InputFieldTypeEnum.LHS) {
      let newRulesSet = this.props.rules.delete(oldKey);
      this.props.changeRules(newRulesSet); 
    }

    this.props.changeInputFields(newInputFields);
    this.setState({numChips: this.state.numChips - 1});
  }

  // change multiplicity of a rule
  handleOneOrMore(index, e) {
    let newInputFields = this.props.inputFields.setIn([index, "oneOrMore"], e.target.checked);
    this.props.changeInputFields(newInputFields);
  }

  // make this key primary
  handleIsPrimary(index, e) {
    let newInputFields = this.props.inputFields.setIn([index, "isPrimary"], e.target.checked);
    this.props.changeInputFields(newInputFields);
  }

  handleJoinToggle(index, e) {
    let newInputFields = this.props.inputFields.setIn([index, "join"],
      e.target.checked ? 'or' : 'and');
    this.props.changeInputFields(newInputFields);
  }

  renderDefinition(ruleIndex, values) {
    let chipsClass = "chips-" + ruleIndex;
    return (
      <div key={chipsClass} className={classNames('chips', chipsClass)}/>
    );
  }

  renderRule(row, index) {
    const or = row.get('join') === 'or';
    const oneOrMore = row.get('oneOrMore');
    const isPrimary = row.get('isPrimary');
    return (
      <tr key={index}>
        <td>
          <input
            className='Grammar-editor-input-key'
            value={row.get('key')}
            onChange={this.inputFieldChange.bind(this, index, "key")}
          />
        </td>
        <td>
          {this.renderDefinition(index, row.get('value'))}
        </td>
        <td>
          <Input onLabel='Or' offLabel='And' type='switch' checked={or} name='on'
            onChange={this.handleJoinToggle.bind(this, index)} /> 
        </td>
        <td>
          <Input name='group1' type='checkbox' value='checked' checked={oneOrMore} label='Multi'
            onChange={this.handleOneOrMore.bind(this, index)}/>
        </td>
        <td>
          <Input name='group1' type='checkbox' value='checked' checked={isPrimary} label='User Id'
            onChange={this.handleIsPrimary.bind(this, index)}/>
        </td>
        <td>
          <Button className='Grammar-editor-remove-row-button' floating large={false} waves='light' icon='delete'
            onClick={this.removeRow.bind(this, index)}/>
        </td>
      </tr>
    );
  }

  renderRules() {
    const rules = this.props.inputFields.valueSeq().map((row, index) => {
      return this.renderRule(row, index);
    }, this);

    return (
      <tbody>
        {rules}
      </tbody>
    );
  }

  render() {
    if (this.state.isLoading) {
      return (
        <div className='Grammar-editor-loading'>
          <Preloader flashing />
        </div>
      );
    }
    return (
      <div className="Grammar-editor">
        <Table>
          <thead>
            <tr>
              <th data-field="ruleName">Rule Name</th>
              <th data-field="ruleDef">Rule Definition</th>
            </tr>
          </thead>
          {this.renderRules()}
        </Table>
        <Button className='Grammar-editor-add-row-button' onClick={this.addRow.bind(this)}>Add Row</Button>
        <Button className='Grammar-editor-change-grammar-button' onClick={this.changeGrammar.bind(this)}>Change Grammar</Button>
      </div>
    );
  }
}

export default connect(({grammarReducer}) => grammarReducer, {
  changeInputFields,
  changeRules,
  changeVariables,
  changeFocusClass,
  fetchGrammar,
  submitGrammar,
  grammarValidityDisplayed,
})(GrammarEditor);

