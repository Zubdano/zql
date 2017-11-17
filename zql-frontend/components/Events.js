import React, { Component } from 'react';
import { connect } from 'react-redux';
import { fromJS, List, Map } from 'immutable';
import { Icon, Button, Collapsible, CollapsibleItem } from 'react-materialize';
import moment from 'moment';

import { fetchEvents } from '../state/events';
import './Events.scss';


class Events extends Component {

  componentDidMount() {
    this.props.fetchEvents();
  }

  singleLineProperties(properties) {
    return properties.map((values, propertyName, index) => {
      if (typeof values === 'string') {
        values = fromJS([values]);
      }
      const allValues = values.toJS().join(', ');
	  return propertyName + '=' + allValues;
    }).join('; ');
  }

  computeTimeFromNow(createdAt) {
    return moment(createdAt).fromNow();
  }

  renderEvents() {
    const events = this.props.events.map((event) => {
      const eventHeader = (
		<p style={{margin: 0, align: 'left'}}>
          {this.singleLineProperties(event.get('properties'))}
          <Icon>transfer_within_a_station</Icon>
          <Icon>rowing</Icon>
	      <span style={{float: 'right'}}>
            {this.computeTimeFromNow(event.get('created_at'))}
          </span>
        </p>
	  );

      const eventJSON = JSON.stringify(event, null, 2);
      return (
        <CollapsibleItem className="eventItem" header={eventHeader} icon='pregnant_woman'>
		  <div className="jsonBoxOuter"><pre className="jsonBox">{eventJSON}</pre></div>
		</CollapsibleItem>
      );
    });
    return (
      <Collapsible popout className="eventBox">
        {events}
      </Collapsible>
    );
  }

  render() {
    return this.renderEvents();
  }
}

export default connect(({eventsReducer}) => eventsReducer, {fetchEvents})(Events);
// TODO: change so that it works with the different kind of data
