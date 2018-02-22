import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import moment from 'moment';
import withTimer from '../containers/WithTimer';

export const TIMER_TIME_UNIT_SECOND = 'second';
export const TIMER_TIME_UNIT_MINUTE = 'minute';

const propTypes = PropTypes && {
  transaction: ImmutablePropTypes.map,
  timer: PropTypes.number.isRequired,
  timeUnit: PropTypes.oneOf([
    TIMER_TIME_UNIT_MINUTE,
    TIMER_TIME_UNIT_SECOND
  ])
};

const defaultProps = {};
window.moment = moment;
class TransactionTimer extends PureComponent {
  render() {
    const { transaction } = this.props;
    const startTimestamp = transaction.getIn(['txStats','txStartTimestamp']);
    let timeDiff = null;
    if(!transaction.hasIn(['txStats', 'txEndTimestamp'])) {
      timeDiff = moment.unix(this.props.timer).diff(moment.unix(startTimestamp), TIMER_TIME_UNIT_SECOND);
      return (<div hidden={timeDiff===null}>{timeDiff} sec.</div>);
    } else {
      const endTimestamp = transaction.getIn(['txStats','txEndTimestamp']);
      timeDiff = moment.unix(endTimestamp).diff(moment.unix(startTimestamp), TIMER_TIME_UNIT_SECOND);
      return (<div hidden={timeDiff===null}>{timeDiff} sec.</div>);
    }

  }
}

TransactionTimer.displayName = 'TransactionTimer';
TransactionTimer.propTypes = propTypes;
TransactionTimer.defaultProps = defaultProps;
export default withTimer(TransactionTimer);
