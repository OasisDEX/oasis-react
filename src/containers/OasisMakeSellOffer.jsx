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
import InfoBox from "../components/InfoBox";
import isVolumeOrPriceEmptyOrZero from "../store/selectors/isVolumeOrPriceEmptyOrZero";
import OasisOfferBelowDustLimitWrapper from "./OasisOfferBelowDustLimit";
import OasisYourOrderExceedsMaxTotalForToken from '../components/OasisYourOrderExceedsMaxTotalForToken';

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
    const {
      activeTradingPair: { baseToken, quoteToken },
      hasSufficientTokenAmount,
      // canMakeOffer,
      globalFormLock,
      isModalOpen,
      isTotalOverTheTokenMax,
      isPriceSet
    } = this.props;
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
          <OfferMakeForm {...formProps} shouldFormUpdate={!isModalOpen}/>
        </div>
        <div className={styles.footer}>
          <div className={styles.helpBlock}>
            {isPriceSet && hasSufficientTokenAmount === false && (
              <OasisInsufficientAmountOfToken
                noBorder={true}
                tokenName={baseToken}
              />
            )}
            {hasSufficientTokenAmount && (
              <OasisOfferBelowDustLimitWrapper
                noBorder
                tokenName={baseToken}
                offerType={MAKE_SELL_OFFER}
              />
            )}
            {hasSufficientTokenAmount && isTotalOverTheTokenMax && (
              <OasisYourOrderExceedsMaxTotalForToken noBorder/>
            )}
            <InfoBox hidden={isPriceSet} noBorder  color="muted">
              {!globalFormLock && "Enter a price to unlock amount and total."}
            </InfoBox>
          </div>
          <OasisButton
            className={styles.callToAction}
            color="danger"
            size="md"
            disabled="true"
            onClick={this.onModalOpen}
          >
            Sell
          </OasisButton>
        </div>
      </OasisWidgetFrame>
    );
  }

  UNSAFE_componentWillUpdate(nextProps) {
    const pairChanged =
      nextProps.activeTradingPair !== this.props.activeTradingPair;
    const contractsInitiallyLoaded =
      !this.props.contractsLoaded && nextProps.contractsLoaded;
    if (contractsInitiallyLoaded || pairChanged) {
      this.props.actions.initializeOfferMake(MAKE_SELL_OFFER);
    }
  }

  // shouldComponentUpdate(nextProps, nextState) {
  //   return !this.props.isModalOpen || nextProps.isModalOpen === false
  //     ? this.state !== nextState || this.props !== nextProps
  //     : false;
  // }
}

export function mapStateToProps(state) {
  return {
    isTotalOverTheTokenMax: offerMakes.isTotalOverTheTokenLimit(
      state,
      MAKE_SELL_OFFER
    ),
    hasSufficientTokenAmount: offerMakes.hasSufficientTokenAmount(state)(MAKE_SELL_OFFER),
    canMakeOffer:
      tokens.activeTradingPair(state) && platform.contractsLoaded(state)
        ? offerMakes.canMakeOffer(state, MAKE_SELL_OFFER, true)
        : false,
    isModalOpen: offerMakes.isOfferMakeModalOpen(state)(MAKE_SELL_OFFER),
    activeTradingPair: tokens.activeTradingPair(state),
    contractsLoaded: platform.contractsLoaded(state),
    isPriceSet: offerMakes.isMakeSellOfferPriceSet(state),
    isVolumeEmptyOrZero: isVolumeOrPriceEmptyOrZero(state)(MAKE_SELL_OFFER),
    globalFormLock: platform.globalFormLock(state)
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
