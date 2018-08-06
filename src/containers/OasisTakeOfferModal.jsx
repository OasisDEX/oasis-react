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
  TX_STATUS_CANCELLED_BY_USER,
  TX_STATUS_CONFIRMED,
  TX_STATUS_REJECTED
} from "../store/reducers/transactions";
import { OasisTransactionStatusWrapperInfoBox } from "./OasisTransactionStatusInfoBox";
import OasisVolumeIsOverTheOfferMax from "../components/OasisVolumeIsOverTheOfferMax";
import {
  getActiveOfferAllowanceStatus,
  hasSufficientTokenAmountByOfferType
} from "../store/selectors";

const propTypes = PropTypes && {
  isOpen: PropTypes.bool,
  offerTakeType: PropTypes.oneOf([TAKE_BUY_OFFER, TAKE_SELL_OFFER]).isRequired,
  actions: PropTypes.object.isRequired,
  activeMarketAddress: PropTypes.string,
  canFulfillOffer: PropTypes.bool.isRequired,
  buyToken: PropTypes.string,
  sellToken: PropTypes.string,
  latestBlockNumber: PropTypes.number,
  isCurrentOfferActive: PropTypes.bool.isRequired,
  isVolumeGreaterThanOfferMax: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.string
  ])
};

const getOfferTitle = offerTakeType => {
  switch (offerTakeType) {
    case TAKE_BUY_OFFER:
      return "Buy offer";
    case TAKE_SELL_OFFER:
      return "Sell offer";
  }
};

