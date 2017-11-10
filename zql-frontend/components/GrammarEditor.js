import React, { Component } from 'react';
import { fromJS, List, Map } from 'immutable';

let InputFieldTypeEnum = {
  VARIABLE: 'vars',
  ENUM: 'enums',
  LHS: 'lhs',

}

class GrammarEditor extends Component {
  constructor(props) {
    super(props);

    this.state = {
      inputFields: fromJS({
        'enums': [
          {
            "key": "",
            "value": [""],
            "oneOrMore": false
          }
        ], 
        'lhs': [
          {
            "key": "",
            "value": [""],
            "oneOrMore": false,
          }
        ],
        'vars': [
          {
            "key": "",
            "value": [""],
            "oneOrMore": false,
          }
        ]
      }),
    };
  }

  addOr(type, index) {
    let numVals = this.state.inputFields.get(type).get(index).get("value").size;
    let newInputFields = this.state.inputFields.setIn([type, index, "value", numVals], "");
    this.setState({
      inputFields: newInputFields
    });
  }

  addRow(type) {
    let listSize = this.state.inputFields.get(type).size;
    let newInputFields = this.state.inputFields.setIn([type, listSize], fromJS({"key": "", "value": [""]}));
    this.setState({
      inputFields: newInputFields
    });
  }

  changeGrammar() {
    debugger;
    console.log('grammar changed');
  }

  inputFieldChange(index, type, keyOrValue, valIndex, e) {
    let newInputFields;
    if (keyOrValue == "key") {
      newInputFields = this.state.inputFields.setIn([type, index, "key"], e.target.value);
    } else {
      newInputFields = this.state.inputFields.setIn([type, index, "value", valIndex], e.target.value);
    }
    this.setState({
      inputFields: newInputFields,
    });
  }

  oneOrMore(type, index, e) {
    let newInputFields = this.state.inputFields.setIn([type, index, "oneOrMore"], e.target.checked);
    this.setState({
      inputFields: newInputFields,
    });
  }

  removeOr(type, index, valIndex) {
    let newValueRow = this.state.inputFields.get(type).get(index).get("value").delete(valIndex);
    let newInputFields = this.state.inputFields.setIn([type, index, "value"], newValueRow);
    this.setState({
      inputFields: newInputFields,
    });
  }

  renderEnums() {
    return (
      <div>
        <div><span>Enum names:</span><span>Values:</span><span>One or more:</span></div>
        {this.state.inputFields.get('enums').map((row, index) => {
          let mappedValues = row.get('value').map((val, valIndex) => {
            return (
              <span>
                <input value={val} onChange={this.inputFieldChange.bind(this, index, InputFieldTypeEnum.ENUM, "value", valIndex)} />
                <button onClick={this.addOr.bind(this, InputFieldTypeEnum.ENUM, index)}> OR </button>
                {row.get('value').size > 1
                  ? <button onClick={this.removeOr.bind(this, InputFieldTypeEnum.ENUM, index, valIndex)}> X </button>
                  : null
                }
              </span>
            );
          });
          return (
            <div>
              <input value={row.get('key')} onChange={this.inputFieldChange.bind(this, index, InputFieldTypeEnum.ENUM, "key", -1)} />:
              {mappedValues}
              <input type="checkbox" onChange={this.oneOrMore.bind(this, InputFieldTypeEnum.ENUM, index)} />
            </div>
          );
        })}
        <div><button onClick={this.addRow.bind(this, InputFieldTypeEnum.ENUM)}> Add a row </button></div>
      </div>
    );
  }

  renderLhs() {
    return (
      <div>
        <div><span>Rule names:</span><span>Rule definition:</span></div>
        {this.state.inputFields.get('lhs').map((row, index) => {
          let mappedValues = row.get('value').map((val, valIndex) => {
            return (
              <span>
              <input value={val} onChange={this.inputFieldChange.bind(this, index, InputFieldTypeEnum.LHS, "value", valIndex)} />
              <button onClick={this.addOr.bind(this, InputFieldTypeEnum.LHS, index)}> OR </button>
              {row.get('value').size > 1
                ? <button onClick={this.removeOr.bind(this, InputFieldTypeEnum.LHS, index, valIndex)}> X </button>
                : null
              }
              </span>
            );
          });
          return (
            <div>
              <input value={row.get('key')} onChange={this.inputFieldChange.bind(this, index, InputFieldTypeEnum.LHS, "key", -1)} />:
              {mappedValues}
            </div>
          );
        })}
        <div><button onClick={this.addRow.bind(this, InputFieldTypeEnum.LHS)}> Add a row </button></div>
      </div>
    );
  }

  renderVars() {
    return (
      <div>
        <div><span>Variable names:</span><span>Regex:</span><span>One or more:</span></div>
        {this.state.inputFields.get('vars').map((row, index) => {
          return (
            <div>
              <input value={row.get('key')} onChange={this.inputFieldChange.bind(this, index, InputFieldTypeEnum.VARIABLE, "key", -1)} />:
              <input value={row.get('value').get(0)} onChange={this.inputFieldChange.bind(this, index, InputFieldTypeEnum.VARIABLE, "value", 0)} />
              <input type="checkbox" onChange={this.oneOrMore.bind(this, InputFieldTypeEnum.VARIABLE, index)} />
            </div>
          );
        })}
        <div><button onClick={this.addRow.bind(this, InputFieldTypeEnum.VARIABLE)}> Add a row </button></div>
      </div>
    );
  }

  render() {
    return (
      <div>
        {this.renderVars()}
        {this.renderEnums()}
        {this.renderLhs()}
        <button onClick={this.changeGrammar.bind(this)}>Change Grammar</button>
      </div>
    );
  }
}

export default GrammarEditor;

//TODO
//4. Combine result on submit + check if each box well formed
//5. Send request
//6. Make it look nicer
//7. Preload grammar with current grammar

