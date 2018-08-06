import React, { PureComponent } from "react";
import { PropTypes } from "prop-types";

// import ImmutablePropTypes from 'react-immutable-proptypes';
import ReactModal from "react-modal";

import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { MAKE_BUY_OFFER, MAKE_SELL_OFFER } from "../constants";
import offerMakesReducer from "../store/reducers/offerMakes";
import offerMakes from "../store/selectors/offerMakes";
import OfferMakeForm from "./OasisOfferMakeForm";
import SetTokenAllowanceTrustWrapper from "./SetTokenAllowanceTrust";
import OasisTokenBalanceSummary from "./OasisTokenBalanceSummary";
import markets from "../store/selectors/markets";
import modalStyles from "../styles/modules/_modal.scss";
import styles from "./OasisMakeOfferModal.scss";
import CSSModules from "react-css-modules";
import OasisButton from "../components/OasisButton";
import OasisOfferSummary from "./OasisOfferSummary";
import {
  TX_OFFER_MAKE,
  TX_STATUS_AWAITING_CONFIRMATION,
  TX_STATUS_AWAITING_USER_ACCEPTANCE,
  TX_STATUS_CANCELLED_BY_USER,
  TX_STATUS_CONFIRMED,
  TX_STATUS_REJECTED
} from "../store/reducers/transactions";
import OasisTransactionStatusWrapperInfoBox from "./OasisTransactionStatusInfoBox";
import { getActiveOfferAllowanceStatus, isPriceSet } from "../store/selectors";
import OasisOfferBelowDustLimitWrapper from "./OasisOfferBelowDustLimit";
import InfoBoxWithIco from "../components/InfoBoxWithIco";
import OasisYourOrderExceedsMaxTotalForToken from "../components/OasisYourOrderExceedsMaxTotalForToken";
import OasisOfferTakeWarningBox from '../components/OasisOfferTakeWarningBox';

const propTypes = PropTypes && {
  isOpen: PropTypes.bool,
  offerMakeType: PropTypes.oneOf([MAKE_SELL_OFFER, MAKE_BUY_OFFER]).isRequired,
  actions: PropTypes.object.isRequired,
  activeMarketAddress: PropTypes.string,
  canMakeOffer: PropTypes.bool,
  buyToken: PropTypes.string,
  sellToken: PropTypes.string
};

const getOfferTitle = offerMakeType => {
  switch (offerMakeType) {
    case MAKE_BUY_OFFER:
      return "Buy offer";
    case MAKE_SELL_OFFER:
      return "Sell offer";
  }
};

const getBtnColor = offerMakeType => {
  switch (offerMakeType) {
    case MAKE_BUY_OFFER:
      return "success";
    case MAKE_SELL_OFFER:
      return "danger";
  }
};

export class OasisMakeOfferModalWrapper extends PureComponent {
  static makeOfferBtnLabel(offerMakeType, tokenName) {
    switch (offerMakeType) {
      case MAKE_SELL_OFFER:
        return `Sell ${tokenName}`;
      case MAKE_BUY_OFFER:
        return `Buy ${tokenName}`;
    }
  }

  constructor(props) {
    super(props);
    this.state = {};
    this.componentIsUnmounted = false;
    this.onFormChange = this.onFormChange.bind(this);
    this.onBuyOffer = this.onBuyOffer.bind(this);
    this.onCancel = this.onCancel.bind(this);
    this.selectedElement = document.querySelector("body");
    this.currentScrollOffset = window.pageYOffset;
    this.selectedElement.classList.add('fixed');
  }

  onCancel() {
    this.props.actions.setOfferMakeModalClosed(this.props.offerMakeType);
  }

  async onBuyOffer() {
    this.setState(
      {
        disableOfferMakeButton: true,
        txStatus: false,
        txStartTimestamp: undefined
      },
      () =>
        this.props.actions.makeOffer(this.props.offerMakeType, {
          onStart: this.onTransactionStart.bind(this),
          onCancelCleanup: this.onTransactionCancelledByUser.bind(this),
          onPending: this.onTransactionPending.bind(this),
          onCompleted: this.onTransactionCompleted.bind(this),
          onRejected: this.onTransactionRejected.bind(this)
        })
    );
  }

  onTransactionStart() {
    this.setState({
      txStatus: TX_STATUS_AWAITING_USER_ACCEPTANCE,
      disableForm: true,
      lockCancelButton: true
    });
  }

  onTransactionCancelledByUser() {
    this.setState({ disableOfferMakeButton: false });
    this.setState({
      txStatus: TX_STATUS_CANCELLED_BY_USER,
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
      disableForm: true,
      lockCancelButton: false,
      disableOfferMakeButton: false
    });
  }

  onFormChange() {
    if (this.componentIsUnmounted === false) {
      this.setState({
        txStatus: undefined,
        txStartTimestamp: undefined
      });
    }
  }

  renderTransactionStatus() {
    const { txStartTimestamp, txStatus } = this.state;
    return (
      <OasisTransactionStatusWrapperInfoBox
        txStatus={txStatus}
        infoText={<strong>Process order</strong>}
        txTimestamp={txStartTimestamp}
        localStatus={txStatus}
        txType={TX_OFFER_MAKE}
      />
    );
  }

  isOfferMakeCompleted() {
    return this.state.txStatus === TX_STATUS_CONFIRMED;
  }

  isTransactionPendingOrAwaitingAcceptance() {
    return [
      TX_STATUS_AWAITING_USER_ACCEPTANCE,
      TX_STATUS_AWAITING_CONFIRMATION
    ].includes(this.state.txStatus);
  }

