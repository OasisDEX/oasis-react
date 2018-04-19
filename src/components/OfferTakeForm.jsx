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

import OasisButton from "../components/OasisButton";

import styles from './OfferTakeForm.scss';
import tableStyles from "../styles/modules/_table.scss";
import CSSModules from 'react-css-modules';

/**
 * Remove this styling TODO
 */
// const box = { border: '1px solid black', padding: 20, marginTop: 20 };
// const label = { width: '30%', display: 'inline-block' };
const fieldStyle = { textAlign: 'right' };




const propTypes = PropTypes && {
  activeOfferTakeOfferData: ImmutablePropTypes.map.isRequired,
  buyToken: PropTypes.string.isRequired,
  sellToken: PropTypes.string.isRequired,
  offerTakeType: PropTypes.string.isRequired,
  activeTradingPairPrecision: PropTypes.number.isRequired,
  isVolumeGreaterThanOfferMax: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.string
  ]).isRequired,
  activeBaseTokenBalance: PropTypes.string.isRequired
};


const defaultProps = {};


const VolumeIsOverTheOfferMax = ({ offerMax }) => (
  <div>
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
            <OasisButton
                className={tableStyles.inputBtn}
                type="button"
                color="success"
                size="xs"
                onClick={this.onSetSellMax}
            >Sell max
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
            >Buy max
            </OasisButton>
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
      <form onSubmit={handleSubmit}>
        <table className={tableStyles.table}>
          <tbody>
          <tr>
            <th>Price</th>
            <td className={tableStyles.withInput}>
              <Field
                autoComplete="off"
                style={fieldStyle}
                name="price" component="input"
                format={formatValue}
                placeholder={0}
                normalize={normalize} disabled type="text"/>
            </td>
            <td className={tableStyles.currency}>
              {priceToken}
            </td>
          </tr>
          <tr>
            <th>Amount</th>
            <td className={tableStyles.withInput}>
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
              />
              <div className={styles.errorMessage}>
                {isVolumeGreaterThanOfferMax && <VolumeIsOverTheOfferMax offerMax={isVolumeGreaterThanOfferMax}/>}
              </div>
            </td>
            <td className={tableStyles.currency}>
              {volumeToken}
            </td>
          </tr>
          <tr>
            <th>Total</th>
            <td className={tableStyles.withInput}>
              <div className={tableStyles.inputGroup}>
                {this.setMaxButton()}
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
                />
              </div>
            </td>
            <td className={tableStyles.currency}>
                {totalToken}
            </td>
          </tr>
          </tbody>
        </table>
        </form>
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
  reduxForm({ form: 'takeOffer' })(CSSModules(OfferTakeForm,{styles, tableStyles}, { allowMultiple: true}))
);

