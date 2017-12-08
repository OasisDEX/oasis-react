import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
import MetamaskLogo from '../assets/dapphub_icn_metamask.svg';

import styles from './Locked.scss';
import CSSModules from 'react-css-modules';


const propTypes = PropTypes && {};
const defaultProps = {};


class Locked extends PureComponent {
  render() {
    return (
      <section styleName="LockedAccountSection">
        <img styleName="MetamaskLogo" alt="Metamask Fox Logo" src={MetamaskLogo}/>
        <hr styleName="Separator"/>
        <h2 styleName="Heading">METAMASK ACCOUNT LOCKED</h2>
        <p styleName="Message">
          You are trying to access OasisDEX without an unlocked account.<br/>
          Unlock your account on the Metamask Extension.
        </p>
        <hr styleName="Separator"/>

      </section>
    //  FOOTER PLACEHOLDER
    );
  }
}

Locked.displayName = 'Locked';
Locked.propTypes = propTypes;
Locked.defaultProps = defaultProps;
export default CSSModules(Locked, styles);
