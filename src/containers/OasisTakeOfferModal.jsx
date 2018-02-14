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
import { getFormValues, getFormSyncErrors } from 'redux-form';
import SetTokenAllowanceTrustWrapper from './SetTokenAllowanceTrust';


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

const OfferNotAvailable = (
  <div>Offer is not available anymore</div>
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
    this.onSetBuyMax = this.onSetBuyMax.bind(this);
    this.onSetSellMax = this.onSetSellMax.bind(this);

  }

  onCancel() {
    this.props.actions.setOfferTakeModalClosed();
  }

  onSetBuyMax() {  this.props.actions.buyMax(); }
  onSetSellMax() { this.props.actions.sellMax(); }

  onBuyOffer() {
    this.props.actions.takeOffer();
  }

  setMaxButton() {
    switch (this.props.activeOfferTakeType) {
      case TAKE_BUY_OFFER:
        return (
          <button onClick={this.onSetSellMax}>Sell max</button>
        );
      case TAKE_SELL_OFFER:
        return (
          <button onClick={this.onSetBuyMax}>Buy max</button>
        );
    }
  }

  render() {
    const {
      offerTakeType,
      userBalances,
      canBuyOffer,
      activeOfferTakeOfferOwner,
      sellToken,
      buyToken,
    } = this.props;

    return (
      <ReactModal
        style={style}
        isOpen={true}
      >
        <div>
          <h3>{getOfferTitle(offerTakeType)}</h3>
          <button style={{...BtnStyle, ...closeModalBtnStyle }} onClick={this.onCancel}>x</button>
        </div>
        <div>
          <b>Available:</b>
          <span>
            {formatAmount(userBalances.get(sellToken), true)} <b>{sellToken}</b>
          </span>
        </div>
        <div>
          <div>
            <OfferTakeForm/>
            <div>
              {this.setMaxButton()}
            </div>
          </div>
          <div className="statusSection">
            <SetTokenAllowanceTrustWrapper
              allowanceSubjectAddress={activeOfferTakeOfferOwner}
              tokenName={buyToken}
            />
          </div>
          <div className="cancelBuyActionsSection" style={{ display: 'flex' }}>
            <div>
              <button style={BtnStyle} onClick={this.onCancel}>Cancel</button>
            </div>
            <div className="notificationsSection">
              {/*<OfferTakeAmountBelowLimitWrapper/>*/}
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
    offerTakeFormValues: getFormValues('offerTake')(state),
    activeOfferTakeOfferOwner: offerTakes.activeOfferTakeOfferOwner(state),
    canBuyOffer: offerTakes.canBuyOffer(state),
    buyToken: offerTakes.activeOfferTakeBuyToken(state),
    sellToken: offerTakes.activeOfferTakeSellToken(state),
    activeOfferTakeOfferId: offerTakes.activeOfferTakeOfferId(state),
    formErrors: getFormSyncErrors('offerTake')(state)
  };
}

export function mapDispatchToProps(dispatch) {
  const actions = {
    checkIfOfferIsActive: offerTakesReducer.actions.checkIfOfferTakeSubjectStillActiveEpic,
    setOfferTakeModalClosed: offerTakesReducer.actions.setOfferTakeModalClosedEpic,
    buyMax: offerTakesReducer.actions.buyMaxEpic,
    sellMax: offerTakesReducer.actions.sellMaxEpic,
    takeOffer: offerTakesReducer.actions.takeOfferEpic
  };
  return { actions: bindActionCreators(actions, dispatch) };
}

OasisTakeOfferModalWrapper.propTypes = propTypes;
OasisTakeOfferModalWrapper.displayName = 'OasisTakeOfferModal';
export default connect(mapStateToProps, mapDispatchToProps)(OasisTakeOfferModalWrapper);
