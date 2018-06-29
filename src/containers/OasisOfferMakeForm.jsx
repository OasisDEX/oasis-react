import React from "react";
import { PropTypes } from "prop-types";
// import throttle from 'lodash/throttle';
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { Field, reduxForm } from "redux-form/immutable";

import offerMakes from "../store/selectors/offerMakes";
import {
  MAKE_BUY_OFFER,
  MAKE_SELL_OFFER,
  SETMAXBTN_HIDE_DELAY_MS
} from "../constants";
import offerMakesReducer from "../store/reducers/offerMakes";
import tokens from "../store/selectors/tokens";
import balances from "../store/selectors/balances";
import {
  greaterThanZeroValidator,
  numericFormatValidator
} from "../utils/forms/offers";

import OasisButton from "../components/OasisButton";

import styles from "./OasisOfferMakeForm.scss";
import tableStyles from "../styles/modules/_table.scss";
import CSSModules from "react-css-modules";
import OasisVolumeIsGreaterThanUserBalance from "../components/OasisVolumeIsGreaterThanUserBalance";
// import { formatAmount, PRICE_DECIMAL } from '../utils/tokens/pair';
// import isNumeric from '../utils/numbers/isNumeric';
import MaskedTokenAmountInput from "../components/MaskedTokenAmountInput";
import platform from "../store/selectors/platform";
import isNumericAndGreaterThanZero from "../utils/numbers/isNumericAndGreaterThanZero";

const propTypes = PropTypes && {
  // activeOfferMakeOfferData: ImmutablePropTypes.map.isRequired,
  offerMakeType: PropTypes.string.isRequired,
  // isUserTokenBalanceSufficient: PropTypes.bool.isRequired,
  activeBaseTokenBalance: PropTypes.string,
  activeQuoteTokenBalance: PropTypes.string,
  disableForm: PropTypes.bool,
  shouldFormUpdate: PropTypes.bool.isRequired,
  onFormChange: PropTypes.func
};

const defaultProps = {
  shouldFormUpdate: true
};

const validateVolume = [greaterThanZeroValidator, numericFormatValidator];
const validateTotal = [greaterThanZeroValidator, numericFormatValidator];

export class OfferMakeForm extends React.Component {
  constructor(props) {
    super(props);
    this.componentIsUnmounted = false;
    this.currentSetMaxTimeout = null;

    this.state = {
      showMaxButton: false
    };

    this.onVolumeFieldChange = this.onVolumeFieldChange.bind(this);
    this.onTotalFieldChange = this.onTotalFieldChange.bind(this);
    this.onSetBuyMax = this.onSetBuyMax.bind(this);
    this.onSetSellMax = this.onSetSellMax.bind(this);
    this.onSetMaxFocus = this.onSetMaxFocus.bind(this);
    this.onSetMaxBlur = this.onSetMaxBlur.bind(this);
    this.onPriceFieldChange = this.onPriceFieldChange.bind(this);
    this.onTotalFieldSectionBlur = this.onTotalFieldSectionBlur.bind(this);
    this.onTotalFieldSectionFocus = this.onTotalFieldSectionFocus.bind(this);
    this.onFormChange = this.onFormChange.bind(this);
    // this.estimateGas = throttle(this.props.estimateGas || (() => null), 500);
  }

  onSetBuyMax() {
    this.props.actions.buyMax(this.props.offerMakeType);
  }

  onSetSellMax() {
    this.props.actions.sellMax(this.props.offerMakeType);
  }

  onVolumeFieldChange(event, newValue) {
    if (this.componentIsUnmounted === false) {
      setTimeout(() => {
        const { volumeFieldValueChanged } = this.props.actions;
        volumeFieldValueChanged(this.props.offerMakeType, newValue);
      }, 0);
    }
  }

  onPriceFieldChange(event, newValue) {
    if (this.componentIsUnmounted === false) {
      setTimeout(() => {
        const { priceFieldValueChanged } = this.props.actions;
        priceFieldValueChanged(this.props.offerMakeType, newValue);
      }, 0);
    }
  }

  onTotalFieldChange(event, newValue) {
    if (this.componentIsUnmounted === false) {
      setTimeout(() => {
        const { totalFieldValueChanged } = this.props.actions;
        totalFieldValueChanged(this.props.offerMakeType, newValue);
      }, 0);
    }
  }

