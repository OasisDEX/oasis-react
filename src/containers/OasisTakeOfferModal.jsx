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
import {
  TX_OFFER_TAKE,
  TX_STATUS_AWAITING_CONFIRMATION,
  TX_STATUS_AWAITING_USER_ACCEPTANCE,
  TX_STATUS_CONFIRMED,
  TX_STATUS_REJECTED
} from "../store/reducers/transactions";
import OasisProcessingOrder from "../components/OasisProcessingOrder";

const propTypes = PropTypes && {
  isOpen: PropTypes.bool,
  offerTakeType: PropTypes.oneOf([TAKE_BUY_OFFER, TAKE_SELL_OFFER]).isRequired,
  actions: PropTypes.object.isRequired,
  activeMarketAddress: PropTypes.string,
  canFulfillOffer: PropTypes.bool.isRequired,
  buyToken: PropTypes.string,
  sellToken: PropTypes.string,
  latestBlockNumber: PropTypes.number,
  isCurrentOfferActive: PropTypes.bool.isRequired
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
        this.setState(
          {
            disableOfferTakeButton: true,
            txStatus: undefined,
            txStartTimestamp: undefined
          },
          () =>
            actions.takeOffer({
              onStart: this.onTransactionStart.bind(this),
              onCancelCleanup: this.onTransactionCancelledByUser.bind(this),
              onPending: this.onTransactionPending.bind(this),
              onCompleted: this.onTransactionCompleted.bind(this),
              onRejected: this.onTransactionRejected.bind(this)
            })
        );
      }
    });
  }

  onTransactionStart() {
    this.setState({
      txStatus: TX_STATUS_AWAITING_USER_ACCEPTANCE,
      disableForm: true,
      lockCancelButton: true
    });
  }

  onTransactionCancelledByUser() {
    this.setState({ disableOfferTakeButton: false });
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

  askForConfirmationBeforeModalClose() {
    const { lockCancelButton } = this.state;
    return lockCancelButton;
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
      disableForm: false,
      lockCancelButton: false,
      disableOfferTakeButton: false
    });
  }

  renderOfferSummary() {
    const { offerTakeType, isCurrentOfferActive } = this.props;
    return (
      <div>
        {isCurrentOfferActive ? (
          <OasisOfferSummaryWrapper
            disableBalanceWarning={this.isTakeInProgressOrOfferTaken()}
            offerType={offerTakeType}
          />
        ) : (
          <OasisOfferNotAvailable />
        )}
      </div>
    );
  }

  shouldDisableTakeOfferButton() {
    const { isCurrentOfferActive, canFulfillOffer } = this.props;
    const { disableOfferTakeButton } = this.state;
    return !isCurrentOfferActive || !canFulfillOffer || disableOfferTakeButton;
  }

  isTakeInProgressOrOfferTaken() {
    const { isCurrentOfferActive } = this.props;
    return Boolean(!isCurrentOfferActive || this.state.txStatus && this.state.txStatus !== TX_STATUS_REJECTED);
  }
  render() {
    const {
      offerTakeType,
      activeMarketAddress,
      sellToken,
      buyToken,
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
            <OfferTakeForm
              disableForm={this.state.disableForm}
              estimateGas={getTransactionGasCostEstimate}
            />
          </div>
          <div className="statusSection">
            <div>{this.renderOfferSummary()}</div>
            <SetTokenAllowanceTrustWrapper
              onTransactionPending={() =>
                this.setState({ lockCancelButton: true })
              }
              onTransactionCompleted={newAllowanceStatus => {
                newAllowanceStatus && getTransactionGasCostEstimate();
                this.setState({ lockCancelButton: false });
              }}
              onTransactionRejected={() =>
                this.setState({ lockCancelButton: false })
              }
              onCancelCleanup={() => this.setState({ lockCancelButton: false })}
              allowanceSubjectAddress={activeMarketAddress}
              tokenName={sellToken}
            />
            {this.state.txStatus ? (
              <OasisProcessingOrder
                txTimestamp={this.state.txStartTimestamp}
                localStatus={this.state.txStatus}
                txType={TX_OFFER_TAKE}
              />
            ) : (
              <div>
                <OasisOfferTakeWarningBox />
                <OasisNotTheBestOfferPriceWarningWrapper />
              </div>
            )}
          </div>
          <div className={styles.footer}>
            <OasisButton onClick={this.onCancel}>
              {this.askForConfirmationBeforeModalClose() ? "Close" : "Cancel"}
            </OasisButton>
            <div className="notificationsSection" />
            <OasisButton
              disabled={this.shouldDisableTakeOfferButton()}
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
  }
}

export function mapStateToProps(state) {
  return {
    latestBlockNumber: network.latestBlockNumber(state),
    isOfferTakeModalOpen: offerTakes.isOfferTakeModalOpen(state),
    activeMarketAddress: markets.activeMarketAddress(state),
    canFulfillOffer: offerTakes.canFulfillOffer(state),
    buyToken: offerTakes.activeOfferTakeBuyToken(state),
    sellToken: offerTakes.activeOfferTakeSellToken(state),
    isCurrentOfferActive: offerTakes.isOfferActive(state) === true
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
