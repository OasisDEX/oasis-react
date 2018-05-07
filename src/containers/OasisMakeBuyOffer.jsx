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
import { MAKE_BUY_OFFER, MAKE_BUY_OFFER_FORM_NAME } from "../constants";
import OasisMakeOfferModalWrapper from "./OasisMakeOfferModal";
import offerMakes from "../store/selectors/offerMakes";
import OasisInsufficientAmountOfToken from "../components/OasisInsufficientAmountOfToken";
import OasisButton from "../components/OasisButton";
import platform from "../store/selectors/platform";
import styles from "./OasisMakeOffer.scss";
import CSSModules from "react-css-modules";

const propTypes = PropTypes && {
  actions: PropTypes.object.isRequired
};

export class OasisMakeBuyOfferWrapper extends PureComponent {
  constructor(props) {
    super(props);
    this.onModalOpen = this.onModalOpen.bind(this);
  }

  onModalOpen() {
    const { makeOfferModalOpen } = this.props.actions;
    makeOfferModalOpen(MAKE_BUY_OFFER);
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
      offerMakeType: MAKE_BUY_OFFER,
      form: MAKE_BUY_OFFER_FORM_NAME
    };
    return (
      <OasisWidgetFrame heading={`Buy ${baseToken}`} spaceForContent={true}>
        <OasisTokenBalanceSummary summary="Available" token={quoteToken} />
        <div>
          {this.getModal(formProps)}
          <OfferMakeForm {...formProps} />
        </div>
        <div className={styles.footer}>
          <div className={styles.helpBlock}>
            {hasSufficientTokenAmount === false && (
              <OasisInsufficientAmountOfToken tokenName={quoteToken} noBorder={true} />
            )}
          </div>
          <OasisButton
            className={styles.callToAction}
            color="success"
            size="md"
            disabled={!hasSufficientTokenAmount}
            onClick={this.onModalOpen}
          >
            Buy
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
      this.props.actions.initializeOfferMake(MAKE_BUY_OFFER);
    }
  }
}

export function mapStateToProps(state) {
  return {
    hasSufficientTokenAmount: offerMakes.hasSufficientTokenAmount(
      state,
      MAKE_BUY_OFFER
    ),
    isModalOpen: offerMakes.isOfferMakeModalOpen(state, MAKE_BUY_OFFER),
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

OasisMakeBuyOfferWrapper.propTypes = propTypes;
OasisMakeBuyOfferWrapper.displayName = "OasisMakeBuyOffer";
export default connect(mapStateToProps, mapDispatchToProps)(
  CSSModules(OasisMakeBuyOfferWrapper, styles)
);
