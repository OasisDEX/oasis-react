/* global shallow describe it expect */
/* eslint-disable import/first */
import React from 'react';
import { shallow } from 'enzyme';
import { OasisTable } from './OasisTable';


describe('(Component) OasisTable', () => {
  it('should render with example props', () => {
    const props = {
      col: [
        { heading: 'Pair', key: 'tradingPair' },
        { heading: 'Price', key: 'price' },
        { heading: 'Weekly volume', key: 'weeklyVolume' },
      ],
      rows: [
        {
          tradingPair: 'MKR / W-ETH',
          price: 'N/A',
          weeklyVolume: '0.00'
        },
        {
          tradingPair: 'W-ETH / SAI',
          price: '0.52',
          weeklyVolume: '2.43'
        },
        {
          tradingPair: 'MKR / SAI',
          price: '1.12',
          weeklyVolume: '0.00'
        },
      ]
    };
    const wrapper = shallow(
      <OasisTable {...props}/>
    );

    expect(wrapper).toMatchSnapshot();
  });
});
