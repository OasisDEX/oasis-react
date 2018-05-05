import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';

// import ImmutablePropTypes from 'react-immutable-proptypes';
import ReactModal from 'react-modal';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {MAKE_BUY_OFFER, MAKE_SELL_OFFER} from "../constants";
import offerMakesReducer from '../store/reducers/offerMakes';
import offerMakes from '../store/selectors/offerMakes';
import OfferMakeForm from './OasisOfferMakeForm';
import balances from '../store/selectors/balances';
import { getFormValues, getFormSyncErrors } from 'redux-form/immutable';
import SetTokenAllowanceTrustWrapper from './SetTokenAllowanceTrust';
import transactions from '../store/selectors/transactions';
import { TX_STATUS_CONFIRMED } from '../store/reducers/transactions';
import OasisTokenBalanceSummary  from './OasisTokenBalanceSummary';
import markets from '../store/selectors/markets';
import modalStyles from '../styles/modules/_modal.scss';
import styles from './OasisMakeOfferModal.scss';
import CSSModules from 'react-css-modules';
import OasisButton from "../components/OasisButton";
import OasisOfferSummaryWrapper  from './OasisOfferSummary';
import OasisOfferNotAvailable from '../components/OasisOfferNotAvailable';

const propTypes = PropTypes && {
  isOpen: PropTypes.bool,
  offerMakeType: PropTypes.oneOf([
    'OFFER_MAKES/MAKE_BUY_OFFER',
    'OFFER_MAKES/MAKE_SELL_OFFER',
  ]).isRequired,
  actions: PropTypes.object.isRequired,
};

const getOfferTitle = (offerMakeType) => {
  switch (offerMakeType) {
    case MAKE_BUY_OFFER:
      return 'Buy offer';
    case MAKE_SELL_OFFER:
      return 'Sell offer';
  }
};

export const isTransactionConfirmed = (transaction) =>
  transaction && transaction.get('txStatus') === TX_STATUS_CONFIRMED;

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
    this.onBuyOffer = this.onBuyOffer.bind(this);
    this.onCancel = this.onCancel.bind(this);
    // this.getTransactionGasCostEstimate = this.props.actions.getTransactionGasCostEstimate.bind(
    //   null, props.offerMakeType,
    // );
  }

  onCancel() {
    this.props.actions.setOfferMakeModalClosed(this.props.offerMakeType);
  }

  async onBuyOffer() {
    this.props.actions.makeOffer(this.props.offerMakeType);
  }

  render() {
    const {
      baseToken,
      quoteToken,
      offerMakeType,
      canMakeOffer,
      activeMarketAddress,
      sellToken,
      buyToken,
      // isCurrentTransactionValid,
      form,
      // offerMakeFormValues,
      // hasSufficientTokenAmount,
    } = this.props;

    console.log({form})

    return (
      <ReactModal ariaHideApp={false} isOpen={true} className={modalStyles.modal}>
          <h4 className={styles.heading}>{getOfferTitle(offerMakeType)}</h4>
          <button
            className={modalStyles.closeModalBtn}
            onClick={this.onCancel}>×
          </button>
        <OasisTokenBalanceSummary summary="Available" token={sellToken}/>
        <div>
          <OfferMakeForm
            baseToken={baseToken}
            quoteToken={quoteToken}
            offerMakeType={offerMakeType}
            form={form}
          />
          <OasisOfferSummaryWrapper offerType={offerMakeType}/>
          {/*<OasisTransactionDetailsWrapper*/}
              {/*transactionSubectType={TX_OFFER_MAKE}*/}
              {/*isTransactionValid={isCurrentTransactionValid}*/}
              {/*{...getUsersSoldAndReceivedAmounts(offerMakeType, offerMakeFormValues)}*/}
              {/*buyToken={buyToken}*/}
              {/*transaction={currentOfferMakeTransaction}*/}
              {/*sellToken={sellToken}*/}
              {/*offerId={null}*/}
              {/*// getTransactionGasCostEstimate={this.getTransactionGasCostEstimate}*/}
              {/*hasSufficientTokenAmount={hasSufficientTokenAmount}*/}
            {/*/>*/}
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
          <div
            className={styles.footer}
          >
            <OasisButton onClick={this.onCancel}>Cancel</OasisButton>
            <OasisButton disabled={!canMakeOffer} onClick={this.onBuyOffer}>
              {OasisMakeOfferModalWrapper.makeOfferBtnLabel(offerMakeType, baseToken)}
            </OasisButton>
          </div>
        </div>
      </ReactModal>
    );
  }
}

export function mapStateToProps(state, props) {
  const formName = props.form;
  return {
    // activeOfferMake: offerMakes.activeOfferMakePure(state, props.form),
    activeMarketAddress: markets.activeMarketAddress(state),
    canMakeOffer: offerMakes.canMakeOffer(state, props.offerMakeType),
    isCurrentTransactionValid: !offerMakes.isVolumeEmptyOrZero(state, props.offerMakeType),
    buyToken: offerMakes.activeOfferMakeBuyToken(state, formName),
    sellToken: offerMakes.activeOfferMakeSellToken(state, formName),
    // hasSufficientTokenAmount: offerMakes.hasSufficientTokenAmount(state, props.offerMakeType),
  };
}

export function mapDispatchToProps(dispatch) {
  const actions = {
    setOfferMakeModalClosed: offerMakesReducer.actions.setOfferMakeModalClosedEpic,
    makeOffer: offerMakesReducer.actions.makeOfferEpic,
    // getTransactionGasCostEstimate: offerMakesReducer.actions.getTransactionGasCostEstimateEpic,
  };
  return { actions: bindActionCreators(actions, dispatch) };
}

OasisMakeOfferModalWrapper.propTypes = propTypes;
OasisMakeOfferModalWrapper.displayName = 'OasisMakeOfferModal';
export default connect(mapStateToProps, mapDispatchToProps)(CSSModules(OasisMakeOfferModalWrapper, {modalStyles, styles}, { allowMultiple: true }));
