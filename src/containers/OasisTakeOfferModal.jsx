import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';

// import ImmutablePropTypes from 'react-immutable-proptypes';
import ReactModal from 'react-modal';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { TAKE_BUY_OFFER, TAKE_SELL_OFFER } from '../store/reducers/offerTakes';
import network from '../store/selectors/network';

import offerTakesReducer from '../store/reducers/offerTakes';
import offerTakes from '../store/selectors/offerTakes';
import OfferTakeForm from '../components/OfferTakeForm';
import balances from '../store/selectors/balances';
import tokens from '../store/selectors/tokens';
import { formatAmount } from '../utils/tokens/pair';
import { getFormValues, getFormSyncErrors } from 'redux-form/immutable';
import OasisTransactionDetailsWrapper  from './OasisTransactionDetails';
import SetTokenAllowanceTrustWrapper from './SetTokenAllowanceTrust';
import transactions from '../store/selectors/transactions';
import { TX_OFFER_TAKE, TX_STATUS_CONFIRMED } from '../store/reducers/transactions';
import getUsersSoldAndReceivedAmounts from '../utils/offers/getUsersSoldAndReceivedAmounts';

const BtnStyle = {
  padding: '10px 15px',
  margin: 5,
  backgroundColor: 'white',
  border: '1px solid gray'
};
const closeModalBtnStyle = {
  position: 'absolute',
  top: 20,
  right: 20
};

const OfferNotAvailable = () => (
  <div>
    <div>Offer is not available anymore</div>
    <div>Will close shortly</div>
  </div>
);


const propTypes = PropTypes && {
  isOpen: PropTypes.bool,
  offerTakeType: PropTypes.oneOf([
    TAKE_BUY_OFFER,
    TAKE_SELL_OFFER,
  ]).isRequired,
  actions: PropTypes.object.isRequired,
};

