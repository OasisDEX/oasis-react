import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
// import ImmutablePropTypes from 'react-immutable-proptypes';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Manager, Reference, Popper } from 'react-popper';

const propTypes = PropTypes && {
  actions: PropTypes.object.isRequired
};

export class OasisPopupWrapper extends PureComponent {
  render() {
    return (
      <div>
        <Manager>
          <Reference>
            {({ ref }) => (
              <button type="button" ref={ref}>
                Reference element
              </button>
            )}
          </Reference>
          <Popper placement="right">
            {({ ref, style, placement, arrowProps }) => (
              <div ref={ref} style={style} data-placement={placement}>
                Popper element
                <div ref={arrowProps.ref} style={arrowProps.style} />
              </div>
            )}
          </Popper>
        </Manager>
        );
      </div>
    );
  }
}

export function mapStateToProps(state) {
  return {};
}
export function mapDispatchToProps(dispatch) {
  const actions = {};
  return { actions: bindActionCreators(actions, dispatch) };
}

OasisPopupWrapper.propTypes = propTypes;
OasisPopupWrapper.displayName = 'OasisPopup';
export default connect(mapStateToProps, mapDispatchToProps)(OasisPopupWrapper);
