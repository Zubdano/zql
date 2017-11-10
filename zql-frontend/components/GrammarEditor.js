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

    //populate these with values from the server
    //final result // { lhsRuleName: [{ type: ..., value: ..., moreThanOne: true/false }, ..., [type: or]], key2: [...], key3: [...]}
    this.state = {
      inputFields: fromJS({
        'enums': [
          {
            "key": "",
            "value": "",
          }
        ], 
        'lhs': [
          {
            "key": "",
            "value": "",
          }
        ],

        'vars': [
          {
            "key": "",
            "value": "",
          }
        ]
      }),
    };
  }

  changeGrammar() {
    console.log('grammar changed');
  }

  inputFieldChange(index, type, keyOrValue, e) {
    let newInputFields = this.state.inputFields.setIn([type, index, keyOrValue], e.target.value);
    this.setState({
      inputFields: newInputFields,
    });
  }

  addRow(type) {
    let listSize = this.state.inputFields.get(type).size;
    let newInputFields = this.state.inputFields.setIn([type, listSize], fromJS({"key": "", "value": ""}));
    this.setState({
      inputFields: newInputFields
    });
  }

  renderEnums() {
    return (
      <div>
        <div><span>Enum names:</span><span>Values:</span></div>
        {this.state.inputFields.get('enums').map((row, index) => {
          return (
            <div>
              <input value={row.get('key')} onChange={this.inputFieldChange.bind(this, index, InputFieldTypeEnum.ENUM, "key")} />
              <input value={row.get('value')} onChange={this.inputFieldChange.bind(this, index, InputFieldTypeEnum.ENUM, "value")} />
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
          return (
            <div>
              <input value={row.get('key')} onChange={this.inputFieldChange.bind(this, index, InputFieldTypeEnum.LHS, "key")} />
              <input value={row.get('value')} onChange={this.inputFieldChange.bind(this, index, InputFieldTypeEnum.LHS, "value")} size="50" />
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
        <div><span>Variable names:</span><span>Regex:</span></div>
        {this.state.inputFields.get('vars').map((row, index) => {
          return (
            <div>
              <input value={row.get('key')} onChange={this.inputFieldChange.bind(this, index, InputFieldTypeEnum.VARIABLE, "key")} />
              <input value={row.get('value')} onChange={this.inputFieldChange.bind(this, index, InputFieldTypeEnum.VARIABLE, "value")} />
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
//3. Add button for more RHS

//4. Combine result on submit + check if well formed
//5. Send request
//6. Make it look nicer

