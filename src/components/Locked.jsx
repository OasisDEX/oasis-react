import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
import MetamaskSVGLogo from '../assets/dapphub_icn_metamask.svg';
import MistSVGLogo from '../assets/icn-mist.svg';


import styles from './Locked.scss';
import CSSModules from 'react-css-modules';

import OasisFooter from '../containers/OasisFooter';
import { PROVIDER_TYPE_METAMASK, PROVIDER_TYPE_MIST } from '../constants';


const propTypes = PropTypes && {};
const defaultProps = {};


class Locked extends PureComponent {
  getNodeType(useLongForm) {
    const { activeNodeType } = this.props;
    switch (activeNodeType) {
      case PROVIDER_TYPE_METAMASK: return (<b>{ !useLongForm ? "Metamask": "Metamask Extension" }</b>);
      case PROVIDER_TYPE_MIST:
        return (<b>{ !useLongForm ? "Mist" : "Mist Browser" }</b>);
    }
  }

  renderLogo() {
    const { activeNodeType } = this.props;
    switch (activeNodeType) {
      case PROVIDER_TYPE_METAMASK:
        return (
          <img className={styles.Logo} alt="Metamask Fox Logo" src={MetamaskSVGLogo}/>
        );
      case PROVIDER_TYPE_MIST:
        return (
          <img className={styles.Logo} alt="Mist Browser Logo" src={MistSVGLogo}/>
        );
    }
  }

  render() {
    return (
      <section className={styles.LockedAccountSection}>
        {this.renderLogo()}
        <hr className={styles.Separator}/>
        <h2 className={styles.Heading}>{this.getNodeType()} account locked</h2>
        <p className={styles.Message}>
          You are trying to access OasisDEX without an unlocked account.<br/>
          Unlock your account on the {this.getNodeType(true)}.
        </p>
        <hr className={styles.Separator}/>
        <OasisFooter/>
      </section>
    );
  }
}

Locked.displayName = 'Locked';
Locked.propTypes = propTypes;
Locked.defaultProps = defaultProps;
export default CSSModules(Locked, styles);
