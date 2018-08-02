import React, { PureComponent } from "react";
import { PropTypes } from "prop-types";
// import ImmutablePropTypes from 'react-immutable-proptypes';

import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { Popper, Manager, Reference } from "react-popper";

const popperStyle = (style) => ({
  ...style,
  padding: "10px",
  background: "#000",
  color: "#fff",
  zIndex: "100"
});

import styles from './OasisSignificantDigits.scss';
import CSSModules from 'react-css-modules';

const propTypes = PropTypes && {
  text: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.node
  ]).isRequired,
  children: PropTypes.node.isRequired,
  placement: PropTypes.string
};

const defaultProps = {
  placement: 'top'
};

export class OasisTooltip extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    const { placement, children, text } = this.props;
    const isXXS = window.innerWidth < 440;
    return (
      <Manager>
        <Reference>
          {({ ref }) => (
            <span
              ref={ref}
              onMouseOver={() => this.setState({ showPopup: true })}
              onMouseOut={() => this.setState({ showPopup: false })}
            >{children}
            </span>
          )}
        </Reference>
        {(this.state.showPopup && !isXXS) && (
          <Popper placement={placement}>
            {({ ref, style, placement }) => (
              <div
                ref={ref}
                style={popperStyle(style)}
                data-placement={placement}
              >
                {text}
              </div>
            )}
          </Popper>
        )}
      </Manager>
    );
  }
}

export function mapStateToProps() {
  return {};
}
export function mapDispatchToProps(dispatch) {
  const actions = {};
  return { actions: bindActionCreators(actions, dispatch) };
}

OasisTooltip.propTypes = propTypes;
OasisTooltip.displayName = "OasisTooltip";
OasisTooltip.defaultProps = defaultProps;
export default connect(mapStateToProps, mapDispatchToProps)(
  CSSModules(OasisTooltip, styles)
);
