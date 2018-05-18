/* global shallow describe it expect */
/* eslint-disable import/first */
import React from 'react';
import { fromJS }  from 'immutable';

import {
  OasisOfferBelowDustLimitWrapper,
  mapStateToProps,
  mapDispatchToProps
} from './OasisOfferBelowDustLimit';
import { shallow } from 'enzyme';
import { MAKE_BUY_OFFER } from '../constants';

describe('(Container) OasisOfferBelowDustLimit', () => {
  const state = fromJS(global.storeMock);
  const initialProps = mapStateToProps(state, { offerType: MAKE_BUY_OFFER });
  const initialActions = mapDispatchToProps(x => x);
  const props = {
    ...initialActions,
    ...initialProps,
    offerType: MAKE_BUY_OFFER
  };

  it('will receive right props', () => {
    expect(initialProps).toMatchSnapshot();
  });


  it('will receive right actions', () => {
    expect(initialActions).toMatchSnapshot();
  });

  it('should render', () => {
    const wrapper = shallow(
      <OasisOfferBelowDustLimitWrapper {...props}/>
    );
    expect(wrapper).toMatchSnapshot();
  });

});
