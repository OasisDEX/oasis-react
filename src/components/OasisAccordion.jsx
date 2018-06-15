import React, { PureComponent } from "react";
import { PropTypes } from "prop-types";
// import ImmutablePropTypes from 'react-immutable-proptypes';

import styles from "./OasisAccordion.scss";
import CSSModules from "react-css-modules";
import FlexBox from "./FlexBox";
import OasisIcon from "./OasisIcon";
import InfoBox from "./InfoBox";

const propTypes = PropTypes && {
  heading: PropTypes.node.isRequired,
  children: PropTypes.node,
  isOpen: PropTypes.bool,
  disabled: PropTypes.bool
};
const defaultProps = {
  infoBoxSize: "md",
  className: "",
  children: <div />
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
    const {
      disabled,
      infoBoxSize,
      heading,
      children,
      className,
      ...props
    } = this.props;
    let childrenDiv = (
      <div className={`${styles.content} ${styles[infoBoxSize]}`}>
        {children}
      </div>
    );
    return (
      <InfoBox
        className={`${styles.accordion} ${className ? className : ""}`}
        vertical={true}
        size={infoBoxSize}
        {...props}
      >
        <FlexBox justifyContent="normal" alignItems="baseline">
          {!disabled ? this.toggleSection() : null}
          {heading}
        </FlexBox>
        {this.state.isOpen && children && childrenDiv}
      </InfoBox>
    );
  }

  UNSAFE_componentWillUpdate(nextProps) {
    if (nextProps.disabled) {
      this.setState({ isOpen: false });
    }
    if (this.props.isOpen !== nextProps.isOpen) {
      this.setState({ isOpen: nextProps.isOpen });
    }
  }
}

OasisAccordion.displayName = "OasisAccordion";
OasisAccordion.propTypes = propTypes;
OasisAccordion.defaultProps = defaultProps;
export default CSSModules(OasisAccordion, styles);
