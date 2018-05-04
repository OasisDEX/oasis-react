import React, { PureComponent } from "react";
import { PropTypes } from "prop-types";

// import ImmutablePropTypes from 'react-immutable-proptypes';
import ReactModal from "react-modal";

import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { TAKE_BUY_OFFER, TAKE_SELL_OFFER } from "../store/reducers/offerTakes";
import network from "../store/selectors/network";

import offerTakesReducer from "../store/reducers/offerTakes";
import offerTakes from "../store/selectors/offerTakes";
import OfferTakeForm from "../components/OfferTakeForm";
import balances from "../store/selectors/balances";
import tokens from "../store/selectors/tokens";
import OasisTokenBalanceSummary from "./OasisTokenBalanceSummary";
import SetTokenAllowanceTrustWrapper from "./SetTokenAllowanceTrust";
import modalStyles from "../styles/modules/_modal.scss";
import styles from "./OasisMakeOfferModal.scss";
import CSSModules from "react-css-modules";
import OasisButton from "../components/OasisButton";
import OasisOfferNotAvailable from "../components/OasisOfferNotAvailable";
import markets from "../store/selectors/markets";
import OasisOfferSummaryWrapper from "./OasisOfferSummary";
import OasisOfferTakeWarningBox from "../components/OasisOfferTakeWarningBox";
import OasisNotTheBestOfferPriceWarningWrapper from "./OasisNotTheBestOfferPriceWarning";

const propTypes = PropTypes && {
  isOpen: PropTypes.bool,
  offerTakeType: PropTypes.oneOf(TAKE_BUY_OFFER, TAKE_SELL_OFFER).isRequired,
  actions: PropTypes.object.isRequired
};

const getOfferTitle = offerTakeType => {
  switch (offerTakeType) {
    case TAKE_BUY_OFFER:
      return "Buy offer";
    case TAKE_SELL_OFFER:
      return "Sell offer";
  }
};

export class OasisTakeOfferModalWrapper extends PureComponent {
  static takeOfferBtnLabel(offerTakeType, { buyToken, sellToken }) {
    switch (offerTakeType) {
      case TAKE_SELL_OFFER:
        return `Buy ${buyToken}`;
      case TAKE_BUY_OFFER:
        return `Sell ${sellToken}`;
    }
  }

  constructor(props) {
    super(props);
    this.state = {};
    this.onBuyOffer = this.onBuyOffer.bind(this);
    this.onCancel = this.onCancel.bind(this);
  }

  onCancel() {
    this.props.actions.setOfferTakeModalClosed();
  }

  async onBuyOffer() {
    const { actions } = this.props;
    actions.checkIfOfferIsActive().then(isActive => {
      if (isActive) {
        actions.takeOffer({
          onPending: () => {
            this.props.actions.setOfferTakeModalClosed();
          }
        });
      }
    });
  }

  askForConfirmationBeforeModalClose() {
    const { transaction, lockCancelButton } = this.state;
    return transaction || lockCancelButton;
  }

  renderOfferSummary() {
    const { offerTakeType, isCurrentOfferActive } = this.props;
    return (
      <div>
        <OasisOfferSummaryWrapper offerType={offerTakeType} />
        {isCurrentOfferActive ? null : <OasisOfferNotAvailable />}
      </div>
    );
  }

