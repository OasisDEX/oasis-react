/* global shallow describe it expect */
/* eslint-disable import/first */
import React from 'react';
import { fromJS } from 'immutable';

import {
  OasisTakeOfferModalWrapper,
  mapStateToProps,
  mapDispatchToProps
} from './OasisTakeOfferModal';
import { shallow } from 'enzyme';
import { TAKE_BUY_OFFER } from '../store/reducers/offerTakes';

describe('(Container) OasisTakeOfferModal', () => {
  const state = fromJS(global.storeMock);
  const initialProps = mapStateToProps(state);
  const initialActions = mapDispatchToProps(x => x);
  const props = {
    ...initialActions,
    ...initialProps,
    offerTakeType: TAKE_BUY_OFFER
  };

  it('will receive right props', () => {
    expect(initialProps).toMatchSnapshot();
  });


  it('will receive right actions', () => {
    expect(initialActions).toMatchSnapshot();
  });

  it('should render', () => {
    const wrapper = shallow(
      <OasisTakeOfferModalWrapper {...props}/>
    );
    expect(wrapper).toMatchSnapshot();
  });

});
