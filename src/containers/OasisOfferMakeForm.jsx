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

/**
 * Remove this styling TODO
 */
const box = { border: '1px solid black', padding: 20, marginTop: 20 };
const label = { width: '30%', display: 'inline-block' };
const fieldStyle = { textAlign: 'right' };

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
    if (parseFloat(newValue) > 0) {
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
          <button
            disabled={greaterThanZeroValidator(currentFormValues.price)}
            type="button"
            onClick={this.onSetBuyMax}
          >Buy max</button>
        );
      case MAKE_SELL_OFFER:
        return (
          <button
            disabled={greaterThanZeroValidator(currentFormValues.price)}
            type="button"
            onClick={this.onSetSellMax}
          >Sell max</button>
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
      <div>
        <form onSubmit={handleSubmit}>
          <div style={box}>
            <span style={label}>Price:</span>
            <Field
              autoComplete="off"
              style={fieldStyle}
              name="price" component="input"
              onChange={this.onPriceFieldChange}
              placeholder={0}
              normalize={normalize} type="text"/>
            {priceToken}
          </div>
          <div style={box}>
            <span style={label}>Volume:</span>
            <Field
              autoComplete="off"
              style={fieldStyle}
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
            /> {volumeToken}
            <div>
              {isUserTokenBalanceSufficient && <VolumeIsOverUserBalance offerMax={isUserTokenBalanceSufficient}/>}
            </div>
          </div>
          <div style={box}>
            <span style={label}>Total:</span>
            <span>
              {this.setMaxButton()}
            </span>
            <Field
              autoComplete="off"
              style={fieldStyle}
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
            /> {totalToken}
          </div>
        </form>
      </div>
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
  reduxForm({})(OfferMakeForm),
);