const getBtnColor = offerMakeType => {
  switch (offerMakeType) {
    case TAKE_BUY_OFFER:
      return "success";
    case TAKE_SELL_OFFER:
      return "danger";
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
    this.componentUnmounted = false;
    this.onBuyOffer = this.onBuyOffer.bind(this);
    this.onCancel = this.onCancel.bind(this);
  }

  componentDidMount() {
  }

  onCancel() {
    this.props.actions.setOfferTakeModalClosed();
  }

  async onBuyOffer() {
    const { actions } = this.props;
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

  onTransactionStart() {
    if (this.componentUnmounted === false) {
      this.setState({
        txStatus: TX_STATUS_AWAITING_USER_ACCEPTANCE,
        disableForm: true,
        lockCancelButton: true
      });
    }
  }

  onTransactionCancelledByUser() {
    if (this.componentUnmounted === false) {
      this.setState({ disableOfferTakeButton: false });
      this.setState({
        txStatus: TX_STATUS_CANCELLED_BY_USER,
        disableForm: false,
        lockCancelButton: false
      });
    }
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

  renderOfferNotAvailableWarning() {
    const { isCurrentOfferActive } = this.props;
    const pendingOrConfirmed = [
      TX_STATUS_CONFIRMED,
      TX_STATUS_AWAITING_CONFIRMATION
    ].includes(this.state.txStatus);
    if (!(pendingOrConfirmed || isCurrentOfferActive)) {
      return <OasisOfferNotAvailable />;
    } else return null;
  }
  renderOfferSummary() {
    const { offerTakeType, isVolumeGreaterThanOfferMax } = this.props;
    return (
      <div>
        <div>
          {!isVolumeGreaterThanOfferMax && (
            <OasisOfferSummaryWrapper
              disableBalanceWarning={
                this.isTakeInProgressOrOfferTaken() ||
                this.state.txStatus ||
                Boolean(isVolumeGreaterThanOfferMax)
              }
              offerType={offerTakeType}
            />
          )}
        </div>
        <div>{this.renderOfferNotAvailableWarning()}</div>
      </div>
    );
  }

  shouldDisableTakeOfferButton() {
    const {
      isCurrentOfferActive,
      canFulfillOffer,
      hasExceededGasLimit
    } = this.props;
    const { disableOfferTakeButton } = this.state;
    return (
      !isCurrentOfferActive ||
      !canFulfillOffer ||
      disableOfferTakeButton ||
      hasExceededGasLimit
    );
  }

  isTakeInProgressOrOfferTaken() {
    const { isCurrentOfferActive } = this.props;
    return Boolean(
      !isCurrentOfferActive ||
        (this.state.txStatus && this.state.txStatus !== TX_STATUS_REJECTED)
    );
  }

  isTransactionPendingOrAwaitingAcceptance() {
    return [
      TX_STATUS_AWAITING_USER_ACCEPTANCE,
      TX_STATUS_AWAITING_CONFIRMATION
    ].includes(this.state.txStatus);
  }

  renderSetTokenAllowanceWrapper() {
    const {
      isVolumeGreaterThanOfferMax,
      activeMarketAddress,
      sellToken,
      hasSufficientTokenAmount,
      actions: { getTransactionGasCostEstimate }
    } = this.props;

    return (!isVolumeGreaterThanOfferMax && hasSufficientTokenAmount) || this.state.txStatus ? (
      <SetTokenAllowanceTrustWrapper
        onTransactionPending={() => this.setState({ lockCancelButton: true })}
        onTransactionCompleted={newAllowanceStatus => {
          newAllowanceStatus && getTransactionGasCostEstimate();
          this.setState({ lockCancelButton: false });
        }}
        onTransactionRejected={() => this.setState({ lockCancelButton: false })}
        onCancelCleanup={() => this.setState({ lockCancelButton: false })}
        allowanceSubjectAddress={activeMarketAddress}
        tokenName={sellToken}
      />
    ) : null;
  }

  onFormChange() {
    if (this.componentUnmounted === false) {
      this.setState({
        txStatus: undefined,
        txStartTimestamp: undefined
      });
    }
  }

  render() {
    const {
      offerTakeType,
      sellToken,
      buyToken,
      isVolumeGreaterThanOfferMax,
      actions: { getTransactionGasCostEstimate }
    } = this.props;

    return (
      <ReactModal
        ariaHideApp={false}
        isOpen={true}
        className={modalStyles.modal}
      >
        <h4 className={modalStyles.heading}>{getOfferTitle(offerTakeType)}</h4>
        {!this.isTransactionPendingOrAwaitingAcceptance() ? (
          <button className={modalStyles.closeModalBtn} onClick={this.onCancel}>
            <span>×</span>
          </button>
        ) : null}
        <OasisTokenBalanceSummary summary="Available" token={sellToken} />
        <div>
          <div>
            <OfferTakeForm
              disableForm={this.state.disableForm}
              estimateGas={getTransactionGasCostEstimate}
              onFormChange={this.onFormChange}
            />
          </div>
          <div className="statusSection">
            <div>{this.renderOfferSummary()}</div>
            <div>
              {isVolumeGreaterThanOfferMax &&
                !this.state.disableForm && (
                  <OasisVolumeIsOverTheOfferMax
                    tokenName={buyToken}
                    offerMax={isVolumeGreaterThanOfferMax}
                  />
                )}
            </div>
            {this.renderSetTokenAllowanceWrapper()}
            {this.state.txStatus ? (
              <OasisTransactionStatusWrapperInfoBox
                txStatus={this.state.txStatus}
                infoText={<strong>Process order</strong>}
                txTimestamp={this.state.txStartTimestamp}
                localStatus={this.state.txStatus}
                txType={TX_OFFER_TAKE}
              />
            ) : null}
            {this.renderOfferTakeWarning()}
            {!this.state.txStatus && this.renderNotTheBestOfferWarning()}
          </div>
          <div className={styles.footer}>
            <OasisButton
              disabled={this.isTransactionPendingOrAwaitingAcceptance()}
              onClick={this.onCancel}
            >
              {this.askForConfirmationBeforeModalClose() ? "Close" : "Cancel"}
            </OasisButton>
            <div className="notificationsSection" />
            <OasisButton
              disabled={this.shouldDisableTakeOfferButton()}
              onClick={this.onBuyOffer}
              color={getBtnColor(offerTakeType)}
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

  shouldDisableMinorWarnings() {
    return false === this.props.canFulfillOffer;
  }

  renderOfferTakeWarning() {
   return !this.shouldDisableMinorWarnings() ?
     <OasisOfferTakeWarningBox /> : null;
  }
  renderNotTheBestOfferWarning() {
    return !this.shouldDisableMinorWarnings() ? <OasisNotTheBestOfferPriceWarningWrapper />: null;
  }

  UNSAFE_componentWillUpdate(nextProps) {
    const prevBlockNumber = this.props.latestBlockNumber;
    const currentBlockNumber = nextProps.latestBlockNumber;
    if (prevBlockNumber !== currentBlockNumber) {
      this.props.actions.checkIfOfferIsActive();
    }
  }

  componentWillUnmount() {
    this.componentUnmounted = true;
  }
}

export function mapStateToProps(state) {
  return {
    hasSufficientTokenAmount: hasSufficientTokenAmountByOfferType(
      state,
      offerTakes.activeOfferTakeType(state)
    ),
    latestBlockNumber: network.latestBlockNumber(state),
    isOfferTakeModalOpen: offerTakes.isOfferTakeModalOpen(state),
    activeMarketAddress: markets.activeMarketAddress(state),
    canFulfillOffer: offerTakes.canFulfillOffer(state),
    buyToken: offerTakes.activeOfferTakeBuyToken(state),
    sellToken: offerTakes.activeOfferTakeSellToken(state),
    isCurrentOfferActive: offerTakes.isOfferActive(state) !== false,
    isVolumeGreaterThanOfferMax: offerTakes.isVolumeGreaterThanOfferMax(state),
    isTokenTradingEnabled: getActiveOfferAllowanceStatus(
      state,
      offerTakes.activeOfferTakeType(state)
    ),
    hasExceededGasLimit: offerTakes.hasExceededGasLimit(state)
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
