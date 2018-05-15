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
  isOpen: PropTypes.bool
};
const defaultProps = {
  infoBoxSize: 'md',
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
    const { infoBoxSize } = this.props;
    let childrenDiv = <div
        className={`${styles.content} ${styles[infoBoxSize]}`}>
      {this.props.children}</div>;
    return (
      <InfoBox className={styles.accordion} vertical={true} size={infoBoxSize}>
        <FlexBox justifyContent="normal" alignItems="baseline">
          {this.toggleSection()}
          {this.props.heading}
        </FlexBox>
        {this.state.isOpen && this.props.children && childrenDiv}
      </InfoBox>
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
