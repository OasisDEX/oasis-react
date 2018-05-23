import React, { PureComponent } from "react";
import { PropTypes } from "prop-types";
// import throttle from 'lodash/throttle';
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { Field, reduxForm } from "redux-form/immutable";

import offerMakes from "../store/selectors/offerMakes";
import { MAKE_BUY_OFFER, MAKE_SELL_OFFER } from "../constants";
import offerMakesReducer from "../store/reducers/offerMakes";
import tokens from "../store/selectors/tokens";
import balances from "../store/selectors/balances";
import {
  formatValue,
  greaterThanZeroValidator,
  // normalize,
  numericFormatValidator
} from "../utils/forms/offers";

import OasisButton from "../components/OasisButton";

import styles from "./OasisOfferMakeForm.scss";
import CSSModules from "react-css-modules";
import OasisVolumeIsGreaterThanUserBalance from "../components/OasisVolumeIsGreaterThanUserBalance";
import { formatAmount, PRICE_DECIMAL } from '../utils/tokens/pair';
import isNumeric from '../utils/numbers/isNumeric';
import { amountMask } from '../inputMasks';
import {createNumberMask} from "redux-form-input-masks";

const propTypes = PropTypes && {
  // activeOfferMakeOfferData: ImmutablePropTypes.map.isRequired,
  offerMakeType: PropTypes.string.isRequired,
  // isUserTokenBalanceSufficient: PropTypes.bool.isRequired,
  activeBaseTokenBalance: PropTypes.string,
  activeQuoteTokenBalance: PropTypes.string,
  disableForm: PropTypes.bool
};

const defaultProps = {};

const validateVolume = [greaterThanZeroValidator, numericFormatValidator];
const validateTotal = [greaterThanZeroValidator, numericFormatValidator];

