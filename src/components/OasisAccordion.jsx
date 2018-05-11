import React, { PureComponent } from "react";
import { PropTypes } from "prop-types";
// import ImmutablePropTypes from 'react-immutable-proptypes';

import styles from "./OasisAccordion.scss";
import CSSModules from "react-css-modules";
import FlexBox from "./FlexBox";
import OasisIcon from "./OasisIcon";

const propTypes = PropTypes && {
  heading: PropTypes.node.isRequired,
  children: PropTypes.node,
  isOpen: PropTypes.bool
};
const defaultProps = {
  children: (<div/>)
};

class OasisAccordion extends PureComponent {
  constructor(props) {
    super(props);
    this.state = { isOpen: props.isOpen };
    this.toggle = this.toggle.bind(this);
  }

  toggle() {
    this.setState(prevState => ({ isOpen: !prevState.isOpen }));
  }

  toggleSection() {
    return this.state.isOpen ? (
      <OasisIcon onClick={this.toggle} icon="arrowUp" />
    ) : (
      <OasisIcon onClick={this.toggle} icon="arrowDown" />
    );
  }

  render() {
    return (
      <div>
        <FlexBox justifyContent="space-between">
          {this.toggleSection()}
          <div>{this.props.heading}</div>
        </FlexBox>
        <div>{this.state.isOpen && this.props.children}</div>
      </div>
    );
  }

  componentWillUpdate(nextProps) {
    if (this.props.isOpen !== nextProps.isOpen) {
      this.setState({ isOpen: nextProps.isOpen });
    }
  }
}

OasisAccordion.displayName = "OasisAccordion";
OasisAccordion.propTypes = propTypes;
OasisAccordion.defaultProps = defaultProps;
export default CSSModules(OasisAccordion, styles);
