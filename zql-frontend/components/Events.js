import React, { Component } from 'react';
import { connect } from 'react-redux';
import { fromJS, List, Map } from 'immutable';

import { fetchEvents } from '../state/events';
import './Events.scss';


class Events extends Component {

  componentDidMount() {
    this.props.fetchEvents();
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
    const events = this.props.events.map((event) => {
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

export default connect(({eventsReducer}) => eventsReducer, {fetchEvents})(Events);
// TODO: change so that it works with the different kind of data
