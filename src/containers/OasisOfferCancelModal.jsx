import React, { PureComponent } from "react";
import { PropTypes } from "prop-types";
import ImmutablePropTypes from "react-immutable-proptypes";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import OasisOfferCancelModal from "../components/OasisOfferCancelModal";
import offersReducer, {
  TYPE_BUY_OFFER,
  TYPE_SELL_OFFER
} from "../store/reducers/offers";
import {
  TX_STATUS_AWAITING_CONFIRMATION,
  TX_STATUS_AWAITING_USER_ACCEPTANCE,
  TX_STATUS_CANCELLED_BY_USER,
  TX_STATUS_CONFIRMED,
  TX_STATUS_REJECTED
} from "../store/reducers/transactions";
import tokens from "../store/selectors/tokens";
import offers from "../store/selectors/offers";
import network from "../store/selectors/network";

const propTypes = PropTypes && {
  actions: PropTypes.object.isRequired,
  offer: ImmutablePropTypes.map.isRequired,
  onModalClose: PropTypes.func.isRequired
};

export class OasisOfferCancelModalWrapper extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
    this.componentIsUnmounted = false;
    this.onModalClose = this.onModalClose.bind(this);
    this.onCancelOffer = this.onCancelOffer.bind(this);
  }

  componentDidMount() {
    this.setState({ offer: this.props.offer }, () =>
      this.setState({ modalOpen: true })
    );
  }

  onCancelOffer() {
    const { actions } = this.props;
    actions.cancelOffer(this.state.offer, {
      onStart: this.onTransactionStart.bind(this),
      onCancelCleanup: this.onTransactionCancelledByUser.bind(this),
      onPending: this.onTransactionPending.bind(this),
      onCompleted: this.onTransactionCompleted.bind(this),
      onRejected: this.onTransactionRejected.bind(this)
    });
  }

  onTransactionStart() {
    this.setState({
      txStatus: TX_STATUS_AWAITING_USER_ACCEPTANCE,
      lockCancelButton: true
    });
  }

  onTransactionCancelledByUser() {
    this.setState({
      txStatus: TX_STATUS_CANCELLED_BY_USER,
      lockCancelButton: false
    });
  }
  onTransactionPending({ txStartTimestamp }) {
    this.setState({
      txStatus: TX_STATUS_AWAITING_CONFIRMATION,
      txStartTimestamp
    });
  }

  onTransactionCompleted() {
    this.setState({
      txStatus: TX_STATUS_CONFIRMED
    });
    this.props.onCancelledSuccesfully(this.state.offer.get("id"));
  }

  onTransactionRejected({ txHash }) {
    this.setState({
      txStatus: TX_STATUS_REJECTED,
      txHash,
      lockCancelButton: false,
      disableCancelButton: false
    });
  }

  onModalClose() {
    // const { actions, activeTradingPair } = this.props;
    // const { offer } = this.state;
    if (this.componentIsUnmounted === false) {
      this.setState(
        {
          modalOpen: false,
          txStartTimestamp: undefined,
          txStatus: undefined
        },
        () => this.props.onModalClose()
      );
    }

    // if (this.state.txStatus === TX_STATUS_CONFIRMED) {
    //   actions.markOfferAsInactive({
    //     offerType: offer.get("offerType"),
    //     offerId: offer.get("id"),
    //     tradingPair: activeTradingPair
    //   });
    // }
  }

  cancelIsAwaitingAcceptanceOrPending() {
    return [
      TX_STATUS_AWAITING_USER_ACCEPTANCE,
      TX_STATUS_AWAITING_CONFIRMATION
    ].includes(this.state.txStatus);
  }

  getTokenNameAndAmount() {
    const { activeTradingPair: { baseToken, quoteToken } } = this.props;
    const { offer } = this.state;
    switch (offer.get("offerType")) {
      case TYPE_BUY_OFFER:
        return { tokenName: quoteToken, tokenAmount: offer.get("quoteAmount") };
      case TYPE_SELL_OFFER:
        return { tokenName: baseToken, tokenAmount: offer.get("baseAmount") };
    }
  }

  render() {
    const { modalOpen } = this.state;
    const { canOfferBeCancelled } = this.props;
    return (
      <div>
        {modalOpen ? (
          <OasisOfferCancelModal
            canOfferBeCancelled={canOfferBeCancelled}
            {...this.getTokenNameAndAmount()}
            askForConfirmToClose={this.cancelIsAwaitingAcceptanceOrPending()}
            txStartTimestamp={this.state.txStartTimestamp}
            localStatus={this.state.txStatus}
            onModalClose={this.onModalClose}
            onCancelOffer={this.onCancelOffer}
          />
        ) : null}
      </div>
    );
  }
  componentWillUnmount() {
    this.componentIsUnmounted = true;
  }
}

export function mapStateToProps(state, props) {
  return {
    latestBlockNumber: network.latestBlockNumber(state),
    activeTradingPair: tokens.activeTradingPair(state),
    canOfferBeCancelled: offers.canOfferBeCancelled(
      state,
      props.offer ? props.offer.get("id") : null
    )
  };
}
export function mapDispatchToProps(dispatch) {
  const actions = {
    cancelOffer: offersReducer.actions.cancelOfferEpic,
    markOfferAsInactive: offersReducer.actions.markOfferAsInactive
  };
  return { actions: bindActionCreators(actions, dispatch) };
}

OasisOfferCancelModalWrapper.propTypes = propTypes;
OasisOfferCancelModalWrapper.displayName = "OasisOfferCancelModal";
export default connect(mapStateToProps, mapDispatchToProps)(
  OasisOfferCancelModalWrapper
);
