import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
import MaskedInput from 'react-text-mask';
import createNumberMask from 'text-mask-addons/dist/createNumberMask';

const propTypes = PropTypes && {
};
const defaultProps = {};

class MaskedTokenAmountInput extends PureComponent {

  forwardEvent(callback) {
    return (event) => {
      const value = event.target.value;
      // console.log("forwardEvent", value);
      callback(value.replace(/,/g, ''));
    };
  }

  render() {
    const newProps = {...this.props.input};

    newProps.disabled = this.props.disabled;
    newProps.onChange = this.forwardEvent(this.props.input.onChange);
    newProps.onBlur = this.forwardEvent(this.props.input.onBlur);

    return (
        <MaskedInput
          autoComplete='off'
          mask={createNumberMask({ allowDecimal: true, integerLimit: 15, decimalLimit: 5, prefix: '' })}
          guide={true}
          placeholderChar={' '}
          placeholder={'0'}
          {...newProps }/>
    );
  }
}

MaskedTokenAmountInput.displayName = 'MaskedTokenAmountInput';
MaskedTokenAmountInput.propTypes = propTypes;
MaskedTokenAmountInput.defaultProps = defaultProps;
export default MaskedTokenAmountInput;
