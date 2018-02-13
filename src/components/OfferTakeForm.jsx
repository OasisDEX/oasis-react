import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
// import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Field, reduxForm } from 'redux-form/immutable'

import offerTakes from '../store/selectors/offerTakes';
import web3 from '../bootstrap/web3';
import { TAKE_BUY_OFFER, TAKE_SELL_OFFER } from '../store/reducers/offerTakes';
import offerTakesReducer from '../store/reducers/offerTakes';
import tokens from '../store/selectors/tokens';


const propTypes = PropTypes && {
};
const defaultProps = {};

const box = { border: '1px solid black', padding: 20, marginTop: 20 };
const label = { width: '30%', display: 'inline-block' };

const normalize =
  (value, previousValue) =>
    value == 0 ? value :
    !isFinite(value) ? previousValue: value.replace(/[^\d.-]/g, '').toString();

const formatValue = (value) =>  isFinite(value) ?  web3.toBigNumber(value).toFormat(5): 'its not finite';

const numericFormatValidator = value => {
  if(!/^(\d+\.?\d*|\.\d+)$/.test(value)) {
    return `Doesn't match expected format`;
  } else { return null; }
};

const greaterThanZeroValidator = value => {
  if(isFinite(value) && web3.toBigNumber(value).gt(0)) {
    return `VALIDATOR_ERROR/MUST_BE_GREATER_THAN_ZERO`;
  } else { return null; }
};

const validateVolume = [greaterThanZeroValidator, numericFormatValidator];
const validateTotal  = [greaterThanZeroValidator, numericFormatValidator];
export class OfferTakeForm extends PureComponent {

  constructor(props) {
    super(props);
    this.onVolumeFieldChange = this.onVolumeFieldChange.bind(this);
    this.onTotalFieldChange =  this.onTotalFieldChange.bind(this);
  }

  onVolumeFieldChange(event, newValue, previousValue) {
    const { volumeFieldValueChanged } = this.props.actions;
    if(parseFloat(newValue) > 0 && (newValue.toString() !== previousValue.toString())){
      volumeFieldValueChanged(newValue);
    }

  }
  onTotalFieldChange(event, newValue, previousValue) {
    const { totalFieldValueChanged } = this.props.actions;
    if(parseFloat(newValue) > 0 && (newValue.toString() !== previousValue.toString())){
      totalFieldValueChanged(newValue);
    }
  }

  render() {
    const { offerTakeType, handleSubmit, buyToken, sellToken } = this.props;
    let volumeToken = null, totalToken = null, priceToken = null;
    switch (offerTakeType) {

      case TAKE_BUY_OFFER: {
        priceToken = buyToken;
        volumeToken = sellToken;
        totalToken = buyToken;
      } break;
      case TAKE_SELL_OFFER: {
        priceToken = sellToken;
        volumeToken = buyToken;
        totalToken = sellToken;
      } break;
    }
    return (
      <div>
        <form onSubmit={handleSubmit}>
          <div style={box}>
            <span style={label}>Price:</span>
            <Field
              name="price" component="input"
              format={formatValue}
              normalize={normalize} disabled type="number"/>
            {priceToken}
          </div>
          <div style={box}>
            <span style={label}>Volume:</span>
            <Field
              onChange={this.onVolumeFieldChange}
              normalize={normalize}
              format={formatValue}
              name="volume"
              component="input"
              type="text"
              validate={validateVolume}
              min={0}
            /> {volumeToken}
          </div>
          <div style={box}>
            <span style={label}>Total:</span>
            <Field
              min={0}
              onChange={this.onTotalFieldChange}
              normalize={normalize}
              format={formatValue}
              name="total"
              component="input"
              type="text"
              validate={validateTotal}
            /> {totalToken}
          </div>
        </form>
      </div>
    );
  }
}

OfferTakeForm.displayName = 'OfferTakeForm';
OfferTakeForm.propTypes = propTypes;
OfferTakeForm.defaultProps = defaultProps;
export function mapDispatchToProps(dispatch) {
  const actions = {
    volumeFieldValueChanged: offerTakesReducer.actions.volumeFieldValueChangedEpic,
    totalFieldValueChanged:  offerTakesReducer.actions.totalFieldValueChangedEpic
  };
  return { actions: bindActionCreators(actions, dispatch) };
}

export function mapStateToProps(state) {
  return {
    activeOfferTakeOfferData: offerTakes.activeOfferTakeOfferData(state),
    buyToken: offerTakes.activeOfferTakeBuyToken(state),
    sellToken: offerTakes.activeOfferTakeSellToken(state),
    offerTakeType: offerTakes.activeOfferTakeType(state),
    activeTradingPairPrecision: tokens.precision(state)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(
  reduxForm({ form: 'takeOffer' })(OfferTakeForm)
);

