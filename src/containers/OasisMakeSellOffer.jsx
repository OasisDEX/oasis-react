import React, { PureComponent } from "react";
import { PropTypes } from "prop-types";
// import ImmutablePropTypes from 'react-immutable-proptypes';

import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import tokens from "../store/selectors/tokens";
import OasisWidgetFrame from "../containers/OasisWidgetFrame";
import OasisTokenBalanceSummary from "./OasisTokenBalanceSummary";
import OfferMakeForm from "./OasisOfferMakeForm";
import offerMakesReducer from "../store/reducers/offerMakes";
import { MAKE_SELL_OFFER, MAKE_SELL_OFFER_FORM_NAME } from "../constants";
import OasisMakeOfferModalWrapper from "./OasisMakeOfferModal";
import offerMakes from "../store/selectors/offerMakes";
import OasisInsufficientAmountOfToken from "../components/OasisInsufficientAmountOfToken";
import OasisButton from "../components/OasisButton";
import platform from "../store/selectors/platform";
import styles from "./OasisMakeOffer.scss";
import CSSModules from "react-css-modules";
import InfoBox from '../components/InfoBox';
import InfoBoxBody from '../components/InfoBoxBody';

const propTypes = PropTypes && {
  actions: PropTypes.object.isRequired
};

export class OasisMakeSellOfferWrapper extends PureComponent {
  constructor(props) {
    super(props);
    this.onModalOpen = this.onModalOpen.bind(this);
  }

  onModalOpen() {
    const { makeOfferModalOpen } = this.props.actions;
    makeOfferModalOpen(MAKE_SELL_OFFER);
  }

  getModal(formProps) {
    return (
      this.props.isModalOpen && <OasisMakeOfferModalWrapper {...formProps} />
    );
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
        <OasisTokenBalanceSummary summary="Available" token={baseToken} />
        <div>
          {this.getModal(formProps)}
          <OfferMakeForm {...formProps} />
        </div>
        <div className={styles.footer}>
          <div className={styles.helpBlock}>
            {hasSufficientTokenAmount === false && (
              <OasisInsufficientAmountOfToken
                noBorder={true}
                tokenName={baseToken}
              />
            )}
          </div>
          <InfoBox hidden={this.props.isPriceSet} noBorder>
            <InfoBoxBody>Enter a price to unlock amount and total.</InfoBoxBody>
          </InfoBox>
          <OasisButton
            className={styles.callToAction}
            color="danger"
            size="md"
            disabled={!hasSufficientTokenAmount}
            onClick={this.onModalOpen}
          >
            Sell
          </OasisButton>
        </div>
      </OasisWidgetFrame>
    );
  }

  componentWillUpdate(nextProps) {
    const pairChanged =
      nextProps.activeTradingPair !== this.props.activeTradingPair;
    const contractsInitiallyLoaded =
      !this.props.contractsLoaded && nextProps.contractsLoaded;
    if (contractsInitiallyLoaded || pairChanged) {
      this.props.actions.initializeOfferMake(MAKE_SELL_OFFER);
    }
  }
}

export function mapStateToProps(state) {
  return {
    hasSufficientTokenAmount: offerMakes.hasSufficientTokenAmount(
      state,
      MAKE_SELL_OFFER
    ),
    isModalOpen: offerMakes.isOfferMakeModalOpen(state, MAKE_SELL_OFFER),
    baseToken: tokens.activeTradingPairBaseToken(state),
    quoteToken: tokens.activeTradingPairQuoteToken(state),
    activeTradingPair: tokens.activeTradingPair(state),
    contractsLoaded: platform.contractsLoaded(state),
    isPriceSet: offerMakes.isMakeSellOfferPriceSet(state),
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
OasisMakeSellOfferWrapper.displayName = "OasisMakeSellOffer";
export default connect(mapStateToProps, mapDispatchToProps)(
  CSSModules(OasisMakeSellOfferWrapper, styles)
);
