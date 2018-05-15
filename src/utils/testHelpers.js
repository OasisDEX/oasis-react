import MockDate from 'mockdate';
import moment from 'moment-timezone';

export function mockDate(date, block) {
  try {
    MockDate.set(date);
    moment.tz.setDefault('UTC');
    return block.call();
  } finally {
    MockDate.reset();
    moment.tz.setDefault(moment.tz.guess());
  }
}
