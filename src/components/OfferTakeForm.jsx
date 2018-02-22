import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import throttle from 'lodash/throttle';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Field, reduxForm } from 'redux-form/immutable'

import web3 from '../bootstrap/web3';

import offerTakes from '../store/selectors/offerTakes';
import { TAKE_BUY_OFFER, TAKE_SELL_OFFER } from '../store/reducers/offerTakes';
import offerTakesReducer from '../store/reducers/offerTakes';
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
  activeOfferTakeOfferData: ImmutablePropTypes.map.isRequired,
  buyToken: PropTypes.string.isRequired,
  sellToken: PropTypes.string.isRequired,
  offerTakeType: PropTypes.string.isRequired,
  activeTradingPairPrecision: PropTypes.number.isRequired,
  isVolumeGreaterThanOfferMax: PropTypes.bool.isRequired,
  activeBaseTokenBalance: PropTypes.string.isRequired
};


const defaultProps = {};


const VolumeIsOverTheOfferMax = ({ offerMax }) => (
  <div style={{marginTop: 20,padding: 10, textAlign: 'center', backgroundColor:'black', color:'#fff' }}>
    Current volume is greater than offer maximum  of <b>{offerMax}</b>
  </div>
);

VolumeIsOverTheOfferMax.propTypes = { offerMax: PropTypes.string.isRequired };



const validateVolume = [ greaterThanZeroValidator, numericFormatValidator ];
const validateTotal  = [ greaterThanZeroValidator, numericFormatValidator ];


export class OfferTakeForm extends PureComponent {

  constructor(props) {
    super(props);
    this.onVolumeFieldChange = this.onVolumeFieldChange.bind(this);
    this.onTotalFieldChange =  this.onTotalFieldChange.bind(this);
    this.onSetBuyMax = this.onSetBuyMax.bind(this);
    this.onSetSellMax = this.onSetSellMax.bind(this);
    this.estimateGas = throttle(this.props.estimateGas, 500);
  }

  onSetBuyMax() {
    this.props.actions.buyMax();
    this.estimateGas();
  }
  onSetSellMax() {
    this.props.actions.sellMax();
    this.estimateGas();
  }


  onVolumeFieldChange(event, newValue, previousValue) {
    const { volumeFieldValueChanged } = this.props.actions;
    if((newValue.toString() !== previousValue.toString())){
      volumeFieldValueChanged(newValue);
      if(parseFloat(newValue)) {
        this.estimateGas();
      }
    }

  }
  onTotalFieldChange(event, newValue, previousValue) {
    const { totalFieldValueChanged } = this.props.actions;
    if((newValue.toString() !== previousValue.toString())){
      totalFieldValueChanged(newValue);
      if(parseFloat(newValue)) {
        this.estimateGas();
      }
    }
  }

  setMaxButton() {
    if(web3.toBigNumber(this.props.activeBaseTokenBalance).gt(0)) {

      switch (this.props.offerTakeType) {
        case TAKE_BUY_OFFER:
          return (
            <button type="button" onClick={this.onSetSellMax}>Sell max</button>
          );
        case TAKE_SELL_OFFER:
          return (
            <button type="button" onClick={this.onSetBuyMax}>Buy max</button>
          );
      }

    } else { return null; }

  }

  render() {
    const { offerTakeType, handleSubmit, buyToken, sellToken, isVolumeGreaterThanOfferMax } = this.props;
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
              style={fieldStyle}
              name="price" component="input"
              format={formatValue}
              placeholder={0}
              normalize={normalize} disabled type="text"/>
            {priceToken}
          </div>
          <div style={box}>
            <span style={label}>Volume:</span>
            <Field
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
            /> {volumeToken}
            <div>
              {isVolumeGreaterThanOfferMax && <VolumeIsOverTheOfferMax offerMax={isVolumeGreaterThanOfferMax}/>}
            </div>
          </div>
          <div style={box}>
            <span style={label}>Total:</span>
            <span style={{position: 'absolute', left: 100 }}>
              {this.setMaxButton()}
            </span>
            <Field
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
            /> {totalToken}
          </div>
        </form>
      </div>
    );
  }

  componentDidMount() {
     setTimeout(()=> this.props.estimateGas(), 500)
  }
}

OfferTakeForm.displayName = 'OfferTakeForm';
OfferTakeForm.propTypes = propTypes;
OfferTakeForm.defaultProps = defaultProps;

export function mapStateToProps(state) {
  return {
    activeOfferTakeOfferData: offerTakes.activeOfferTakeOfferData(state),
    buyToken: offerTakes.activeOfferTakeBuyToken(state),
    sellToken: offerTakes.activeOfferTakeSellToken(state),
    offerTakeType: offerTakes.activeOfferTakeType(state),
    activeTradingPairPrecision: tokens.precision(state),
    isVolumeGreaterThanOfferMax: offerTakes.isVolumeGreaterThanOfferMax(state),
    activeBaseTokenBalance: balances.activeBaseTokenBalance(state)
  };
}

export function mapDispatchToProps(dispatch) {
  const actions = {
    volumeFieldValueChanged: offerTakesReducer.actions.volumeFieldValueChangedEpic,
    totalFieldValueChanged:  offerTakesReducer.actions.totalFieldValueChangedEpic,
    buyMax: offerTakesReducer.actions.buyMaxEpic,
    sellMax: offerTakesReducer.actions.sellMaxEpic,
  };
  return { actions: bindActionCreators(actions, dispatch) };
}

export default connect(mapStateToProps, mapDispatchToProps)(
  reduxForm({ form: 'takeOffer' })(OfferTakeForm)
);

