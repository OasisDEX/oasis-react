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
import OasisTransactionStatusWrapper from "./OasisTransactionStatus";
import { TX_OFFER_MAKE } from "../store/reducers/transactions";

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
    this.onBuyOffer = this.onBuyOffer.bind(this);
    this.onCancel = this.onCancel.bind(this);
  }

  onCancel() {
    this.props.actions.setOfferMakeModalClosed(this.props.offerMakeType);
  }

  askForConfirmationBeforeModalClose() {
    const { lockCancelButton } = this.state;
    return lockCancelButton;
  }

  async onBuyOffer() {
    this.setState({ disableOfferMakeButton: true });
    this.props.actions.makeOffer(this.props.offerMakeType, {
      onCancelCleanup: () => {
        this.setState({ disableOfferMakeButton: false });
      },
      onStart: () => {},
      onPending: txStartTimestamp => this.setState({ txStartTimestamp }),
      onCompleted: () => {}
    });
  }

  renderTransactionStatus() {
    const { txStartTimestamp } = this.state;
    return txStartTimestamp ? (
      <OasisTransactionStatusWrapper
        txTimestamp={txStartTimestamp}
        txType={TX_OFFER_MAKE}
      />
    ) : null;
  }

  render() {
    const {
      baseToken,
      quoteToken,
      offerMakeType,
      canMakeOffer,
      marketAddress,
      sellToken,
      form
    } = this.props;

    return (
      <ReactModal
        ariaHideApp={false}
        isOpen={true}
        className={modalStyles.modal}
      >
        <h4 className={styles.heading}>{getOfferTitle(offerMakeType)}</h4>
        <button className={modalStyles.closeModalBtn} onClick={this.onCancel}>
          ×
        </button>
        <OasisTokenBalanceSummary summary="Available" token={sellToken} />
        <div>
          <OfferMakeForm
            baseToken={baseToken}
            quoteToken={quoteToken}
            offerMakeType={offerMakeType}
            form={form}
          />

          <OasisOfferSummary offerType={offerMakeType} />
          {this.renderTransactionStatus()}
          <SetTokenAllowanceTrustWrapper
            onTransactionPending={() =>
              this.setState({ lockCancelButton: true })
            }
            onTransactionCompleted={() =>
              this.setState({ lockCancelButton: false })
            }
            onCancelCleanup={() => this.setState({ lockCancelButton: false })}
            allowanceSubjectAddress={marketAddress}
            tokenName={sellToken}
          />
          <div className={styles.footer}>
            <OasisButton onClick={this.onCancel}>
              {this.askForConfirmationBeforeModalClose() ? "Close" : "Cancel"}
            </OasisButton>
            <OasisButton
              disabled={!canMakeOffer || this.state.disableOfferMakeButton}
              onClick={this.onBuyOffer}
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
    marketAddress: markets.activeMarketAddress(state),
    canMakeOffer: offerMakes.canMakeOffer(state, props.offerMakeType),
    buyToken: offerMakes.activeOfferMakeBuyToken(state, props.form),
    sellToken: offerMakes.activeOfferMakeSellToken(state, props.form)
  };
}

export function mapDispatchToProps(dispatch) {
  const actions = {
    setOfferMakeModalClosed:
      offerMakesReducer.actions.setOfferMakeModalClosedEpic,
    makeOffer: offerMakesReducer.actions.makeOfferEpic
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
