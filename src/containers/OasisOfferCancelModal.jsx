import React, { PureComponent } from "react";
import { PropTypes } from "prop-types";
import ImmutablePropTypes from "react-immutable-proptypes";

import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import OasisOfferCancelModal from "../components/OasisOfferCancelModal";
import OasisButton from "../components/OasisButton";
import offersReducer, {
  TYPE_BUY_OFFER,
  TYPE_SELL_OFFER
} from "../store/reducers/offers";
import {
  TX_STATUS_AWAITING_CONFIRMATION,
  TX_STATUS_AWAITING_USER_ACCEPTANCE,
  TX_STATUS_CONFIRMED,
  TX_STATUS_REJECTED
} from "../store/reducers/transactions";
import tokens from "../store/selectors/tokens";

const propTypes = PropTypes && {
  actions: PropTypes.object.isRequired,
  offer: ImmutablePropTypes.map.isRequired
};

export class OasisOfferCancelModalWrapper extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
    this.onModalOpen = this.onModalOpen.bind(this);
    this.onModalClose = this.onModalClose.bind(this);
    this.onCancelOffer = this.onCancelOffer.bind(this);
  }

  onModalOpen() {
    this.setState({ modalOpen: true });
  }

  onCancelOffer() {
    const { offer, actions } = this.props;
    actions.cancelOffer(offer, {
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
      txStatus: undefined,
      disableForm: false,
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
    const { actions, offer, activeTradingPair } = this.props;
    this.setState({
      modalOpen: false,
      txStartTimestamp: undefined,
      txStatus: undefined
    });

    if (this.state.txStatus === TX_STATUS_CONFIRMED) {
      setTimeout(() => {
        actions.removeOrderCancelledByTheOwner({
          offerType: offer.get('offerType'),
          offerId: offer.get('id'),
          tradingPair: activeTradingPair
        })
      }, 300);
    }
  }

  cancelIsAwaitingAcceptanceOrPending() {
    return [
      TX_STATUS_AWAITING_USER_ACCEPTANCE,
      TX_STATUS_AWAITING_CONFIRMATION
    ].includes(this.state.txStatus);
  }

  getTokenNameAndAmount() {
    const { offer, activeTradingPair: { baseToken, quoteToken } } = this.props;
    switch (offer.get("offerType")) {
      case TYPE_BUY_OFFER:
        return { tokenName: quoteToken, tokenAmount: offer.get("quoteAmount") };
      case TYPE_SELL_OFFER:
        return { tokenName: baseToken, tokenAmount: offer.get("baseAmount") };
    }
  }

  render() {
    const { modalOpen } = this.state;
    return (
      <div>
        <OasisButton
          onClick={this.onModalOpen}
          disabled={this.state.modalOpen}
          size="xs"
        >
          {this.state.modalOpen ? "cancel" : "cancel"}
        </OasisButton>
        {modalOpen ? (
          <OasisOfferCancelModal
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
}

export function mapStateToProps(state) {
  return {
    activeTradingPair: tokens.activeTradingPair(state)
  };
}
export function mapDispatchToProps(dispatch) {
  const actions = {
    cancelOffer: offersReducer.actions.cancelOfferEpic,
    removeOrderCancelledByTheOwner: offersReducer.actions.removeOrderCancelledByTheOwner
  };
  return { actions: bindActionCreators(actions, dispatch) };
}

OasisOfferCancelModalWrapper.propTypes = propTypes;
OasisOfferCancelModalWrapper.displayName = "OasisOfferCancelModal";
export default connect(mapStateToProps, mapDispatchToProps)(
  OasisOfferCancelModalWrapper
);