  renderFormAndSummary() {
    const {
      baseToken,
      quoteToken,
      offerMakeType,
      form,
      isTotalOverTheTokenMax,
      isTokenTradingEnabled
    } = this.props;
    const { newAllowanceStatus } = this.state;
    return (
      <div>
        <OfferMakeForm
          baseToken={baseToken}
          quoteToken={quoteToken}
          offerMakeType={offerMakeType}
          form={form}
          disableForm={this.state.disableForm}
          onFormChange={this.onFormChange}
        />
        {!isTotalOverTheTokenMax ? (
          <OasisOfferSummary
            disableBalanceWarning={
              this.isOfferMakeCompleted() ||
              this.isTransactionPendingOrAwaitingAcceptance() ||
              (false === isTokenTradingEnabled && !newAllowanceStatus)
            }
            offerType={offerMakeType}
          />
        ) : null}
      </div>
    );
  }

  renderSetTokenAllowance() {
    const {
      offerMakeType,
      marketAddress,
      sellToken,
      actions: { getTransactionGasCostEstimate }
    } = this.props;

    return (
      <SetTokenAllowanceTrustWrapper
        onTransactionPending={() => this.setState({ lockCancelButton: true })}
        onTransactionCompleted={newAllowanceStatus => {
          newAllowanceStatus && getTransactionGasCostEstimate(offerMakeType);
          this.setState({
            newAllowanceStatus,
            lockCancelButton: false
          });
        }}
        onCancelCleanup={() =>
          this.setState({
            lockCancelButton: false
          })
        }
        allowanceSubjectAddress={marketAddress}
        tokenName={sellToken}
      />
    );
  }

  shouldDisabledOfferMakeButton() {
    const { canMakeOffer, hasExceededGasLimit } = this.props;
    return (
      !canMakeOffer || this.state.disableOfferMakeButton || hasExceededGasLimit
    );
  }

  renderOverTheMaxTotalWarning() {
    const { isTotalOverTheTokenMax } = this.props;
    return isTotalOverTheTokenMax ? (
      <OasisYourOrderExceedsMaxTotalForToken />
    ) : null;
  }

  renderOfferTakeWarning() {
    const { canMakeOffer } = this.props;
    return canMakeOffer ? <OasisOfferTakeWarningBox/> : null;
  }

  render() {
    const { baseToken, offerMakeType, sellToken } = this.props;

    return (
      <ReactModal
        ariaHideApp={false}
        isOpen={true}
        className={modalStyles.modal}
      >
        <h4 className={modalStyles.heading}>{getOfferTitle(offerMakeType)}</h4>
        {!this.isTransactionPendingOrAwaitingAcceptance() ? (
          <button className={modalStyles.closeModalBtn} onClick={this.onCancel}>
            ×
          </button>
        ) : null}
        <OasisTokenBalanceSummary summary="Available" token={sellToken} />
        <div>
          {this.renderFormAndSummary()}
          <div>
            {sellToken && (
              <OasisOfferBelowDustLimitWrapper
                tokenName={sellToken}
                offerType={offerMakeType}
              />
            )}
            <InfoBoxWithIco
              icon="info"
              fullWidth
              hidden={this.props.isPriceSet}
            >
              Enter a price to unlock amount and total.
            </InfoBoxWithIco>
          </div>
          {this.renderTransactionStatus()}
          {this.renderSetTokenAllowance()}
          {this.renderOverTheMaxTotalWarning()}
          {this.renderOfferTakeWarning()}
          <div className={styles.footer}>
            <OasisButton
              disabled={this.isTransactionPendingOrAwaitingAcceptance()}
              onClick={this.onCancel}
            >
              {this.askForConfirmationBeforeModalClose() ? "Close" : "Cancel"}
            </OasisButton>
            <OasisButton
              disabled={this.shouldDisabledOfferMakeButton()}
              onClick={this.onBuyOffer}
              color={getBtnColor(offerMakeType)}
            >
              {OasisMakeOfferModalWrapper.makeOfferBtnLabel(
                offerMakeType,
                baseToken
              )}
            </OasisButton>
          </div>
        </div>
      </ReactModal>
    );
  }

}

export function mapStateToProps(state, props) {
  return {
    isTotalOverTheTokenMax: offerMakes.isTotalOverTheTokenLimit(
      state,
      props.offerMakeType
    ),
    isTokenTradingEnabled: getActiveOfferAllowanceStatus(
      state,
      props.offerMakeType
    ),
    marketAddress: markets.activeMarketAddress(state),
    canMakeOffer: offerMakes.canMakeOffer(state, props.offerMakeType),
    buyToken: offerMakes.activeOfferMakeBuyToken(state, props.form),
    sellToken: offerMakes.activeOfferMakeSellToken(state, props.form),
    isPriceSet: isPriceSet(state, props.offerMakeType),
    hasExceededGasLimit: offerMakes.hasExceededGasLimit(
      state,
      props.offerMakeType
    )
  };
}

export function mapDispatchToProps(dispatch) {
  const actions = {
    setOfferMakeModalClosed:
      offerMakesReducer.actions.setOfferMakeModalClosedEpic,
    makeOffer: offerMakesReducer.actions.makeOfferEpic,
    getTransactionGasCostEstimate:
      offerMakesReducer.actions.updateTransactionGasCostEstimateEpic
  };
  return { actions: bindActionCreators(actions, dispatch) };
}

OasisMakeOfferModalWrapper.propTypes = propTypes;
OasisMakeOfferModalWrapper.displayName = "OasisMakeOfferModal";
export default connect(mapStateToProps, mapDispatchToProps)(
  CSSModules(
    OasisMakeOfferModalWrapper,
    { modalStyles, styles },
    { allowMultiple: true }
  )
);
