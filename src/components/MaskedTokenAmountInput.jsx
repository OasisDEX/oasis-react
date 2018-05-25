import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
import MaskedInput from 'react-text-mask';
import createNumberMask from 'text-mask-addons/dist/createNumberMask';

const propTypes = PropTypes && {
};
const defaultProps = {};

class MaskedTokenAmountInput extends PureComponent {
  render() {
    const newProps = {...this.props.input};

    // console.log(newProps);

    newProps.onChange = (event) => {
      // console.log("onChange", event.target.value);
      this.props.input.onChange(event.target.value.replace(/,/g, ''));
    };

    newProps.onBlur = (event) => {
      // console.log("onBlur", event.target.value);
      this.props.input.onBlur(event.target.value.replace(/,/g, ''));
    };

    return (
        <MaskedInput
          autoComplete='off'
          mask={createNumberMask({ allowDecimal: true, decimalLimit: 5, prefix: '' })}
          {...newProps }/>
    );
  }
}

MaskedTokenAmountInput.displayName = 'MaskedTokenAmountInput';
MaskedTokenAmountInput.propTypes = propTypes;
MaskedTokenAmountInput.defaultProps = defaultProps;
export default MaskedTokenAmountInput;
