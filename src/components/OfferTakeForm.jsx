import React, { PureComponent } from "react";
import { PropTypes } from "prop-types";
import ImmutablePropTypes from "react-immutable-proptypes";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { Field, reduxForm } from "redux-form/immutable";

import web3 from "../bootstrap/web3";

import offerTakes from "../store/selectors/offerTakes";
import { TAKE_BUY_OFFER, TAKE_SELL_OFFER } from "../store/reducers/offerTakes";
import offerTakesReducer from "../store/reducers/offerTakes";
import tokens from "../store/selectors/tokens";
import balances from "../store/selectors/balances";
import {
  formatValue,
  greaterThanZeroValidator,
  // normalize,
  numericFormatValidator
} from "../utils/forms/offers";

import OasisButton from "../components/OasisButton";

import styles from "./OfferTakeForm.scss";
import tableStyles from "../styles/modules/_table.scss";
import CSSModules from "react-css-modules";
import MaskedTokenAmountInput from "./MaskedTokenAmountInput";
import { SETMAXBTN_HIDE_DELAY_MS } from "../constants";
import platform from "../store/selectors/platform";
import isNumericAndGreaterThanZero from "../utils/numbers/isNumericAndGreaterThanZero";

const fieldStyle = { textAlign: "right" };

const propTypes = PropTypes && {
  activeOfferTakeOfferData: ImmutablePropTypes.map.isRequired,
  buyToken: PropTypes.string.isRequired,
  sellToken: PropTypes.string.isRequired,
  offerTakeType: PropTypes.string.isRequired,
  activeTradingPairPrecision: PropTypes.number.isRequired,
  activeBaseTokenBalance: PropTypes.string.isRequired,
  onFormChange: PropTypes.func
};

const defaultProps = {};

const validateVolume = [greaterThanZeroValidator, numericFormatValidator];
const validateTotal = [greaterThanZeroValidator, numericFormatValidator];

