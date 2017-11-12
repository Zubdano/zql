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
          'eventId': '1',
          'properties': {
            'disease': ['cancer'],
            'patient': 'pranav', 
          }
        },
        {
          'eventId': '2',
          'properties': {
            'exams': ['colonoscopy'], 
            'patient': 'pranav',
          }
        },
        {
          'eventId': '3',
          'properties': {
            'exams': ['catscan', 'colonoscopy'], 
            'patient': 'ross',
          }
        },
        {
          'eventId': '4',
          'properties': {
            'disease': ['cancer', 'aids'],
            'patient': 'pranav', 
          }
        },
      ]),
    };
  }

  renderEvent(properties) {
    const renderedProperties = properties.map((values, propertyName, index) => {
      if (typeof values === 'string') {
        values = fromJS([values]);
      }
      const eachProperty = values.toJS().join(', ');
      return (
        <div className="Events-each-property" key={propertyName}>
          <span className="Events-each-property-title">{propertyName}: </span>
          {eachProperty}
        </div>
      );
      
    });

    return renderedProperties.toIndexedSeq().toJS();
  }

  renderEvents() {
    const events = this.state.events.map((event) => {
      return (
        <div className="Events-each-event" key={event.get('eventId')}>
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
