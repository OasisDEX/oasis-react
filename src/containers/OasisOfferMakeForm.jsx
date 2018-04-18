import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
import throttle from 'lodash/throttle';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Field, reduxForm } from 'redux-form/immutable';

import offerMakes from '../store/selectors/offerMakes';
import { MAKE_BUY_OFFER, MAKE_SELL_OFFER } from '../store/reducers/offerMakes';
import offerMakesReducer from '../store/reducers/offerMakes';
import tokens from '../store/selectors/tokens';
import balances from '../store/selectors/balances';
import { formatValue, greaterThanZeroValidator, normalize, numericFormatValidator } from '../utils/forms/offers';

import OasisButton from "../components/OasisButton";

import styles from './OasisOfferMakeForm.scss';
import CSSModules from 'react-css-modules';

const propTypes = PropTypes && {
  // activeOfferMakeOfferData: ImmutablePropTypes.map.isRequired,
  offerMakeType: PropTypes.string.isRequired,
  // isUserTokenBalanceSufficient: PropTypes.bool.isRequired,
  activeBaseTokenBalance: PropTypes.string,
  activeQuoteTokenBalance: PropTypes.string,

};

const defaultProps = {};

const VolumeIsOverUserBalance = ({ offerMax }) => (
  <div style={{ marginTop: 20, padding: 10, textAlign: 'center', backgroundColor: 'black', color: '#fff' }}>
    Current volume is greater than offer maximum of <b>{offerMax}</b>
  </div>
);

VolumeIsOverUserBalance.propTypes = { offerMax: PropTypes.string.isRequired };

const validateVolume = [greaterThanZeroValidator, numericFormatValidator];
const validateTotal = [greaterThanZeroValidator, numericFormatValidator];

export class OfferMakeForm extends PureComponent {

  constructor(props) {
    super(props);
    this.onVolumeFieldChange = this.onVolumeFieldChange.bind(this);
    this.onTotalFieldChange = this.onTotalFieldChange.bind(this);
    this.onSetBuyMax = this.onSetBuyMax.bind(this);
    this.onSetSellMax = this.onSetSellMax.bind(this);
    this.onPriceFieldChange = this.onPriceFieldChange.bind(this);
    this.estimateGas = throttle(this.props.estimateGas || (() => null), 500);
  }

  onSetBuyMax() {
    this.props.actions.buyMax(this.props.offerMakeType);
    this.estimateGas(this.props.form);
  }

  onSetSellMax() {
    this.props.actions.sellMax(this.props.offerMakeType);
    this.estimateGas(this.props.form);
  }

  onVolumeFieldChange(event, newValue, previousValue) {
    const { volumeFieldValueChanged } = this.props.actions;
    if ((!previousValue || newValue.toString() !== previousValue.toString())) {
      volumeFieldValueChanged(this.props.offerMakeType, newValue);
      if (parseFloat(newValue)) {
        this.estimateGas(this.props.offerMakeType);
      }
    }
  }

  onPriceFieldChange(event, newValue, previousValue) {
    if (parseFloat(newValue) >= 0 ) {
      const { priceFieldValueChanged } = this.props.actions;
      if ((!previousValue || newValue.toString() !== previousValue.toString())) {
        priceFieldValueChanged(this.props.offerMakeType, newValue);
        if (parseFloat(newValue)) {
          this.estimateGas(this.props.offerMakeType);
        }
      }
    }
  }

  onTotalFieldChange(event, newValue, previousValue) {
    const { totalFieldValueChanged } = this.props.actions;
    if ((!previousValue || newValue.toString() !== previousValue.toString())) {
      totalFieldValueChanged(this.props.offerMakeType, newValue);
      if (parseFloat(newValue)) {
        this.estimateGas();
      }
    }
  }