export class OfferMakeForm extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {};

    this.onVolumeFieldChange = this.onVolumeFieldChange.bind(this);
    this.onTotalFieldChange = this.onTotalFieldChange.bind(this);
    this.onSetBuyMax = this.onSetBuyMax.bind(this);
    this.onSetSellMax = this.onSetSellMax.bind(this);
    this.onPriceFieldChange = this.onPriceFieldChange.bind(this);
    this.onTotalFieldSectionBlur = this.onTotalFieldSectionBlur.bind(this);
    this.onTotalFieldSectionFocus = this.onTotalFieldSectionFocus.bind(this);
    // this.estimateGas = throttle(this.props.estimateGas || (() => null), 500);
  }

  onSetBuyMax() {
    this.props.actions.buyMax(this.props.offerMakeType);
  }

  onSetSellMax() {
    this.props.actions.sellMax(this.props.offerMakeType);
  }

  onVolumeFieldChange(newValue) {
    const { volumeFieldValueChanged } = this.props.actions;
    // if (!previousValue || newValue.toString() !== previousValue.toString()) {
      volumeFieldValueChanged(this.props.offerMakeType, newValue);
    // }
  }

  onPriceFieldChange(newValue) {
    // if (parseFloat(newValue) >= 0) {
      const { priceFieldValueChanged } = this.props.actions;
    //   if (!previousValue || newValue.toString() !== previousValue.toString()) {
        priceFieldValueChanged(this.props.offerMakeType, newValue);
      // }
    // }
  }

  onTotalFieldChange(newValue) {
    const { totalFieldValueChanged } = this.props.actions;
    // if (!previousValue || newValue.toString() !== previousValue.toString()) {
      totalFieldValueChanged(this.props.offerMakeType, newValue);
    // }
  }

  setMaxButton() {
    const { currentFormValues = {}, disableForm } = this.props;
    // if (!this.state.showMaxButton) { return null; }
    // else {
    switch (this.props.offerMakeType) {
      case MAKE_BUY_OFFER:
        return (
          <OasisButton
            className={styles.setMaxBtn}
            disabled={greaterThanZeroValidator(currentFormValues.price) || disableForm}
            type="button"
            color="success"
            size="xs"
            onClick={this.onSetBuyMax}
          >
            Buy max
          </OasisButton>
        );
      case MAKE_SELL_OFFER:
        return (
          <OasisButton
            className={styles.setMaxBtn}
            disabled={greaterThanZeroValidator(currentFormValues.price) || disableForm}
            type="button"
            color="danger"
            size="xs"
            onClick={this.onSetSellMax}
          >
            Sell max
          </OasisButton>
        );
    }
    // }
  }

  onTotalFieldSectionFocus() {
    this.setState({ showMaxButton: true });
  }

  onTotalFieldSectionBlur() {
    this.setState({ showMaxButton: false });
  }

  formatField(value, fieldName){
    console.log({value, fieldName});
    if (isNumeric(value)) {
      return formatAmount(value, false, null, PRICE_DECIMAL);
    }
  }

  render() {
    const {
      baseToken,
      quoteToken,
      handleSubmit,
      isUserTokenBalanceSufficient,
      currentFormValues = {},
      disableForm
    } = this.props;

    const volumeToken = baseToken,
      totalToken = quoteToken,
      priceToken = quoteToken;
    return (
      <form onSubmit={handleSubmit}>
        <table className={styles.table}>
          <tbody>
            <tr>
              <th>Price</th>
              <td className={styles.amount}>
                <Field
                  autoComplete="off"
                  name="price"
                  component="input"
                  placeholder={0}
                  disabled={disableForm}
                  type="text"
                  {...amountMask({onChange: this.onPriceFieldChange})}
                />
              </td>
              <td className={styles.currency}> {priceToken}</td>
            </tr>
            <tr>
              <th>Amount</th>
              <td className={styles.amount}>
                <Field
                  autoComplete="off"
                  onBlur={formatValue}
                  name="volume"
                  component="input"
                  type="text"
                  validate={validateVolume}
                  min={0}
                  placeholder={0}
                  disabled={
                    greaterThanZeroValidator(currentFormValues.price) ||
                    disableForm
                  }
                  {...amountMask({onChange: this.onVolumeFieldChange})}
                />
              </td>
              <td className={styles.currency}>
                {volumeToken}
                <div>
                  {isUserTokenBalanceSufficient && (
                    <OasisVolumeIsGreaterThanUserBalance
                      offerMax={isUserTokenBalanceSufficient}
                    />
                  )}
                </div>
              </td>
            </tr>
            <tr>
              <th>Total</th>
              <td
                className={styles.amount}
                onBlur={this.onTotalFieldSectionBlur}
                onFocus={this.onTotalFieldSectionFocus}
              >
                <div className={styles.inputGroup}>
                  {this.setMaxButton()}
                  <Field
                    autoComplete="off"
                    min={0}
                    onChange={this.onTotalFieldChange}
                    // normalize={normalize}
                    onBlur={formatValue}
                    name="total"
                    component="input"
                    type="text"
                    validate={validateTotal}
                    placeholder={0}
                    disabled={
                      greaterThanZeroValidator(currentFormValues.price) ||
                      greaterThanZeroValidator(currentFormValues.volume) ||
                      disableForm
                    }
                    {...amountMask({onChange: this.onTotalFieldChange})}
                  />
                </div>
              </td>
              <td className={styles.currency}>{totalToken}</td>
            </tr>
          </tbody>
        </table>
      </form>
    );
  }
}

OfferMakeForm.displayName = "OfferMakeForm";
OfferMakeForm.propTypes = propTypes;
OfferMakeForm.defaultProps = defaultProps;

export function mapStateToProps(state, props) {
  return {
    currentFormValues: offerMakes.currentFormValues(state, props.form),
    activeTradingPairPrecision: tokens.precision(state),
    hasSufficientTokenAmount: offerMakes.hasSufficientTokenAmount(
      state,
      props.offerMakeType
    ),
    activeBaseTokenBalance: balances.activeBaseTokenBalance(state),
    activeQuoteTokenBalance: balances.activeQuoteTokenBalance(state)
  };
}

export function mapDispatchToProps(dispatch) {
  const actions = {
    priceFieldValueChanged: offerMakesReducer.actions.priceFieldChangedEpic,
    volumeFieldValueChanged:
      offerMakesReducer.actions.volumeFieldValueChangedEpic,
    totalFieldValueChanged:
      offerMakesReducer.actions.totalFieldValueChangedEpic,
    buyMax: offerMakesReducer.actions.buyMaxEpic,
    sellMax: offerMakesReducer.actions.sellMaxEpic
  };
  return { actions: bindActionCreators(actions, dispatch) };
}

export default connect(mapStateToProps, mapDispatchToProps)(
  reduxForm({})(CSSModules(OfferMakeForm, styles))
);
