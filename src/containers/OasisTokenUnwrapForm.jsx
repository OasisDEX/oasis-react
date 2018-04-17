import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
// import ImmutablePropTypes from 'react-immutable-proptypes';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Field, reduxForm } from 'redux-form/immutable'
import { normalize } from '../utils/forms/offers';
import wrapUnwrap from '../store/selectors/wrapUnwrap';
import web3 from '../bootstrap/web3';
import wrapUnwrapReducer from '../store/reducers/wrapUnwrap';

const propTypes = PropTypes && {
  actions: PropTypes.object.isRequired,
  activeUnwrappedTokenBalance: PropTypes.string
};



const inputStyle = { textAlign:'right', width: '100%' };

export class OasisTokenUnwrapFormWrapper extends PureComponent {

  constructor(props) {
    super(props);
    this.validate = this.validate.bind(this);
    this.setUnwrapMax = this.setUnwrapMax.bind(this);

  }

  validate(value) {
    const { activeWrappedTokenBalance } = this.props;
    if (!value) {
      return 'VALIDATE_ERROR/VALUE_IS_REQUIRED';
    }else if (web3.fromWei(activeWrappedTokenBalance).lt(value)) {
      return 'VALIDATE_ERROR/WRAP_AMOUNT_GREATER_THAN_TOKEN_BALANCE'
    }
  }

  setUnwrapMax() {
    this.props.actions.setUnwrapMax();
  }

  render() {
    const { valid, handleSubmit, activeWrappedToken } = this.props;
    return (
      <div>
        <form onSubmit={handleSubmit}>
          <div>
            <span >Amount:</span>
            <button type="button" onClick={this.setUnwrapMax}>unwrap max</button>
            <Field
              style={inputStyle}
              required
              validate={this.validate}
              autoComplete="off"
              name="amount"
              component="input"
              placeholder={0}
              normalize={normalize} type="text"/>
            {activeWrappedToken}
          </div>
          <div>
            <button disabled={!valid}>Unwrap</button>
          </div>
        </form>
      </div>
    );
  }
}

export function mapStateToProps(state) {
  return {
    activeWrappedTokenBalance: wrapUnwrap.activeWrappedTokenBalance(state, true)
  };
}
export function mapDispatchToProps(dispatch) {
  const actions = {
    setUnwrapMax: wrapUnwrapReducer.actions.setUnwrapMax
  };
  return { actions: bindActionCreators(actions, dispatch) };
}

OasisTokenUnwrapFormWrapper.propTypes = propTypes;
OasisTokenUnwrapFormWrapper.displayName = 'OasisTokenUnwrapForm';
export default connect(mapStateToProps, mapDispatchToProps)(
  reduxForm({
    form: 'unwrapToken',
  })(OasisTokenUnwrapFormWrapper)
);
