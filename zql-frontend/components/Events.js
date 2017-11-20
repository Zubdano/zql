import React, { Component } from 'react';
import { connect } from 'react-redux';
import { fromJS, List, Map } from 'immutable';
import {
  Col,
  Card,
  CardTitle,
  Icon,
  Preloader,
  Button,
  Collapsible,
  CollapsibleItem,
} from 'react-materialize';
import moment from 'moment';

import { fetchEvents } from '../state/events';
import './Events.scss';


class Events extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
    }
  }

  componentDidMount() {
    // load data
    this.setState({isLoading: true});
    this.props.fetchEvents(() => this.setState({isLoading: false}));
  }

  maybeRenderPredicted() {
    const predicted = this.props.events.get('predicted');

    if (this.props.events.get('predicted') !== null) {
      const eventJSON = JSON.stringify(predicted.get('properties'), null, 2);
      const title = (
        <div>
        <Icon className="yellow-text">error</Icon>
        {' '}
        Predicted event with probability <span style={{"font-weight": "bold"}}>{predicted.get('prob').toFixed(2) * 100}%</span>
        {' '}
        <Icon className="yellow-text">error</Icon>
        </div>
      )
      return (
        <Card className='predictedBox' textClassName='white-text' title={title} >
          <div className="jsonBoxOuter">
            <pre className="jsonBox">{eventJSON}</pre>
            <span style={{"text-align": "right", "margin-bottom": ".1em", "display": "block"}}>{this.computeTimeFromNow(predicted.get('created_at'))}</span>
          </div>
        </Card>
      );
    }
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
    const events = this.props.events.get('eventlog').map((event, index) => {
    const eventHeader = (
      <p style={{margin: 0, align: 'left'}}>
        <span className="rule">{event.get('rule')}</span>
        [{this.singleLineProperties(event.get('properties'))}]
        <span style={{float: 'right'}}>
            {this.computeTimeFromNow(event.get('created_at'))}
        </span>
      </p>
    );

      const eventJSON = JSON.stringify(event, null, 2);
      return (
        <CollapsibleItem key={index} className="eventItem" header={eventHeader} icon='event_note'>
      <div className="jsonBoxOuter"><pre className="jsonBox">{eventJSON}</pre></div>
    </CollapsibleItem>
      );
    });
    return (
      <div>
        {this.maybeRenderPredicted()}
        <Collapsible popout className="eventBox">
          {events}
        </Collapsible>
      </div>
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
    return this.renderEvents();
  }
}

export default connect(({eventsReducer}) => eventsReducer, {fetchEvents})(Events);
// TODO: change so that it works with the different kind of data
