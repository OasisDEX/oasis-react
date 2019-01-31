import React, { PureComponent } from "react";
import { PropTypes } from "prop-types";
import OasisWidgetFrame from "../containers/OasisWidgetFrame";
import OasisTable from "./OasisTable";
import { toDisplayFormat } from "../utils/orders";
import LoadProgressSection from "./OasisLoadProgressSection";
import { TAKE_SELL_OFFER } from "../store/reducers/offerTakes";

import styles from "./OasisSellOrders.scss";
import CSSModules from "react-css-modules";
import { OFFER_STATUS_INACTIVE } from "../store/reducers/offers";
import OasisSignificantDigitsWrapper from "../containers/OasisSignificantDigits";
import { ETH_UNIT_ETHER } from '../constants';
import ImmutablePropTypes from 'react-immutable-proptypes';

const propTypes = {
  onSetOfferTakeModalOpen: PropTypes.func.isRequired,
  onSetActiveOfferTakeOfferId: PropTypes.func.isRequired,
  onCheckOfferIsActive: PropTypes.func.isRequired,
  onResetCompletedOfferCheck: PropTypes.func.isRequired,
  loadingSellOffers: PropTypes.bool,
  activeTradingPair: PropTypes.object,
  sellOffers: ImmutablePropTypes.list,
  sellOfferCount: PropTypes.number,
};

const defaultProps = {};

const actionsColumnTemplate = function() {
  return null;
};

const priceTemplate = row => (
  <OasisSignificantDigitsWrapper
    fullPrecisionAmount={row.ask_price_full_precision}
    amount={row.ask_price}
  />
);
const baseTokenTemplate = row => (
  <OasisSignificantDigitsWrapper
    fullPrecisionUnit={ETH_UNIT_ETHER}
    fullPrecisionAmount={row.sell_how_much_full_precision}
    amount={row.sell_how_much}
  />
);
const quoteTokenTemplate = row => (
  <OasisSignificantDigitsWrapper
    fullPrecisionUnit={ETH_UNIT_ETHER}
    fullPrecisionAmount={row.buy_how_much_full_precision}
    amount={row.buy_how_much}
  />
);

const colsDefinition = (baseToken, quoteToken, orderActions) => {
  return [
    { heading: `price`, template: priceTemplate },
    { heading: `${quoteToken}`, template: quoteTokenTemplate }, // how much will pay
    { heading: `${baseToken}`, template: baseTokenTemplate }, // how much  will get
    { heading: ``, template: actionsColumnTemplate.bind(orderActions) }
  ];
};

class OasisSellOrders extends PureComponent {
  constructor(props) {
    super(props);
    this.onTableRowClick = this.onTableRowClick.bind(this);
  }

  onTableRowClick(rowData) {
    const { onSetOfferTakeModalOpen } = this.props;
     onSetOfferTakeModalOpen({
      offerTakeType: TAKE_SELL_OFFER,
      offerId: rowData.id
    })
  }

  render() {
    const {
      activeTradingPair: { baseToken, quoteToken },
      sellOffers,
      sellOfferCount,
      loadingSellOffers,
    } = this.props;
    const orderActions = {};
    const rows = sellOffers
      .filter(offer => offer.status !== OFFER_STATUS_INACTIVE)
      .sort((p, c) => (p.ask_price_sort > c.ask_price_sort ? 1 : -1))
      .map(toDisplayFormat);
    return (
      <OasisWidgetFrame
        isLoadingData={loadingSellOffers}
        loadingDataText={"sell orders"}
        heading={`SELL ORDERS`}
        loadProgressSection={
          <LoadProgressSection
            loadedOffersList={sellOffers}
            offersTotalCount={sellOfferCount}
          />
        }
      >
        <OasisTable
          className={styles.table}
          // onRowClick={this.onTableRowClick}
          rows={rows}
          col={colsDefinition(baseToken, quoteToken, orderActions)}
        />
      </OasisWidgetFrame>
    );
  }
}

OasisSellOrders.displayName = "OasisSellOrders";
OasisSellOrders.propTypes = propTypes;
OasisSellOrders.defaultProps = defaultProps;
export default CSSModules(OasisSellOrders, styles, { allowMultiple: true });