export class OfferTakeForm extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      showMaxButton: false
    };
    this.componentIsUnmounted = false;
    this.currentSetMaxTimeout = null;

    this.onFormChange = this.onFormChange.bind(this);
    this.onVolumeFieldChange = this.onVolumeFieldChange.bind(this);
    this.onTotalFieldChange = this.onTotalFieldChange.bind(this);
    this.onSetBuyMax = this.onSetBuyMax.bind(this);
    this.onSetSellMax = this.onSetSellMax.bind(this);
    this.onSetMaxFocus = this.onSetMaxFocus.bind(this);
    this.onSetMaxBlur = this.onSetMaxBlur.bind(this);
    this.onTotalFieldSectionBlur = this.onTotalFieldSectionBlur.bind(this);
    this.onTotalFieldSectionFocus = this.onTotalFieldSectionFocus.bind(this);
    // this.estimateGas = throttle(this.props.estimateGas, 500);
  }

  onSetBuyMax() {
    this.props.actions.buyMax();
    // this.estimateGas();
  }
  onSetSellMax() {
    this.props.actions.sellMax();
    // this.estimateGas();
  }

  onVolumeFieldChange(event, newValue) {
    const { volumeFieldValueChanged } = this.props.actions;
    if (this.componentIsUnmounted === false) {
      setTimeout(() => volumeFieldValueChanged(newValue), 0);
    }
  }

  onTotalFieldChange(event, newValue) {
    const { totalFieldValueChanged } = this.props.actions;
    if (this.componentIsUnmounted === false) {
      setTimeout(() => totalFieldValueChanged(newValue), 0);
    }
  }

  setMaxButton() {

    if (false === this.state.showMaxButton) {
      return null;
    }

    const balanceOfTokenToPayWith = this.props.offerTakeType === TAKE_BUY_OFFER ?
      this.props.activeBaseTokenBalance :
      this.props.activeQuoteTokenBalance;

    if (web3.toBigNumber(balanceOfTokenToPayWith).gt(0)) {
      const {
        disableForm,
        globalFormLock,
        activeBaseTokenBalance,
        activeQuoteTokenBalance
      } = this.props;
      switch (this.props.offerTakeType) {
        case TAKE_BUY_OFFER:
          return (
            <OasisButton
              className={tableStyles.inputBtn}
              type="button"
              color="success"
              size="xs"
              onClick={this.onSetSellMax}
              onFocus={this.onSetMaxFocus}
              onBlur={this.onSetMaxBlur}
              disabled={
                disableForm ||
                globalFormLock ||
                !isNumericAndGreaterThanZero(activeBaseTokenBalance)
              }
            >
              Sell max
            </OasisButton>
          );
        case TAKE_SELL_OFFER:
          return (
            <OasisButton
              className={tableStyles.inputBtn}
              type="button"
              color="danger"
              size="xs"
              onClick={this.onSetBuyMax}
              disabled={
                disableForm ||
                globalFormLock ||
                !isNumericAndGreaterThanZero(activeQuoteTokenBalance)
              }
            >
              Buy max
            </OasisButton>
          );
      }
    } else {
      return null;
    }
  }

  renderPriceField() {
    const { priceToken } = this.getTokensByOfferTakeType();
    return (
      <tr>
        <th>Price</th>
        <td className={tableStyles.withInput}>
          <Field
            autoComplete="off"
            style={fieldStyle}
            name="price"
            component="input"
            format={formatValue}
            placeholder={0}
            // normalize={normalize}
            type="text"
            disabled={true}
          />
        </td>
        <td className={tableStyles.currency}>{priceToken}</td>
      </tr>
    );
  }

  renderAmountField() {
    const { volumeToken } = this.getTokensByOfferTakeType();
    const { disableForm, globalFormLock } = this.props;

    return (
      <tr>
        <th>Amount</th>
        <td className={tableStyles.withInput}>
          <Field
            autoComplete="off"
            style={fieldStyle}
            name="volume"
            component={MaskedTokenAmountInput}
            type="text"
            validate={validateVolume}
            min={0}
            placeholder={0}
            disabled={disableForm || globalFormLock}
            onChange={this.onVolumeFieldChange}
          />
        </td>
        <td className={tableStyles.currency}>{volumeToken}</td>
      </tr>
    );
  }

  renderTotalField() {
    const { totalToken } = this.getTokensByOfferTakeType();
    const { globalFormLock, disableForm } = this.props;
    return (
      <tr>
        <th>Total</th>
        <td className={tableStyles.withInput}>
          <div className={tableStyles.inputGroup}>
            {this.setMaxButton()}
            <div
              className={tableStyles.inputGroupEventHandlerChild}
              onFocus={this.onTotalFieldSectionFocus}
              onBlur={this.onTotalFieldSectionBlur}
            >
              <Field
                autoComplete="off"
                style={fieldStyle}
                min={0}
                name="total"
                component={MaskedTokenAmountInput}
                type="text"
                validate={validateTotal}
                placeholder={0}
                disabled={disableForm || globalFormLock}
                onChange={this.onTotalFieldChange}
              />
            </div>
          </div>
        </td>
        <td className={tableStyles.currency}>{totalToken}</td>
      </tr>
    );
  }

  getTokensByOfferTakeType() {
    const { offerTakeType, buyToken, sellToken } = this.props;
    let priceToken = null,
      volumeToken = null,
      totalToken = null;
    switch (offerTakeType) {
      case TAKE_BUY_OFFER:
        {
          priceToken = buyToken;
          volumeToken = sellToken;
          totalToken = buyToken;
        }
        break;
      case TAKE_SELL_OFFER:
        {
          priceToken = sellToken;
          volumeToken = buyToken;
          totalToken = sellToken;
        }
        break;
    }
    return { priceToken, volumeToken, totalToken };
  }

  onFormChange() {
    const { onFormChange } = this.props;
    if (this.componentIsUnmounted === false) {
      onFormChange && onFormChange();
    }
  }

  render() {
    const { handleSubmit } = this.props;
    return (
      <form onSubmit={handleSubmit}>
        <table className={tableStyles.table}>
          <tbody>
            {this.renderPriceField()}
            {this.renderAmountField()}
            {this.renderTotalField()}
          </tbody>
        </table>
      </form>
    );
  }

  onSetMaxFocus() {
    clearTimeout(this.currentSetMaxTimeout);
  }

  onSetMaxBlur() {
    this.setState({ showMaxButton: false });
  }

  onTotalFieldSectionFocus() {
    if (this.componentIsUnmounted === false) {
      this.setState({ showMaxButton: true });
    }
  }

  onTotalFieldSectionBlur() {
    if (this.componentIsUnmounted === false) {
      this.currentSetMaxTimeout = setTimeout(
        () => this.setState({ showMaxButton: false }),
        SETMAXBTN_HIDE_DELAY_MS
      );
    }
  }

  componentWillUnmount() {
    this.componentIsUnmounted = true;
  }
}

OfferTakeForm.displayName = "OfferTakeForm";
OfferTakeForm.propTypes = propTypes;
OfferTakeForm.defaultProps = defaultProps;

export function mapStateToProps(state) {
  return {
    activeOfferTakeOfferData: offerTakes.activeOfferTakeOfferData(state),
    buyToken: offerTakes.activeOfferTakeBuyToken(state),
    sellToken: offerTakes.activeOfferTakeSellToken(state),
    offerTakeType: offerTakes.activeOfferTakeType(state),
    activeTradingPairPrecision: tokens.precision(state),
    activeBaseTokenBalance: balances.activeBaseTokenBalance(state),
    activeQuoteTokenBalance: balances.activeQuoteTokenBalance(state),
    globalFormLock: platform.globalFormLock(state)
  };
}

export function mapDispatchToProps(dispatch) {
  const actions = {
    volumeFieldValueChanged:
      offerTakesReducer.actions.volumeFieldValueChangedEpic,
    totalFieldValueChanged:
      offerTakesReducer.actions.totalFieldValueChangedEpic,
    buyMax: offerTakesReducer.actions.buyMaxEpic,
    sellMax: offerTakesReducer.actions.sellMaxEpic
  };
  return { actions: bindActionCreators(actions, dispatch) };
}

export default connect(mapStateToProps, mapDispatchToProps)(
  reduxForm({ form: "takeOffer" })(
    CSSModules(OfferTakeForm, { styles, tableStyles }, { allowMultiple: true })
  )
);
