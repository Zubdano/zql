import React, { Component } from 'react';
import { fromJS, List, Map } from 'immutable';

import './Events.scss';


class Events extends Component {
  constructor(props) {
    super(props);

    // load data
    this.state = {
      events: fromJS([
        {
          'properties': {
            'disease': ['cancer'],
            'patient': 'pranav', 
          }
        },
        {
          'properties': {
            'exams': ['colonoscopy'], 
            'patient': 'pranav',
          }
        },
        {
          'properties': {
            'exams': ['catscan', 'colonoscopy'], 
            'patient': 'ross',
          }
        },
        {
          'properties': {
            'disease': ['cancer', 'aids'],
            'patient': 'pranav', 
          }
        },
      ]),
    };
  }

  renderEvent(properties) {
    let renderedProperties = properties.map((values, propertyName, index) => {
      if (typeof values === "string") {
        values = fromJS([values]);
      }
      let eachProperty = values.toJS().join(', ');
      return (
        <div className="Events-each-property">
          <span className="Events-each-property-title">{propertyName}: </span>
          {eachProperty}
        </div>
      );
      
    });

    return renderedProperties;
  }

  renderEvents() {
    let events = this.state.events.map((event) => {
      return (
        <div className="Events-each-event">
          <div className="Events-each-event-title">Properties:</div>
          {this.renderEvent(event.get('properties'))}
        </div>
      );
    });
    return (
      <div className="Events-all-events">
        {events}
      </div>
    );
  }

  render() {
    return (
      <div>
        {this.renderEvents()}
      </div>
    );
  }
}

export default Events;

//TODO
//3. Load data from endpoint
