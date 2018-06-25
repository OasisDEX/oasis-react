import React, { PureComponent } from "react";
import { PropTypes } from "prop-types";
import { BID, ASK } from "../store/reducers/trades";
import { tradeType, formatTradeType } from "../utils/tokens/pair";

import styles from "./OasisTradeType.scss";
import CSSModules from "react-css-modules";
import {
  USER_TO_LOG_TAKE_OFFER_RELATION_TAKEN_BY_USER,
  USER_TO_LOG_TAKE_OFFER_RELATION_USER_MADE
} from "../constants";

const propTypes = PropTypes && {
  userToTradeBaseRelation: PropTypes.oneOf([
    USER_TO_LOG_TAKE_OFFER_RELATION_USER_MADE,
    USER_TO_LOG_TAKE_OFFER_RELATION_TAKEN_BY_USER
  ]),
  userToTradeAdditionalRelation: PropTypes.oneOf([
    USER_TO_LOG_TAKE_OFFER_RELATION_USER_MADE,
    USER_TO_LOG_TAKE_OFFER_RELATION_TAKEN_BY_USER,
    null
  ])
};
const defaultProps = {};

export class OasisTradeType extends PureComponent {
  render() {
    const { order, baseCurrency, type, userToTradeBaseRelation, userToTradeAdditionalRelation } = this.props;
    const tradeTypeEnum =
      type || tradeType(order, baseCurrency, userToTradeBaseRelation, userToTradeAdditionalRelation);

    const typeStyle = type => {
      if (!type) {
        return "";
      } else {
        switch (type) {
          case BID:
            return styles.buy;
          case ASK:
            return styles.sell;
        }
      }
    };

    return (
      <span className={`${typeStyle(tradeTypeEnum)}`}>
        {formatTradeType(tradeTypeEnum)}
      </span>
    );
  }
}

OasisTradeType.displayName = "OasisTradeType";
OasisTradeType.propTypes = propTypes;
OasisTradeType.defaultProps = defaultProps;
export default CSSModules(OasisTradeType, styles);