  setMaxButton() {
    if (false === this.state.showMaxButton) {
      return null;
    }
    const {
      currentFormValues = {},
      disableForm,
      globalFormLock,
      activeBaseTokenBalance,
      activeQuoteTokenBalance
    } = this.props;
    switch (this.props.offerMakeType) {
      case MAKE_BUY_OFFER:
        return (
          <OasisButton
            className={tableStyles.inputBtn}
            disabled={
              greaterThanZeroValidator(currentFormValues.price) ||
              disableForm ||
              globalFormLock ||
              !isNumericAndGreaterThanZero(activeQuoteTokenBalance)
            }
            type="button"
            color="success"
            size="xs"
            onClick={this.onSetBuyMax}
            onFocus={this.onSetMaxFocus}
            onBlur={this.onSetMaxBlur}
          >
            Buy max
          </OasisButton>
        );
      case MAKE_SELL_OFFER:
        return (
          <OasisButton
            className={tableStyles.inputBtn}
            disabled={
              greaterThanZeroValidator(currentFormValues.price) ||
              disableForm ||
              globalFormLock ||
              !isNumericAndGreaterThanZero(activeBaseTokenBalance)
            }
            type="button"
            color="danger"
            size="xs"
            onClick={this.onSetSellMax}
            onFocus={this.onSetMaxFocus}
            onBlur={this.onSetMaxBlur}
          >
            Sell max
          </OasisButton>
        );
    }
    // }
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
        () => {
          if (this.componentIsUnmounted === false) {
            this.setState({ showMaxButton: false });
          }
        },
        SETMAXBTN_HIDE_DELAY_MS
      );
    }
  }

  renderPriceField() {
    const { disableForm, globalFormLock } = this.props;
    return (
      <Field
        autoComplete="off"
        name="price"
        component={MaskedTokenAmountInput}
        placeholder={0}
        disabled={disableForm || globalFormLock}
        type="text"
        onChange={this.onPriceFieldChange}
      />
    );
  }

  renderAmountField() {
    const { currentFormValues = {}, disableForm, globalFormLock } = this.props;
    return (
      <Field
        autoComplete="off"
        name="volume"
        component={MaskedTokenAmountInput}
        type="text"
        validate={validateVolume}
        min={0}
        placeholder={0}
        disabled={
          greaterThanZeroValidator(currentFormValues.price) ||
          disableForm ||
          globalFormLock
        }
        onChange={this.onVolumeFieldChange}
      />
    );
  }

  renderTotalField() {
    const { currentFormValues = {}, disableForm, globalFormLock } = this.props;
    return (
      <div
        className={tableStyles.inputGroupEventHandlerChild}
        onFocus={this.onTotalFieldSectionFocus}
        onBlur={this.onTotalFieldSectionBlur}
      >
        <Field
          autoComplete="off"
          min={0}
          onChange={this.onTotalFieldChange}
          name="total"
          component={MaskedTokenAmountInput}
          type="text"
          validate={validateTotal}
          placeholder={0}
          disabled={
            greaterThanZeroValidator(currentFormValues.price) ||
            // greaterThanZeroValidator(currentFormValues.volume) ||
            disableForm ||
            globalFormLock
          }
        />
      </div>
    );
  }

  onFormChange() {
    const { onFormChange } = this.props;
    if(this.componentIsUnmounted === false) {
      onFormChange && onFormChange();
    }
  }

  render() {
    const {
      baseToken,
      quoteToken,
      handleSubmit,
      isUserTokenBalanceSufficient
    } = this.props;

    return (
      <form onSubmit={handleSubmit} onChange={this.onFormChange}>
        <table className={tableStyles.table}>
          <tbody>
            <tr>
              <th>Price</th>
              <td className={tableStyles.withInput}>
                {this.renderPriceField()}
              </td>
              <td className={tableStyles.currency}> {quoteToken}</td>
            </tr>
            <tr>
              <th>Amount</th>
              <td className={tableStyles.withInput}>
                {this.renderAmountField()}
              </td>
              <td className={tableStyles.currency}>
                {baseToken}
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
                className={tableStyles.withInput}
                onBlur={this.onTotalFieldSectionBlur}
                onFocus={this.onTotalFieldSectionFocus}
              >
                <div className={tableStyles.inputGroup}>
                  {this.setMaxButton()}
                  {this.renderTotalField()}
                </div>
              </td>
              <td className={tableStyles.currency}>{quoteToken}</td>
            </tr>
          </tbody>
        </table>
      </form>
    );
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.shouldFormUpdate && !nextProps.globalFormLock) {
      return nextState !== this.state || nextProps !== this.props;
    } else {
      return false;
    }
  }
  componentWillUnmount() {
    this.componentIsUnmounted = true;
  }
}

OfferMakeForm.displayName = "OfferMakeForm";
OfferMakeForm.propTypes = propTypes;
OfferMakeForm.defaultProps = defaultProps;

export function mapStateToProps(state, props) {
  return {
    currentFormValues: offerMakes.currentFormValues(state)(props.form),
    activeTradingPairPrecision: tokens.precision(state),
    hasSufficientTokenAmount: offerMakes.hasSufficientTokenAmount(state)(props.offerMakeType),
    activeBaseTokenBalance: balances.activeBaseTokenBalance(state),
    activeQuoteTokenBalance: balances.activeQuoteTokenBalance(state),
    globalFormLock: platform.globalFormLock(state)
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
  reduxForm({})(
    CSSModules(OfferMakeForm, { styles, tableStyles }, { allowMultiple: true })
  )
);