const getOfferTitle = (offerTakeType) => {
  switch (offerTakeType) {
    case TAKE_BUY_OFFER:  return 'Buy offer';
    case TAKE_SELL_OFFER: return 'Sell offer';
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

export class OasisTakeOfferModalWrapper extends PureComponent {

  static takeOfferBtnLabel(offerTakeType, { buyToken, sellToken }) {
    switch (offerTakeType) {
      case TAKE_SELL_OFFER: return `Buy ${buyToken}`;
      case TAKE_BUY_OFFER:  return `Sell ${sellToken}`;
    }
  }

  constructor(props) {
    super(props);
    this.onBuyOffer = this.onBuyOffer.bind(this);
    this.onCancel = this.onCancel.bind(this);
  }

  onCancel() { this.props.actions.setOfferTakeModalClosed(); }

  async onBuyOffer() {
    const { actions } = this.props;
    actions.checkIfOfferIsActive().then(
      (isActive) => {
        if(isActive) { actions.takeOffer() }
      }
    )

  }


  render() {
    const {
      offerTakeType,
      userBalances,
      canBuyOffer,
      activeOfferTakeOfferOwner,
      sellToken,
      buyToken,
      activeOfferTakeOfferId,
      currentOfferTakeTransaction,
      isCurrentTransactionValid,
      isCurrentOfferActive,
      offerTakeFormValues,
      hasSufficientTokenAmount,
      actions: {
        getTransactionGasCostEstimate
      }
    } = this.props;

    return (
      <ReactModal ariaHideApp={false} style={style} isOpen={true}>
        <div>
          <h3>{getOfferTitle(offerTakeType)}</h3>
          <button
            hidden={currentOfferTakeTransaction}
            style={{...BtnStyle, ...closeModalBtnStyle }}
            onClick={this.onCancel}>x
          </button>
        </div>
        <div>
          <b>Available:</b>
          <span>
            {formatAmount(userBalances.get(sellToken), true)} <b>{sellToken}</b>
          </span>
        </div>
        <div>
          <div>
            <OfferTakeForm estimateGas={getTransactionGasCostEstimate}/>
          </div>
          <div className="statusSection">
            <OasisTransactionDetailsWrapper
              hasSufficientTokenAmount={hasSufficientTokenAmount}
              transactionSubectType={TX_OFFER_TAKE}
              isTransactionValid={isCurrentTransactionValid}
              {...getUsersSoldAndReceivedAmounts(offerTakeType, offerTakeFormValues)}
              buyToken={buyToken}
              transaction={currentOfferTakeTransaction}
              sellToken={sellToken}
              offerId={activeOfferTakeOfferId}
              getTransactionGasCostEstimate={getTransactionGasCostEstimate}
            />
          </div>
          <SetTokenAllowanceTrustWrapper
            allowanceSubjectAddress={activeOfferTakeOfferOwner}
            tokenName={buyToken}
          />
          <div
            className="cancelBuyActionsSection"
            style={{ display: 'flex' }}
            hidden={currentOfferTakeTransaction}
          >
            <div>
              <button  style={BtnStyle} onClick={this.onCancel}>Cancel</button>
            </div>
            <div className="notificationsSection">
              { !isCurrentOfferActive && <OfferNotAvailable/>}
            </div>
            <div>
              <button disabled={!canBuyOffer} style={BtnStyle} onClick={this.onBuyOffer}>
                {OasisTakeOfferModalWrapper.takeOfferBtnLabel(offerTakeType, { buyToken, sellToken })}
              </button>
            </div>
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

    if(isTransactionConfirmed(nextProps.currentOfferTakeTransaction)) {
      setTimeout(
        () => { this.props.actions.setOfferTakeModalClosed(); }, 10000
      )
    }

    if(this.props.isCurrentOfferActive === false) {
      setTimeout(
        () => { this.props.actions.setOfferTakeModalClosed(); }, 10000
      )
    }
  }
}

export function mapStateToProps(state) {
  return {
    latestBlockNumber: network.latestBlockNumber(state),
    activeOfferTake: offerTakes.activeOfferTake(state),
    activeOfferTakeType: offerTakes.activeOfferTakeType(state),
    isOfferTakeModalOpen: offerTakes.isOfferTakeModalOpen(state),
    userBalances: balances.tokenBalances(state),
    activeTradingPair: tokens.activeTradingPair(state),
    offerTakeFormValues: getFormValues('takeOffer')(state, [ 'total', 'volume', 'price' ]),
    activeOfferTakeOfferOwner: offerTakes.activeOfferTakeOfferOwner(state),
    canBuyOffer: offerTakes.canBuyOffer(state),
    buyToken: offerTakes.activeOfferTakeBuyToken(state),
    sellToken: offerTakes.activeOfferTakeSellToken(state),
    activeOfferTakeOfferId: offerTakes.activeOfferTakeOfferId(state),
    formErrors: getFormSyncErrors('takeOffer')(state),
    isCurrentTransactionValid: !offerTakes.isVolumeEmptyOrZero(state),
    currentOfferTakeTransaction: transactions.getOfferTransaction(
      state, { offerId: offerTakes.activeOfferTakeOfferId(state) }
    ),
    isCurrentOfferActive: offerTakes.isOfferActive(state) === true,
    hasSufficientTokenAmount: offerTakes.hasSufficientTokenAmount(state)
  };
}

export function mapDispatchToProps(dispatch) {
  const actions = {
    checkIfOfferIsActive: offerTakesReducer.actions.checkIfOfferTakeSubjectStillActiveEpic,
    setOfferTakeModalClosed: offerTakesReducer.actions.setOfferTakeModalClosedEpic,
    takeOffer: offerTakesReducer.actions.takeOfferEpic,
    getTransactionGasCostEstimate: offerTakesReducer.actions.getTransactionGasCostEstimateEpic
  };
  return { actions: bindActionCreators(actions, dispatch) };
}

OasisTakeOfferModalWrapper.propTypes = propTypes;
OasisTakeOfferModalWrapper.displayName = 'OasisTakeOfferModal';
export default connect(mapStateToProps, mapDispatchToProps)(OasisTakeOfferModalWrapper);
