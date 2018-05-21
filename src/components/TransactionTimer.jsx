import React, { PureComponent } from "react";
import { PropTypes } from "prop-types";
import ImmutablePropTypes from "react-immutable-proptypes";
import moment from "moment";
// import withTimer from "../containers/WithTimer";

export const TIMER_TIME_UNIT_SECOND = "second";
export const TIMER_TIME_UNIT_MINUTE = "minute";

const propTypes = PropTypes && {
  transactionReceipt: ImmutablePropTypes.map,
  timer: PropTypes.number.isRequired,
  timeUnit: PropTypes.oneOf([TIMER_TIME_UNIT_MINUTE, TIMER_TIME_UNIT_SECOND])
};

const defaultProps = {};
export class TransactionTimer extends PureComponent {
  render() {
    // const { timer } = this.props;
    const { transaction } = this.props;
    let timeDiff = null;
    const startTimestamp = transaction.getIn(["txStats", "txStartTimestamp"]);

    // if (!transaction.hasIn(["txStats", "txEndTimestamp"])) {
    //   timeDiff = moment(timer).diff(moment(startTimestamp));
    // } else {
      timeDiff = moment(
        transaction.getIn(["txStats", "txEndTimestamp"])
      ).diff(moment(startTimestamp));
    // }

    const momentDuration = moment.duration(timeDiff);
    const [minutes, seconds] = [
      momentDuration.get("minutes"),
      momentDuration.get("seconds")
    ];

    return (
      <div>
        <span style={{padding:'0 10px'}}>Time</span>
        <span>
           {minutes < 10 ? `0${minutes}`: minutes} : {seconds < 10 ? `0${seconds}` : seconds} min
        </span>
      </div>
    );
  }
}

TransactionTimer.displayName = "TransactionTimer";
TransactionTimer.propTypes = propTypes;
TransactionTimer.defaultProps = defaultProps;
// export default withTimer(TransactionTimer);
export default TransactionTimer;