  setMaxButton() {
    const { currentFormValues = {} } = this.props;
    switch (this.props.offerMakeType) {
      case MAKE_BUY_OFFER:
        return (
            <OasisButton
                className={styles.setMaxBtn}
                disabled={greaterThanZeroValidator(currentFormValues.price)}
                type="button"
                color="success"
                size="xs"
                onClick={this.onSetBuyMax}
            >Buy max
            </OasisButton>
        );
      case MAKE_SELL_OFFER:
        return (
          <OasisButton
            className={styles.setMaxBtn}
            disabled={greaterThanZeroValidator(currentFormValues.price)}
            type="button"
            color="danger"
            size="xs"
            onClick={this.onSetSellMax}
          >Sell max</OasisButton>
        );

    }
  }

  render() {
    const {
      baseToken,
      quoteToken,
      handleSubmit,
      isUserTokenBalanceSufficient,
      currentFormValues = {},
    } = this.props;

    const volumeToken = baseToken, totalToken = quoteToken, priceToken = quoteToken;
    return (
      <form onSubmit={handleSubmit}>
        <table className={styles.table}>
          <tbody>
          <tr>
            <th>Price</th>
            <td className={styles.amount}>
                <Field
                  autoComplete="off"
                  name="price" component="input"
                  onChange={this.onPriceFieldChange}
                  placeholder={0}
                  normalize={normalize} type="text"/>
            </td>
            <td className={styles.currency}> {priceToken}</td>
          </tr>
          <tr>
            <th>Amount</th>
            <td className={styles.amount}>
            <Field
              autoComplete="off"
              onChange={this.onVolumeFieldChange}
              normalize={normalize}
              onBlur={formatValue}
              name="volume"
              component="input"
              type="text"
              validate={validateVolume}
              min={0}
              placeholder={0}
              disabled={greaterThanZeroValidator(currentFormValues.price)}
            /></td>
            <td className={styles.currency}>
              {volumeToken}
              <div>
                  {isUserTokenBalanceSufficient && <VolumeIsOverUserBalance offerMax={isUserTokenBalanceSufficient}/>}
              </div>
            </td>
          </tr>
          <tr>
            <th>Total</th>
            <td className={styles.amount}>
              <div className={styles.inputGroup}>
                {this.setMaxButton()}
              <Field
                autoComplete="off"
                min={0}
                onChange={this.onTotalFieldChange}
                normalize={normalize}
                onBlur={formatValue}
                name="total"
                component="input"
                type="text"
                validate={validateTotal}
                placeholder={0}
                disabled={greaterThanZeroValidator(currentFormValues.price) || greaterThanZeroValidator(currentFormValues.volume)}
              />
              </div>
            </td>
            <td className={styles.currency}>
              {totalToken}
            </td>
          </tr>
          </tbody>
        </table>
      </form>
    );
  }
}

OfferMakeForm.displayName = 'OfferMakeForm';
OfferMakeForm.propTypes = propTypes;
OfferMakeForm.defaultProps = defaultProps;

export function mapStateToProps(state, props) {
  return {
    currentFormValues: offerMakes.currentFormValues(state, props.form),
    activeTradingPairPrecision: tokens.precision(state),
    hasSufficientTokenAmount: offerMakes.hasSufficientTokenAmount(state, props.offerMakeType),
    activeBaseTokenBalance: balances.activeBaseTokenBalance(state),
    activeQuoteTokenBalance: balances.activeQuoteTokenBalance(state),
  };
}

export function mapDispatchToProps(dispatch) {
  const actions = {
    priceFieldValueChanged: offerMakesReducer.actions.priceFieldChangedEpic,
    volumeFieldValueChanged: offerMakesReducer.actions.volumeFieldValueChangedEpic,
    totalFieldValueChanged: offerMakesReducer.actions.totalFieldValueChangedEpic,
    buyMax: offerMakesReducer.actions.buyMaxEpic,
    sellMax: offerMakesReducer.actions.sellMaxEpic,
  };
  return { actions: bindActionCreators(actions, dispatch) };
}

export default connect(mapStateToProps, mapDispatchToProps)(
  reduxForm({})(CSSModules(OfferMakeForm, styles)),
);

