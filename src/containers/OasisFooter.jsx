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
    header: "Information",
    links: [
      {
        label: 'Documentation',
        url: 'https://github.com/MakerDAO/maker-market/wiki',
      },
      {
        label: 'Market Data',
        url: 'https://makerdao.github.io/markets/',
      },
    ]
  },
  {
    header: "MakerDAO",
    links: [
      {
        label: 'Chat',
        url: 'https://chat.makerdao.com/channel/maker-market',
      },
      {
        label: 'Reddit',
        url: 'https://www.reddit.com/r/MakerDAO/',
      },
    ]
  },
  {
    header: "OasisDex",
    links: [
      {
        label: 'Report Issues',
        url: 'https://github.com/OasisDEX/oasis/issues/new',
      },
      {
        label: 'Project',
        url: 'https://github.com/OasisDEX/oasis/projects/1',
      },
    ]
  },
];

export class OasisFooterWrapper extends PureComponent {
  render() {
    return (
      <div styleName="OasisFooter" className="row">
        {sections.map((section, index) => (
          <div key={index}>
            <div className="row">
              <div styleName="LinksSection">
                <h4 styleName="Heading">{section.header}</h4>
                {
                  section.links.map((link, index) =>
                    <a rel="noopener noreferrer" styleName="Link" key={index} href={link.url} target="_blank">{link.label}</a>
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
