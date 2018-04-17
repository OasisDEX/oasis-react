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
};



const inputStyle = { textAlign:'right', width: '100%' };

export class OasisTokenWrapFormWrapper extends PureComponent {

  constructor(props) {
    super(props);
    this.validate = this.validate.bind(this);
    this.setWrapMax = this.setWrapMax.bind(this);

  }

  validate(value) {
    const { activeUnwrappedTokenBalance } = this.props;
    if (!value) {
      return 'VALIDATE_ERROR/VALUE_IS_REQUIRED';
    }else if (web3.fromWei(activeUnwrappedTokenBalance).lt(value)) {
      return 'VALIDATE_ERROR/WRAP_AMOUNT_GREATER_THAN_TOKEN_BALANCE'
    }
  }

  setWrapMax() {
    this.props.actions.setWrapMax();
  }

  render() {
    const { valid, handleSubmit, activeUnwrappedToken } = this.props;
    return (
      <div>
        <form onSubmit={handleSubmit}>
          <div>
            <span >Amount:</span>
            <button type="button" onClick={this.setWrapMax}>wrap max</button>
            <Field
              style={inputStyle}
              required
              validate={this.validate}
              autoComplete="off"
              name="amount"
              component="input"
              placeholder={0}
              normalize={normalize} type="text"/>
            {activeUnwrappedToken}
          </div>
          <div>
            <button disabled={!valid}>Wrap</button>
          </div>
        </form>
      </div>
    );
  }
}

export function mapStateToProps(state) {
  return {
    activeUnwrappedTokenBalance: wrapUnwrap.activeUnwrappedTokenBalance(state, true)
  };
}
export function mapDispatchToProps(dispatch) {
  const actions = {
    setWrapMax: wrapUnwrapReducer.actions.setWrapMax
  };
  return { actions: bindActionCreators(actions, dispatch) };
}

OasisTokenWrapFormWrapper.propTypes = propTypes;
OasisTokenWrapFormWrapper.displayName = 'OasisTokenWrapForm';
export default connect(mapStateToProps, mapDispatchToProps)(
  reduxForm({
    form: 'wrapToken',
  })(OasisTokenWrapFormWrapper)
);
