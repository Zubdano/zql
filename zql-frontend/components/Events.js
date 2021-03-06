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

import { auth, Permissions } from '../requests/auth';

import { fetchEvents } from '../state/events';
import './Events.scss';

const MAX_LEN_HEADER = 35;

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

  getEventHeader(event) {
    let eventTitle = event.get('rule');
    let eventTitleClass = 'rule';
    let ruleInformation = this.singleLineProperties(event.get('properties'));

    if (event.get('rule') == null) {
      eventTitle = event.get('input');
      const inputLen = eventTitle.length;
      eventTitleClass = 'input';
      if (inputLen > MAX_LEN_HEADER) {
        eventTitle = eventTitle.substring(0, MAX_LEN_HEADER - 3) + '...';
      }

      ruleInformation = '';
    }

    return (
      <p className="eventHeaderP">
        <span className={eventTitleClass}>{eventTitle}</span>
        <span>{ruleInformation}</span>
        <span className="eventHeaderTime">
          {this.computeTimeFromNow(event.get('created_at'))}
        </span>
        {auth.currentUser.permission < Permissions.READER && event.get('rule')
          ? <span className="eventTarget"> 
              {event.get('prob')
                ? <span className="fontWeightBold">{event.get('prob').toFixed(2)*100}% </span>
                : null}
              <span>for </span>
              <span className="fontWeightBold">{event.get('user_id')}</span>
            </span>
          : null }
      </p>
    );
  }

  maybeRenderPredicted() {
    let allPredicted = this.props.events.get('predicted');

    let renderedPredicted;
    if (allPredicted == null) return;

    if (auth.currentUser.permission == Permissions.READER) {
      renderedPredicted = allPredicted.map((predicted, index) => {
          const eventJSON = JSON.stringify(predicted.get('properties'), null, 2);
          const title = (
            <div>
              <Icon className="yellow-text">error</Icon>
              {' '}
              Predicted <span className="fontWeightBold">{predicted.get('rule')}</span>
              {' '}
              event with probability <span className="fontWeightBold">{predicted.get('prob').toFixed(2) * 100}%</span>
              {' '}
              <Icon className="yellow-text">error</Icon>
            </div>
          )
          return (
            <Card className='predictedBox' textClassName='white-text' title={title} key={index}>
              <div className="jsonBoxOuter">
                <pre className="jsonBox">{eventJSON}</pre>
                <span className="predictedTime">{this.computeTimeFromNow(predicted.get('created_at'))}</span>
              </div>
            </Card>
          );
      });
    } else {
      renderedPredicted = allPredicted.map((event, index) => {
        const eventHeader = this.getEventHeader(event);
        const eventJSON = JSON.stringify(event, null, 2);
        

        return (
          <CollapsibleItem key={index} className="predictedEventItem" header={eventHeader} icon="info_outline">
            <div className="jsonBoxOuter"><pre className="jsonBox">{eventJSON}</pre></div>
          </CollapsibleItem>
        );
      });

      renderedPredicted = (
        <div>
          <Collapsible popout className="eventBox">
            {renderedPredicted}
          </Collapsible>
        </div>
      );
    }

    return renderedPredicted;
  }

  singleLineProperties(properties) {
    return '[' + properties.map((values, propertyName, index) => {
      if (typeof values === 'string') {
        values = fromJS([values]);
      }
      const allValues = values.toJS().join(', ');
      return propertyName + '=' + allValues;
    }).join('; ') + ']';
  }

  computeTimeFromNow(createdAt) {
    return moment(createdAt).fromNow();
  }

  renderEvents() {
    if (this.props.events.get('eventlog').size == 0)
      return (<h5>No events</h5>);

    const events = this.props.events.get('eventlog').map((event, index) => {
      const eventHeader = this.getEventHeader(event);
      const eventJSON = JSON.stringify(event, null, 2);
      let icon = 'event_note';
      
      if (event.get('rule') == null) {
        icon = 'email';
      }
      return (
        <CollapsibleItem key={index} className="eventItem" header={eventHeader} icon={icon}>
          <div className="jsonBoxOuter"><pre className="jsonBox">{eventJSON}</pre></div>
        </CollapsibleItem>
      );
    });

    return (
      <div>
        <h3>Predicted</h3>
        {this.maybeRenderPredicted()}
        <h3 className='yourEventsHeading'>Your events</h3>
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
