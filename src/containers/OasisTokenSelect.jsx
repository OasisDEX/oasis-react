import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
// import ImmutablePropTypes from 'react-immutable-proptypes';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import tokens from '../store/selectors/tokens';
import tokenSelectorsReducer from '../store/reducers/tokenSelectors';
import tokenSelectors from '../store/selectors/tokenSelectors';
import OasisSelect from "../components/OasisSelect";
import widgetFrameStyles from "./OasisWidgetFrame.scss"

const propTypes = PropTypes && {
  actions: PropTypes.object.isRequired,
  disabled: PropTypes.bool,
  onChange: PropTypes.func
};

export class OasisTokenSelectWrapper extends PureComponent {
  constructor(props) {
    super(props);
    this.onOptionSelected = this.onOptionSelected.bind(this);
    props.actions.registerComponent(
      props.name, props.defaultToken
    );
  }

  onOptionSelected(e) {
    const selectedValue = e.target.value;
    const { actions, name, onChange } = this.props;
    actions.tokenSelected(name, selectedValue);
    onChange && onChange(selectedValue);
  }

  getOptions() {
    const { tokens } = this.props;
    return tokens.map(
      (token, idx) => (
        <option key={idx} value={token}>{token}</option>
      ),
    );
  }

  render() {
    const { tokens = [], defaultToken, selected, disabled } = this.props;
    const selectedToken = selected || defaultToken;
    if (tokens) {
      return (
          <OasisSelect
            disabled={disabled}
            name={this.props.name}
            value={selectedToken}
            onChange={this.onOptionSelected}
            className={widgetFrameStyles.WidgetFloatRightButton}
          >
            {this.getOptions()}
          </OasisSelect>
      );
    } else {
      return (
        <div>Loading</div>
      );
    }
  }

  componentWillUnmount() {
    this.props.actions.unregisterComponent(
      this.props.name
    );
  }

}

export function mapStateToProps(state, props) {
  return {
    tokens: tokens.allTokens(state),
    defaultToken: tokens.defaultBaseToken(state),
    selected: tokenSelectors.selectedToken(state, props.name)
  };
}

export function mapDispatchToProps(dispatch) {
  const actions = {
    registerComponent: tokenSelectorsReducer.actions.registerTokenSelector,
    unregisterComponent: tokenSelectorsReducer.actions.unregisterTokenSelector,
    tokenSelected: tokenSelectorsReducer.actions.tokenSelected,
  };

  return { actions: bindActionCreators(actions, dispatch) };
}

OasisTokenSelectWrapper.propTypes = propTypes;
OasisTokenSelectWrapper.displayName = 'OasisTokenSelect';
export default connect(mapStateToProps, mapDispatchToProps)(OasisTokenSelectWrapper);
