import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';

// import ImmutablePropTypes from 'react-immutable-proptypes';
import ReactModal from 'react-modal';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { MAKE_BUY_OFFER, MAKE_SELL_OFFER } from '../store/reducers/offerMakes';

import offerMakesReducer from '../store/reducers/offerMakes';
import offerMakes from '../store/selectors/offerMakes';
import OfferMakeForm from './OasisOfferMakeForm';
import balances from '../store/selectors/balances';
import { getFormValues, getFormSyncErrors } from 'redux-form/immutable';
import OasisTransactionDetailsWrapper from './OasisTransactionDetails';
import transactions from '../store/selectors/transactions';
import { TX_OFFER_MAKE, TX_STATUS_CONFIRMED } from '../store/reducers/transactions';
import getUsersSoldAndReceivedAmounts from '../utils/offers/getUsersSoldAndReceivedAmounts';
import OasisTokenBalanceWrapper  from './OasisTokenBalance';
import markets from '../store/selectors/markets';

const BtnStyle = {
  padding: '10px 15px',
  margin: 5,
  backgroundColor: 'white',
  border: '1px solid gray',
};
const closeModalBtnStyle = {
  position: 'absolute',
  top: 20,
  right: 20,
};

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

const style = {
  content: {
    top: '40px',
    left: '30%',
    right: '30%',
    bottom: '40px',
    background: '#fff',
    overflow: 'auto',
    padding: '20px',
  },
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
    this.getTransactionGasCostEstimate = this.props.actions.getTransactionGasCostEstimate.bind(
      null, props.offerMakeType,
    );
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
      marketAddress,
      sellToken,
      buyToken,
      currentOfferMakeTransaction,
      isCurrentTransactionValid,
      form,
      offerMakeFormValues,
      hasSufficientTokenAmount,
    } = this.props;

    return (
      <ReactModal ariaHideApp={false} style={style} isOpen={true}>
        <div>
          <h3>{getOfferTitle(offerMakeType)}</h3>
          <button
            hidden={currentOfferMakeTransaction}
            style={{ ...BtnStyle, ...closeModalBtnStyle }}
            onClick={this.onCancel}>x
          </button>
        </div>
        <div>
          <b>Available:</b>
          <OasisTokenBalanceWrapper tokenName={sellToken}/>
        </div>
        <div>
          <OfferMakeForm
            baseToken={baseToken}
            quoteToken={quoteToken}
            offerMakeType={offerMakeType}
            form={form}
          />
          <div className="statusSection">
            <OasisTransactionDetailsWrapper
              transactionSubectType={TX_OFFER_MAKE}
              isTransactionValid={isCurrentTransactionValid}
              {...getUsersSoldAndReceivedAmounts(offerMakeType, offerMakeFormValues)}
              buyToken={buyToken}
              transaction={currentOfferMakeTransaction}
              sellToken={sellToken}
              transactionSubjectAddress={marketAddress}
              offerId={null}
              getTransactionGasCostEstimate={this.getTransactionGasCostEstimate}
              hasSufficientTokenAmount={hasSufficientTokenAmount}
            />
          </div>
          <div
            className="cancelBuyActionsSection"
            style={{ display: 'flex' }}
            hidden={currentOfferMakeTransaction}
          >
            <div>
              <button style={BtnStyle} onClick={this.onCancel}>Cancel</button>
            </div>
            <div className="notificationsSection">
            </div>
            <div>
              <button disabled={!canMakeOffer} style={BtnStyle} onClick={this.onBuyOffer}>
                {OasisMakeOfferModalWrapper.makeOfferBtnLabel(offerMakeType, baseToken)}
              </button>
            </div>
          </div>
        </div>
      </ReactModal>
    );
  }

  componentWillUpdate(nextProps) {
    if (isTransactionConfirmed(nextProps.currentOfferMakeTransaction)) {
      setTimeout(
        () => {
          this.props.actions.setOfferMakeModalClosed(this.props.offerMakeType);
        }, 10000,
      );
    }
  }
}

export function mapStateToProps(state, props) {
  return {
    activeOfferMake: offerMakes.activeOfferMake(state, props.form),
    // activeOfferMakeType: offerMakes.activeOfferMakeType(state, props.form),
    userBalances: balances.tokenBalances(state),
    offerMakeFormValues: getFormValues(props.form)(state, 'total', 'volume', 'price'),
    marketAddress: markets.activeMarketAddress(state),
    canMakeOffer: offerMakes.canMakeOffer(state, props.offerMakeType),
    formErrors: getFormSyncErrors(props.form)(state),
    isCurrentTransactionValid: !offerMakes.isVolumeEmptyOrZero(state, props.offerMakeType),
    buyToken: offerMakes.activeOfferMakeBuyToken(state, props.form),
    sellToken: offerMakes.activeOfferMakeSellToken(state, props.form),
    currentOfferMakeTransaction: transactions.getOfferTransaction(
      state, { offerId: offerMakes.activeOfferMakeTxSubjectId(state) },
    ),
    isCurrentOfferActive: offerMakes.isOfferActive(state) === true,
    hasSufficientTokenAmount: offerMakes.hasSufficientTokenAmount(state, props.offerMakeType),
  };
}

export function mapDispatchToProps(dispatch) {
  const actions = {
    setOfferMakeModalClosed: offerMakesReducer.actions.setOfferMakeModalClosedEpic,
    makeOffer: offerMakesReducer.actions.makeOfferEpic,
    getTransactionGasCostEstimate: offerMakesReducer.actions.getTransactionGasCostEstimateEpic,
  };
  return { actions: bindActionCreators(actions, dispatch) };
}

OasisMakeOfferModalWrapper.propTypes = propTypes;
OasisMakeOfferModalWrapper.displayName = 'OasisMakeOfferModal';
export default connect(mapStateToProps, mapDispatchToProps)(OasisMakeOfferModalWrapper);
