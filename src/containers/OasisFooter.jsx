import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
// import ImmutablePropTypes from 'react-immutable-proptypes';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import styles from './OasisFooter.scss';
import CSSModules from 'react-css-modules';

const propTypes = PropTypes && {
  actions: PropTypes.object,
};


const sections = [
  {
    // header: "Information",
    links: [
      {
        label: 'Project',
        url: 'https://github.com/OasisDEX/oasis-react',
      },
      // {
      //   label: 'Documentation',
      //   url: 'https://github.com/MakerDAO/maker-market/wiki',
      // },
      // {
      //   label: 'Market Data',
      //   url: 'https://makerdao.github.io/markets/',
      // },
    ]
  },
  {
    // header: "MakerDAO",
    links: [
      {
        label: 'Legal',
        url: '/OasisToS.pdf',
      },
      // {
      //   label: 'Chat',
      //   url: 'https://chat.makerdao.com/',
      // },
      // {
      //   label: 'Reddit',
      //   url: 'https://www.reddit.com/r/MakerDAO/',
      // },
    ]
  },
  {
    // header: "OasisDex",
    links: [
      {
        label: 'Report Issues',
        url: 'https://github.com/OasisDEX/oasis-react/issues/new',
      },
    ]
  },
];

export class OasisFooterWrapper extends PureComponent {
  render() {
    const rowClassNames = `row ${styles.OasisFooter} ${window.mist ? styles.MistBrowser : ''}`;
    return (
      <div className={rowClassNames}>
        {sections.map((section, index) => (
          <div key={index}>
            <div className="row">
              <div className={styles.LinksSection}>
                {/*<h4 className={styles.Heading}>{section.header}</h4>*/}
                {
                  section.links.map((link, index) =>
                    <a
                      rel="noopener noreferrer" className={styles.Link} key={index} href={link.url} target="_blank"
                    >{link.label}
                    </a>
                  )
                }
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }
}

export function mapStateToProps() {
  return {};
}

export function mapDispatchToProps(dispatch) {
  const actions = {};
  return {actions: bindActionCreators(actions, dispatch)};
}

OasisFooterWrapper.propTypes = propTypes;
OasisFooterWrapper.displayName = 'OasisFooterWrapper';
export default connect(mapStateToProps, mapDispatchToProps)(CSSModules(OasisFooterWrapper, styles));
