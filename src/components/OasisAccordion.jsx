import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
// import ImmutablePropTypes from 'react-immutable-proptypes';

import styles from './OasisAccordion.scss';
import CSSModules from 'react-css-modules';
import FlexBox from './FlexBox';


const propTypes = PropTypes && {
  heading: PropTypes.node.isRequired,
  children: PropTypes.node.isRequired,
  isOpen: PropTypes.bool
};
const defaultProps = {};


class OasisAccordion extends PureComponent {
  constructor(props) {
    super(props);
    this.state = { isOpen: props.isOpen };
    this.toggle = this.toggle.bind(this);
  }

  toggle() {
    this.setState(prevState => ({ isOpen: !prevState.isOpen}) )
  }

  toggleSection() {
    return this.state.isOpen ?
      ( <span onClick={this.toggle}>[-]</span>) : (<span onClick={this.toggle}>[+]</span>);
  }

  render() {
    return (
      <div>
        <FlexBox justifyContent="space-between">
          {this.toggleSection()}
          <div>
            {this.props.heading}
          </div>
        </FlexBox>
        <div>
          {this.state.isOpen && this.props.children}
        </div>
      </div>
    );
  }


  componentWillUpdate (nextProps) {
    if (this.props.isOpen !== nextProps.isOpen) {
      this.setState({isOpen: nextProps.isOpen})
    }
  }
}

OasisAccordion.displayName = 'OasisAccordion';
OasisAccordion.propTypes = propTypes;
OasisAccordion.defaultProps = defaultProps;
export default CSSModules(OasisAccordion, styles);
