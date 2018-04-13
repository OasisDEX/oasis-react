import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
// import ImmutablePropTypes from 'react-immutable-proptypes';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import tokens from '../store/selectors/tokens';
import OasisWidgetFrame from '../containers/OasisWidgetFrame';
import OasisTokenBalanceWrapper  from './OasisTokenBalance';
import OfferMakeForm  from './OasisOfferMakeForm';
import offerMakesReducer, { MAKE_SELL_OFFER } from '../store/reducers/offerMakes';
import OasisMakeOfferModalWrapper  from './OasisMakeOfferModal';
import offerMakes from '../store/selectors/offerMakes';
import OasisInsufficientAmountOfToken from '../components/OasisInsufficientAmountOfToken';
import platform from '../store/selectors/platform';
import styles from './OasisMakeOffer.scss';
import CSSModules from 'react-css-modules';

const propTypes = PropTypes && {
  actions: PropTypes.object.isRequired
};

export const MAKE_SELL_OFFER_FORM_NAME = 'makeSellOffer';

export class OasisMakeSellOfferWrapper extends PureComponent {

  constructor(props) {
    super(props);
    this.onModalOpen = this.onModalOpen.bind(this);
  }

  onModalOpen () {
    const { makeOfferModalOpen } = this.props.actions;
    makeOfferModalOpen(MAKE_SELL_OFFER);
  }

  getModal(formProps) {
    return this.props.isModalOpen && (
      <OasisMakeOfferModalWrapper {...formProps}/>
    )
  }

  render() {

    const { baseToken, quoteToken, hasSufficientTokenAmount } = this.props;
    const formProps = {
      baseToken,
      quoteToken,
      offerMakeType: MAKE_SELL_OFFER,
      form: MAKE_SELL_OFFER_FORM_NAME
    };


    return (
      <OasisWidgetFrame heading={`Sell ${baseToken}`} spaceForContent={true}>
        <div className={styles.available}>
          Available <OasisTokenBalanceWrapper tokenName={baseToken}/>
        </div>
        <div>
          {this.getModal(formProps)}
          <OfferMakeForm {...formProps}/>
        </div>
        <div>
          {hasSufficientTokenAmount === false && <OasisInsufficientAmountOfToken tokenName={baseToken}/>}
        </div>
        <div>
          <button disabled={!hasSufficientTokenAmount} onClick={this.onModalOpen}>Sell</button>
        </div>
      </OasisWidgetFrame>
    );
  }


  componentWillUpdate(nextProps) {
    const pairChanged = nextProps.activeTradingPair !== this.props.activeTradingPair;
    const contractsInitiallyLoaded = !this.props.contractsLoaded && nextProps.contractsLoaded;
    if(contractsInitiallyLoaded || pairChanged) {
      this.props.actions.initializeOfferMake(MAKE_SELL_OFFER);
    }
  }
}

export function mapStateToProps(state) {
  return {
    hasSufficientTokenAmount: offerMakes.hasSufficientTokenAmount(state, MAKE_SELL_OFFER),
    isModalOpen: offerMakes.isOfferMakeModalOpen(state, MAKE_SELL_OFFER),
    baseToken: tokens.activeTradingPairBaseToken(state),
    quoteToken: tokens.activeTradingPairQuoteToken(state),
    activeTradingPair: tokens.activeTradingPair(state),
    contractsLoaded: platform.contractsLoaded(state)
  };
}
export function mapDispatchToProps(dispatch) {
  const actions = {
    makeOfferModalOpen: offerMakesReducer.actions.setOfferMakeModalOpenEpic,
    initializeOfferMake: offerMakesReducer.actions.initializeOfferMakeFormEpic
  };
  return { actions: bindActionCreators(actions, dispatch) };
}

OasisMakeSellOfferWrapper.propTypes = propTypes;
OasisMakeSellOfferWrapper.displayName = 'OasisMakeSellOffer';
export default connect(mapStateToProps, mapDispatchToProps)(CSSModules(OasisMakeSellOfferWrapper, styles));
