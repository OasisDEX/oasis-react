/* global shallow describe it expect */
/* eslint-disable import/first */
import React from 'react';
import Immutable from 'immutable';

import {
  OasisMakeOfferModalWrapper,
  mapStateToProps,
  mapDispatchToProps
} from './OasisMakeOfferModal';
import { shallow } from 'enzyme';
import { MAKE_BUY_OFFER } from '../constants';

describe('(Container) OasisMakeOfferModal', () => {
  const state = Immutable.fromJS(global.storeMock);
  const initialProps = mapStateToProps(state, { form: 'makeBuyOffer', offerMakeType: MAKE_BUY_OFFER });
  const initialActions = mapDispatchToProps(x => x);
  const props = {
    ...initialActions,
    ...initialProps,
    offerMakeType: MAKE_BUY_OFFER
  };

  it('will receive right props', () => {
    expect(initialProps).toMatchSnapshot();
  });


  it('will receive right actions', () => {
    expect(initialActions).toMatchSnapshot();
  });

  it('should render', () => {
    const wrapper = shallow(
      <OasisMakeOfferModalWrapper {...props}/>
    );
    expect(wrapper).toMatchSnapshot();
  });

});