  render() {
    const {
      offerTakeType,
      canFulfillOffer,
      activeMarketAddress,
      sellToken,
      buyToken,
      isCurrentTransactionValid,
      actions: { getTransactionGasCostEstimate }
    } = this.props;

    return (
      <ReactModal
        ariaHideApp={false}
        isOpen={true}
        className={modalStyles.modal}
      >
        <h4 className={styles.heading}>{getOfferTitle(offerTakeType)}</h4>
        <button className={modalStyles.closeModalBtn} onClick={this.onCancel}>
          <span>×</span>
        </button>
        <OasisTokenBalanceSummary summary="Available" token={sellToken} />
        <div>
          <div>
            <OfferTakeForm estimateGas={getTransactionGasCostEstimate} />
          </div>
          <div className="statusSection">
            <div>{this.renderOfferSummary()}</div>
            <SetTokenAllowanceTrustWrapper
              onTransactionPending={() =>
                this.setState({ lockCancelButton: true })
              }
              onTransactionCompleted={() =>
                this.setState({ lockCancelButton: false })
              }
              onCancelCleanup={() => this.setState({ lockCancelButton: false })}
              allowanceSubjectAddress={activeMarketAddress}
              tokenName={sellToken}
            />
            <OasisOfferTakeWarningBox />
            <OasisNotTheBestOfferPriceWarningWrapper />
          </div>
          <div className={styles.footer}>
            <OasisButton onClick={this.onCancel}>
              {this.askForConfirmationBeforeModalClose() ? "Close" : "Cancel"}
            </OasisButton>
            <div className="notificationsSection" />
            <OasisButton
              disabled={!isCurrentTransactionValid || !canFulfillOffer}
              onClick={this.onBuyOffer}
            >
              {OasisTakeOfferModalWrapper.takeOfferBtnLabel(offerTakeType, {
                buyToken,
                sellToken
              })}
            </OasisButton>
          </div>
        </div>
      </ReactModal>
    );
  }

  componentWillUpdate(nextProps) {
    const prevBlockNumber = this.props.latestBlockNumber;
    const currentBlockNumber = nextProps.latestBlockNumber;
    if (prevBlockNumber !== currentBlockNumber) {
      this.props.actions.checkIfOfferIsActive();
    }

    // if (isTransactionConfirmed(this.state)) {
    //   setTimeout(() => {
    //     this.props.actions.setOfferTakeModalClosed();
    //   }, TIMER_DEFAULT_INTERVAL_MS);
    // }

    // if (this.props.isCurrentOfferActive === false) {
    //   setTimeout(() => {
    //     this.props.actions.setOfferTakeModalClosed();
    //   }, TIMER_DEFAULT_INTERVAL_MS);
    // }
  }
}

export function mapStateToProps(state) {
  return {
    latestBlockNumber: network.latestBlockNumber(state),
    isOfferTakeModalOpen: offerTakes.isOfferTakeModalOpen(state),
    userBalances: balances.tokenBalances(state),
    activeTradingPair: tokens.activeTradingPair(state),
    activeMarketAddress: markets.activeMarketAddress(state),
    canFulfillOffer: offerTakes.canFulfillOffer(state),
    buyToken: offerTakes.activeOfferTakeBuyToken(state),
    sellToken: offerTakes.activeOfferTakeSellToken(state),
    isCurrentTransactionValid: !offerTakes.isVolumeEmptyOrZero(state),
    isCurrentOfferActive: offerTakes.isOfferActive(state) === true,
    hasSufficientTokenAmount: offerTakes.hasSufficientTokenAmount(state)
  };
}

export function mapDispatchToProps(dispatch) {
  const actions = {
    checkIfOfferIsActive:
      offerTakesReducer.actions.checkIfOfferTakeSubjectStillActiveEpic,
    setOfferTakeModalClosed:
      offerTakesReducer.actions.setOfferTakeModalClosedEpic,
    takeOffer: offerTakesReducer.actions.takeOfferEpic,
    getTransactionGasCostEstimate:
      offerTakesReducer.actions.getTransactionGasCostEstimateEpic
  };
  return { actions: bindActionCreators(actions, dispatch) };
}

OasisTakeOfferModalWrapper.propTypes = propTypes;
OasisTakeOfferModalWrapper.displayName = "OasisTakeOfferModal";
export default connect(mapStateToProps, mapDispatchToProps)(
  CSSModules(
    OasisTakeOfferModalWrapper,
    { modalStyles, styles },
    { allowMultiple: true }
  )
);
