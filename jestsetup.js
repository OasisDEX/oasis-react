import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

global.requestAnimationFrame = callback => {
  setTimeout(callback, 0);
};

configure({ adapter: new Adapter() });